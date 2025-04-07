
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

# Default port and alternate ports to try
DEFAULT_PORT = 8765
ALTERNATE_PORTS = [8766, 8767, 8768, 8769, 8770]

# Check if espeak-ng is installed
try:
    subprocess.run(['which', 'espeak-ng'], check=True, stdout=subprocess.PIPE)
    logging.info("espeak-ng is installed")
except subprocess.CalledProcessError:
    logging.error("espeak-ng is not installed. Please install it with: sudo apt-get install -y espeak-ng")
    sys.exit(1)

# Function to speak text using espeak-ng piped to aplay
async def speak_text(text):
    global current_process

    try:
        # Stop any currently running speech
        stop_speech()

        # Build the full shell command
        cmd_str = f'espeak-ng "{text}" -p 50 -s 150 -a 200 --stdout | aplay'
        logging.info(f"[CMD] {cmd_str}")
        logging.info(f"Speaking: {text[:30]}{'...' if len(text) > 30 else ''}")

        # Run the command using the shell
        current_process = await asyncio.create_subprocess_shell(
            cmd_str,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait for the process to finish
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
            # Try to terminate the process gracefully
            current_process.terminate()
            # Give it a moment to terminate
            time.sleep(0.1)
            # If still running, force kill
            if current_process and current_process.returncode is None:
                try:
                    os.kill(current_process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass  # Process already gone
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
    finally:
        stop_speech()  # Ensure speech is stopped when client disconnects

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

# Try to start server with fallback to alternate ports
async def start_server_with_fallback():
    # Test espeak-ng
    espeak_working = await test_espeak()
    if not espeak_working:
        logging.warning("espeak-ng test failed. Speech output may not work correctly.")
    
    # Try the default port first, then alternate ports
    ports_to_try = [DEFAULT_PORT] + ALTERNATE_PORTS
    server = None
    
    for port in ports_to_try:
        try:
            logging.info(f"Attempting to start server on port {port}...")
            server = await websockets.serve(handle_connection, "0.0.0.0", port)
            ip_address = get_ip_address()
            
            logging.info("=" * 50)
            logging.info("Speech server started successfully!")
            logging.info(f"Listening on ws://{ip_address}:{port}")
            logging.info("=" * 50)
            logging.info("IMPORTANT: Server is listening on all interfaces")
            logging.info(f"IMPORTANT: Using port {port} - update the client connection if needed")
            logging.info("Make sure to start this server BEFORE opening the trivia app")
            logging.info("=" * 50)
            
            # If we successfully started the server, update the speechUtils.ts file
            # to use the new port if it's not the default
            if port != DEFAULT_PORT:
                logging.info(f"NOTE: Using non-default port {port}. If you have connection issues,")
                logging.info(f"update the WebSocket address in src/utils/speechUtils.ts to use port {port}")
            
            break
        except OSError as e:
            logging.warning(f"Could not use port {port}: {e}")
            if port == ports_to_try[-1]:  # Last port to try
                logging.error("All ports are in use. Please free up a port and try again.")
                sys.exit(1)
    
    # Keep the server running
    if server:
        await server.wait_closed()
    else:
        logging.error("Failed to start server on any port")
        sys.exit(1)

# Main server function
async def main():
    try:
        await start_server_with_fallback()
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