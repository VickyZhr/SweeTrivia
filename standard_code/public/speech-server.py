
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

# Check if espeak-ng is installed
try:
    subprocess.run(['which', 'espeak-ng'], check=True, stdout=subprocess.PIPE)
    logging.info("espeak-ng is installed")
except subprocess.CalledProcessError:
    logging.error("espeak-ng is not installed. Please install it with: sudo apt-get install -y espeak-ng")
    sys.exit(1)

# Function to speak text using espeak-ng
async def speak_text(text):
    try:
        # Use espeak-ng with good parameters for Raspberry Pi
        cmd = ['espeak-ng', text, '-p', '50', '-s', '150', '-a', '200']
        logging.info(f"Speaking: {text[:30]}{'...' if len(text) > 30 else ''}")
        
        # Run the espeak-ng command
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for it to finish
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            logging.error(f"espeak-ng error: {stderr.decode().strip()}")
            return False
        
        return True
    except Exception as e:
        logging.error(f"Error speaking text: {e}")
        return False

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
            except json.JSONDecodeError:
                logging.error(f"Invalid JSON received: {message}")
            except Exception as e:
                logging.error(f"Error processing message: {e}")
    except websockets.exceptions.ConnectionClosed:
        logging.info("Client disconnected")
    except Exception as e:
        logging.error(f"Connection handler error: {e}")

# Main server function
async def main():
    # Start the WebSocket server
    server = await websockets.serve(handle_connection, "localhost", 8765)
    logging.info("Speech server started on ws://localhost:8765")
    
    # Keep the server running
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server error: {e}")
