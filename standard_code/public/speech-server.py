
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
        logging.info(f"New client connected")
        async for message in websocket:
            try:
                # Parse the JSON message
                data = json.loads(message)
                
                # Handle 'speak' action
                if data.get('action') == 'speak' and 'text' in data:
                    text = data['text']
                    await speak_text(text)
                
                # Handle 'stop' action
                elif data.get('action') == 'stop':
                    stop_speech()
                    await websocket.send(json.dumps({"status": "speech_stopped"}))
                
            except json.JSONDecodeError:
                logging.error(f"Invalid JSON received: {message}")
                await websocket.send(json.dumps({"error": "invalid_json"}))
            except Exception as e:
                logging.error(f"Error processing message: {e}")
                await websocket.send(json.dumps({"error": str(e)}))
    except websockets.exceptions.ConnectionClosed:
        logging.info("Client disconnected")
    except Exception as e:
        logging.error(f"Connection handler error: {e}")

# Health check endpoint for testing connection
async def health_check(websocket, path):
    if path == "/health":
        await websocket.send(json.dumps({"status": "ok"}))

# Main server function
async def main():
    # Start the WebSocket server
    server = await websockets.serve(handle_connection, "0.0.0.0", 8765)
    logging.info("Speech server started on ws://localhost:8765")
    logging.info("IMPORTANT: Server is listening on all interfaces, access via Raspberry Pi's IP address")
    
    # Show the Raspberry Pi's IP address for easier connection
    try:
        ip_process = subprocess.run(['hostname', '-I'], check=True, capture_output=True, text=True)
        ip_addresses = ip_process.stdout.strip().split()
        if ip_addresses:
            logging.info(f"Raspberry Pi IP address(es): {', '.join(ip_addresses)}")
    except Exception as e:
        logging.error(f"Could not determine IP address: {e}")
    
    # Keep the server running
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
        stop_speech()  # Ensure we stop any running speech
    except Exception as e:
        logging.error(f"Server error: {e}")