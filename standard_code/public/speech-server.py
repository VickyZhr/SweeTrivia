
#!/usr/bin/env python3
"""
Simple WebSocket server for text-to-speech on Raspberry Pi
Save this file as speech-server.py in your Raspberry Pi

Installation:
1. Install required packages:
   sudo apt-get update
   sudo apt-get install -y espeak-ng python3-pip
   pip3 install websockets

2. Make this file executable:
   chmod +x speech-server.py

3. Run the server:
   ./speech-server.py
"""

import asyncio
import json
import logging
import subprocess
import sys
import websockets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

# Global variable for the current speech process
current_process = None

# WebSocket server port
PORT = 8765

# Function to speak text using espeak-ng with a female voice
async def speak_text(text):
    global current_process
    
    try:
        # Stop any currently running speech
        stop_speech()
        
        # Use espeak-ng with a female voice
        # -v en+f3 selects English female voice
        cmd = ['espeak-ng', '-v', 'en+f3', text, '-p', '50', '-s', '150', '-a', '200']
        logging.info(f"Speaking: {text[:30]}{'...' if len(text) > 30 else ''}")
        
        # Run the espeak-ng command
        current_process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for it to finish
        stdout, stderr = await current_process.communicate()
        
        if stderr:
            logging.warning(f"espeak-ng stderr: {stderr.decode().strip()}")
        
        if current_process.returncode != 0:
            logging.error(f"espeak-ng error: {stderr.decode().strip()}")
            return False
        
        current_process = None
        return True
    except Exception as e:
        logging.error(f"Error speaking text: {e}")
        return False

# Function to stop any current speech
def stop_speech():
    global current_process
    if current_process:
        try:
            current_process.terminate()
            logging.info("Stopped current speech")
        except Exception as e:
            logging.error(f"Error stopping speech: {e}")
        current_process = None

# WebSocket handler
async def handle_connection(websocket, path):
    try:
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logging.info(f"New client connected from {client_info}")
        
        # Send a welcome message
        await websocket.send(json.dumps({"status": "connected", "message": "Speech server ready"}))
        
        async for message in websocket:
            try:
                # Parse the JSON message
                data = json.loads(message)
                logging.info(f"Received message: {data}")
                
                # Handle 'speak' action
                if data.get('action') == 'speak' and 'text' in data:
                    text = data['text']
                    success = await speak_text(text)
                    await websocket.send(json.dumps({"status": "speech_completed" if success else "speech_failed"}))
                
                # Handle 'stop' action
                elif data.get('action') == 'stop':
                    stop_speech()
                    await websocket.send(json.dumps({"status": "speech_stopped"}))
                
                # Handle 'ping' action for connection testing
                elif data.get('action') == 'ping':
                    await websocket.send(json.dumps({"status": "pong"}))
                
            except json.JSONDecodeError:
                logging.error(f"Invalid JSON received: {message}")
                await websocket.send(json.dumps({"error": "invalid_json"}))
            except Exception as e:
                logging.error(f"Error processing message: {e}")
                await websocket.send(json.dumps({"error": str(e)}))
    except websockets.exceptions.ConnectionClosed:
        logging.info(f"Client {client_info} disconnected")
    except Exception as e:
        logging.error(f"Connection handler error: {e}")
    finally:
        stop_speech()  # Ensure speech is stopped when client disconnects

# Test espeak-ng at startup
async def test_espeak():
    try:
        logging.info("Testing espeak-ng...")
        process = await asyncio.create_subprocess_exec(
            'espeak-ng', '-v', 'en+f3', 'Speech server started successfully', 
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logging.info("espeak-ng test successful")
            return True
        else:
            logging.error(f"espeak-ng test failed: {stderr.decode().strip()}")
            return False
    except Exception as e:
        logging.error(f"Error testing espeak-ng: {e}")
        return False

# Main function
async def main():
    # Test espeak-ng
    espeak_working = await test_espeak()
    if not espeak_working:
        logging.warning("espeak-ng test failed. Speech output may not work correctly.")
    
    # Start the WebSocket server
    try:
        server = await websockets.serve(handle_connection, "0.0.0.0", PORT)
        
        logging.info("=" * 50)
        logging.info("Speech server started successfully!")
        logging.info(f"Listening on ws://0.0.0.0:{PORT}")
        logging.info("=" * 50)
        
        # Keep the server running
        await server.wait_closed()
    except Exception as e:
        logging.error(f"Error starting WebSocket server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        # Print a clear startup message
        print("\n" + "=" * 60)
        print(" SWEET TRIVIA SPEECH SERVER ".center(60, "="))
        print("=" * 60 + "\n")
        
        print("Starting speech server...")
        print("IMPORTANT: Keep this terminal window open while playing the game!\n")
        
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
        stop_speech()  # Ensure we stop any running speech
    except Exception as e:
        logging.error(f"Server error: {e}")
