
# Raspberry Pi Setup for SweetTrivia with espeak-ng

This guide will help you set up the speech capabilities for SweetTrivia on your Raspberry Pi.

## Quick Troubleshooting for Speech Issues

If you're having speech problems:

1. **Make sure the speech server is running before starting the app**
   ```bash
   # Check if speech-server.py is running
   ps aux | grep speech-server.py
   
   # If not running, start it
   cd /path/to/your/project/public
   python3 ./speech-server.py
   ```

2. **Turn up your volume** - Ensure audio is not muted and volume is set high enough

3. **Try the "Retry Narration" button** in the trivia game if narration fails

4. **Check your terminal** for speech server error messages

5. **Test espeak-ng directly**:
   ```bash
   espeak-ng "Testing speech output" -p 50 -s 150 -a 200
   ```

## After Pulling New Code

If you've just pulled new code updates, follow these steps:

1. **Restart the speech server**:
   ```bash
   # Find and kill any existing speech server processes
   pkill -f speech-server.py
   
   # Start the speech server again
   cd /path/to/your/project/public
   python3 ./speech-server.py
   ```

2. **Verify the speech server is running**:
   ```bash
   # You should see "Speech server started successfully!" message
   # Note the IP address shown - this confirms it's listening correctly
   ```

3. **Refresh or restart your browser** after the speech server is running:
   ```bash
   # For Chromium
   chromium-browser --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8080
   ```

## 1. Install Required Packages

Open a terminal and run the following commands:

```bash
sudo apt-get update
sudo apt-get install -y espeak-ng python3-pip
```

## 2. Install Python Dependencies

The speech server requires the `websockets` Python module. Install it using pip:

```bash
# Make sure pip is installed
sudo apt-get install -y python3-pip

# Install the websockets module
pip3 install websockets
```

If you get "No module named 'websockets'" error, try these alternative installation methods:

```bash
# Alternative 1: Install with sudo if regular pip install fails
sudo pip3 install websockets

# Alternative 2: Install for the current user only
pip3 install --user websockets

# Alternative 3: Check if pip is working correctly
pip3 --version
# If pip doesn't work, reinstall it
sudo apt-get remove python3-pip
sudo apt-get install python3-pip
```

If you encounter the "externally-managed-environment" error:

```bash
# Create a virtual environment
python3 -m venv speech_env

# Activate the virtual environment
source speech_env/bin/activate

# Install websockets in the virtual environment
pip3 install websockets

# Run the speech server from the virtual environment
python3 ./speech-server.py
```

## 3. Set Up the Speech Server

1. Copy the `speech-server.py` file from the `public` folder to your Raspberry Pi.
2. Make it executable:

```bash
chmod +x speech-server.py
```

3. Run the server with debugging output:

```bash
./speech-server.py
```

You should see a message saying "Speech server started successfully!" and your IP address

## 4. IMPORTANT: Run the Server BEFORE the Browser

The most common issue is trying to run the trivia app before starting the speech server.

1. **Always start the speech server first**
2. **Keep the speech server terminal window open**
3. **Only then launch the browser to open the SweetTrivia app**

## 5. Test the Speech Server

Before running the app, make sure the speech server is working correctly:

```bash
# Test espeak-ng directly
espeak-ng "Testing speech output" -p 50 -s 150 -a 200

# Make sure your audio device is working
aplay -l  # List audio devices
```

## 6. Configure Browser for Kiosk Mode

For best results, run your browser in kiosk mode. For Chromium:

```bash
chromium-browser --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8080
```

## 7. Important: Check WebSocket Connection

The SweetTrivia app needs to connect to the speech server via WebSocket. Make sure:

1. The speech server is running before you launch the browser
2. The browser can connect to `ws://localhost:8765`
3. There are no firewall rules blocking the connection

To view debug messages:

```bash
# In Chromium, press F12 to open developer tools and check the console for connection errors
```

## 8. Audio Configuration

Make sure your Raspberry Pi is correctly configured for audio:

```bash
# Set the default audio device (if needed)
sudo raspi-config  # Navigate to System Options > Audio

# Test audio output
speaker-test -t wav -c 2
```

## 9. Autostart on Boot (Recommended)

To make the speech server start automatically when your Raspberry Pi boots:

1. Create a systemd service file:

```bash
sudo nano /etc/systemd/system/trivia-speech.service
```

2. Add the following content (adjust paths as needed):

```
[Unit]
Description=SweetTrivia Speech Server
After=network.target

[Service]
ExecStart=/path/to/speech-server.py
WorkingDirectory=/path/to/directory
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl enable trivia-speech
sudo systemctl start trivia-speech
```

## Troubleshooting

If you see "Text-to-speech unavailable" in the trivia game, follow these steps:

### 1. Verify the speech server is running

```bash
# Check if the process is running
ps aux | grep speech-server.py

# If not running, start it
./speech-server.py
```

### 2. Check WebSocket connectivity

```bash
# Install wscat for testing WebSockets
sudo npm install -g wscat
   
# Test connection
wscat -c ws://localhost:8765
# Then type: {"action":"speak","text":"testing"}
```

### 3. Verify permissions and directory

```bash
# Make sure you're in the right directory
cd /path/to/speech-server/directory

# Check permissions
ls -la speech-server.py
# Should show executable permission (x)
```

### 4. Check for port conflicts

```bash
# See if anything else is using port 8765
sudo netstat -tulpn | grep 8765

# If the port is in use, kill the process
sudo lsof -i :8765
# Then kill the process (replace PID with the actual process ID)
kill PID
# If that doesn't work, use force kill
kill -9 PID

# Alternative: Kill all speech server processes
pkill -f speech-server.py
```

### 5. Restart from scratch

If all else fails, try restarting everything:

```bash
# Kill any running speech server
pkill -f speech-server.py

# Start it fresh
./speech-server.py

# In another terminal, launch the browser
chromium-browser --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8080
```

### 6. Check logs

If the server is running as a systemd service, check its logs:

```bash
sudo journalctl -u trivia-speech -f
```

### 7. Module not found errors

If you see "No module named 'websockets'" or similar errors:

```bash
# Install required Python packages
pip3 install websockets

# If the above doesn't work, try with sudo
sudo pip3 install websockets

# Verify it installed correctly
python3 -c "import websockets; print('websockets is installed')"
```

If you're still having issues, please contact support with screenshots of any error messages.