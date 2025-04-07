
#!/usr/bin/env python3
"""
Speech Server for SweetTrivia using Google Cloud Text-to-Speech
This server provides speech capabilities for both local web browsers and Raspberry Pi.

Required packages:
- websockets
- google-cloud-texttospeech
"""

import asyncio
import json
import os
import signal
import subprocess
import sys
import tempfile
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import websockets
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('speech-server')

# Flag to indicate if Google Cloud libraries are available
google_cloud_available = True

# Try to import Google Cloud TTS library
try:
    from google.cloud import texttospeech
    logger.info("Google Cloud Text-to-Speech library loaded successfully")
except ImportError:
    google_cloud_available = False
    logger.warning("Google Cloud Text-to-Speech library not found. Will use espeak-ng fallback.")

# Ports to try for WebSocket server
WEBSOCKET_PORTS = [8765, 8766, 8767, 8768, 8769, 8770]

# Default voice settings for Google Cloud TTS
DEFAULT_VOICE = "en-US-Neural2-F"
DEFAULT_LANGUAGE_CODE = "en-US"
DEFAULT_PITCH = 0
DEFAULT_SPEAKING_RATE = 1.0

# Path for temporary audio files
TEMP_DIR = tempfile.gettempdir()

# Store active audio processes
active_processes = []

# Function to initialize Google Cloud TTS client
def init_google_cloud_tts():
    if not google_cloud_available:
        return None
    
    try:
        # Check for credentials
        if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
            logger.warning("GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
            logger.warning("Please set it to the path of your Google Cloud credentials JSON file")
            logger.warning("Example: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json")
            return None
            
        # Initialize client
        client = texttospeech.TextToSpeechClient()
        logger.info("Google Cloud TTS client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Google Cloud TTS: {e}")
        return None

# Google Cloud TTS client
google_tts_client = init_google_cloud_tts()

# Function to speak text using Google Cloud TTS
async def speak_with_google_cloud_tts(text, voice_name=DEFAULT_VOICE, language_code=DEFAULT_LANGUAGE_CODE,
                             pitch=DEFAULT_PITCH, speaking_rate=DEFAULT_SPEAKING_RATE):
    """Synthesizes speech using Google Cloud Text-to-Speech API."""
    
    if not google_tts_client:
        logger.warning("Google Cloud TTS not available, falling back to espeak-ng")
        return await speak_with_espeak(text)
        
    try:
        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Build the voice request
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name,
        )

        # Select the type of audio file to return
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            pitch=pitch,
            speaking_rate=speaking_rate,
        )

        # Perform the text-to-speech request
        response = google_tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # Generate a temporary file for the audio
        audio_file = os.path.join(TEMP_DIR, f"speech_{int(time.time())}.mp3")
        
        # Write the audio content to the temporary file
        with open(audio_file, "wb") as out:
            out.write(response.audio_content)
            logger.info(f'Audio content written to "{audio_file}"')

        # Play the audio file
        process = None
        if sys.platform == "darwin":  # macOS
            process = subprocess.Popen(["afplay", audio_file])
        elif sys.platform == "linux" or sys.platform == "linux2":
            # Use mpg123 for MP3 playback on Linux
            try:
                process = subprocess.Popen(["mpg123", "-q", audio_file])
            except FileNotFoundError:
                logger.error("mpg123 not found. Please install it: sudo apt-get install mpg123")
                # Try with mplayer as alternative
                try:
                    process = subprocess.Popen(["mplayer", "-really-quiet", audio_file])
                except FileNotFoundError:
                    logger.error("Neither mpg123 nor mplayer found. Cannot play audio.")
                    return False
        else:
            logger.error(f"Unsupported platform: {sys.platform}")
            return False
            
        # Add to active processes
        if process:
            active_processes.append(process)
            
            # Wait for the process to complete
            process.wait()
            
            # Clean up
            if process in active_processes:
                active_processes.remove(process)
            
            # Delete the temporary file
            try:
                os.remove(audio_file)
            except:
                pass
                
            return True
    except Exception as e:
        logger.error(f"Google Cloud TTS error: {e}")
        # Fall back to espeak-ng
        logger.info("Falling back to espeak-ng")
        return await speak_with_espeak(text)

# Function to speak text using espeak-ng (fallback for Raspberry Pi)
async def speak_with_espeak(text, pitch=50, speed=150, amplitude=200):
    """Speaks the provided text using espeak-ng."""
    try:
        cmd = ["espeak-ng", text, "-p", str(pitch), "-s", str(speed), "-a", str(amplitude)]
        process = subprocess.Popen(cmd)
        active_processes.append(process)
        
        # Wait for the process to complete
        process.wait()
        
        # Clean up
        if process in active_processes:
            active_processes.remove(process)
        
        return True
    except Exception as e:
        logger.error(f"espeak-ng error: {e}")
        return False

# Function to stop any active speech
def stop_speech():
    """Stops any ongoing speech."""
    global active_processes
    for process in active_processes[:]:
        try:
            process.terminate()
            active_processes.remove(process)
        except:
            pass

# WebSocket server handler
async def handle_websocket(websocket, path):
    """Handles WebSocket connections for speech commands."""
    client_address = websocket.remote_address
    logger.info(f"Client connected from {client_address}")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get("action", "")
                
                if action == "speak":
                    text = data.get("text", "")
                    mode = data.get("mode", "google_cloud_tts")
                    
                    if not text:
                        await websocket.send(json.dumps({"status": "speech_failed", "error": "No text provided"}))
                        continue
                    
                    logger.info(f"Speaking: {text[:30]}..." if len(text) > 30 else f"Speaking: {text}")
                    
                    # Stop any ongoing speech first
                    stop_speech()
                    
                    # Use Google Cloud TTS if requested and available
                    if mode == "google_cloud_tts" and google_cloud_available and google_tts_client:
                        success = await speak_with_google_cloud_tts(text)
                    else:
                        # Fall back to espeak-ng
                        success = await speak_with_espeak(text)
                    
                    if success:
                        await websocket.send(json.dumps({"status": "speech_completed"}))
                    else:
                        await websocket.send(json.dumps({"status": "speech_failed", "error": "Speech synthesis failed"}))
                
                elif action == "stop":
                    logger.info("Stopping speech")
                    stop_speech()
                    await websocket.send(json.dumps({"status": "speech_stopped"}))
                
                elif action == "ping":
                    logger.info("Received ping")
                    await websocket.send(json.dumps({"status": "pong"}))
                
                else:
                    logger.warning(f"Unknown action: {action}")
                    await websocket.send(json.dumps({"status": "error", "error": "Unknown action"}))
            
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send(json.dumps({"status": "error", "error": "Invalid JSON"}))
            
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await websocket.send(json.dumps({"status": "error", "error": str(e)}))
    
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client {client_address} disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

# Start the WebSocket server
async def start_websocket_server(port):
    """Attempts to start the WebSocket server on the specified port."""
    try:
        server = await websockets.serve(handle_websocket, "0.0.0.0", port)
        logger.info(f"Speech server started successfully! Listening on ws://0.0.0.0:{port}")
        
        # Also listen on localhost for local connections
        local_ip = "localhost"
        logger.info(f"Also accessible at ws://{local_ip}:{port}")
        
        # Get all network interfaces
        try:
            import socket
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            logger.info(f"Also accessible at ws://{local_ip}:{port}")
        except:
            pass
            
        return server
    except OSError as e:
        logger.warning(f"Could not start server on port {port}: {e}")
        return None

# Handle shutdown gracefully
def signal_handler(sig, frame):
    logger.info("Shutting down speech server...")
    stop_speech()
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Main function
async def main():
    """Main function to start the server."""
    logger.info("Starting speech server...")
    
    # Check for espeak-ng installation (fallback)
    try:
        subprocess.run(["espeak-ng", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        logger.info("espeak-ng is installed (available as fallback)")
    except:
        logger.warning("espeak-ng is not installed. Please install it for fallback capability:")
        logger.warning("sudo apt-get install -y espeak-ng")
    
    # Check for Google Cloud TTS
    if not google_cloud_available:
        logger.warning("Google Cloud Text-to-Speech library not available.")
        logger.warning("To install: pip install google-cloud-texttospeech")
    elif not google_tts_client:
        logger.warning("Google Cloud Text-to-Speech client initialization failed.")
    else:
        logger.info("Google Cloud Text-to-Speech is ready.")
        
    # Try to start server on available port
    server = None
    for port in WEBSOCKET_PORTS:
        server = await start_websocket_server(port)
        if server:
            break
    
    if not server:
        logger.error("Failed to start WebSocket server on any port. Exiting.")
        sys.exit(1)
    
    # Keep the server running
    while True:
        await asyncio.sleep(3600)  # Sleep for an hour

# Run the main function
if __name__ == "__main__":
    asyncio.run(main())
