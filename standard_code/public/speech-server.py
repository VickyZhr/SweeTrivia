
#!/usr/bin/env python3
"""
Simple WebSocket server for espeak-ng integration on Raspberry Pi
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

It will listen for WebSocket connections on port 8765
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import websockets
import signal
import time
import socket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

# Global variable to store the current speech process
current_process = None

# Check if espeak-ng is installed
try:
    subprocess.run(['which', 'espeak-ng'], check=True, stdout=subprocess.PIPE)
    logging.info("espeak-ng is installed")
except subprocess.CalledProcessError:
    logging.error("espeak-ng is not installed. Please install it with: sudo apt-get install -y espeak-ng")
    sys.exit(1)

# Function to speak text using espeak-ng
async def speak_text(text):
    global current_process
    
    try:
        # Stop any currently running speech
        stop_speech()
        
        # Use espeak-ng with good parameters for Raspberry Pi
        cmd = ['espeak-ng', text, '-p', '50', '-s', '150', '-a', '200']
        logging.info(f"Speaking: {text[:30]}{'...' if len(text) > 30 else ''}")
        
        # Run the espeak-ng command
        current_process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for it to finish
        stdout, stderr = await current_process.communicate()
        current_process = None
        
        if current_process and current_process.returncode != 0:
            logging.error(f"espeak-ng error: {stderr.decode().strip()}")
            return False
        
        return True
    except Exception as e:
        logging.error(f"Error speaking text: {e}")
        return False

# Function to stop any current speech
def stop_speech():
    global current_process
    if current_process:
        try:
            # Try to terminate the process gracefully
            current_process.terminate()
            # Give it a moment to terminate
            time.sleep(0.1)
            # If still running, force kill
            if current_process.returncode is None:
                os.kill(current_process.pid, signal.SIGKILL)
            logging.info("Stopped current speech")
        except Exception as e:
            logging.error(f"Error stopping speech: {e}")
        current_process = None

# WebSocket handler
async def handle_connection(websocket, path):
    try:
        client_info = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logging.info(f"New client connected from {client_info}")
        
        # Send a welcome message to confirm the connection works
        try:
            await websocket.send(json.dumps({"status": "connected", "message": "Speech server ready"}))
        except Exception as e:
            logging.error(f"Error sending welcome message: {e}")
        
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

# Health check endpoint for testing connection
async def health_check(websocket, path):
    if path == "/health":
        await websocket.send(json.dumps({"status": "ok"}))

# Get the Raspberry Pi's IP address
def get_ip_address():
    try:
        # Create a temporary socket to determine the outgoing IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
        s.close()
        return ip_address
    except Exception as e:
        logging.warning(f"Could not determine IP address: {e}")
        return "unknown"

# Test espeak-ng at startup
async def test_espeak():
    try:
        logging.info("Testing espeak-ng...")
        process = await asyncio.create_subprocess_exec(
            'espeak-ng', 'Speech server started successfully', '-p', '50', '-s', '150', '-a', '200',
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

# Main server function
async def main():
    # Test espeak-ng
    espeak_working = await test_espeak()
    if not espeak_working:
        logging.warning("espeak-ng test failed. Speech output may not work correctly.")
    
    # Start the WebSocket server
    try:
        server = await websockets.serve(handle_connection, "0.0.0.0", 8765)
        ip_address = get_ip_address()
        
        logging.info("=" * 50)
        logging.info("Speech server started successfully!")
        logging.info(f"Listening on ws://{ip_address}:8765")
        logging.info("=" * 50)
        logging.info("IMPORTANT: Server is listening on all interfaces")
        logging.info("Make sure to start this server BEFORE opening the trivia app")
        logging.info("=" * 50)
        
        # Keep the server running
        await server.wait_closed()
    except Exception as e:
        logging.error(f"Error starting WebSocket server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
        stop_speech()  # Ensure we stop any running speech
    except Exception as e:
        logging.error(f"Server error: {e}")