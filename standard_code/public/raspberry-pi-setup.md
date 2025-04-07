
# Raspberry Pi Setup for SweetTrivia with espeak-ng

This guide will help you set up the speech capabilities for SweetTrivia on your Raspberry Pi.

## 1. Install Required Packages

Open a terminal and run the following commands:

```bash
sudo apt-get update
sudo apt-get install -y espeak-ng python3-pip
pip3 install websockets
```

## 2. Set Up the Speech Server

1. Copy the `speech-server.py` file from the `public` folder to your Raspberry Pi.
2. Make it executable:

```bash
chmod +x speech-server.py
```

3. Run the server with debugging output:

```bash
./speech-server.py
```

You should see a message saying "Speech server started on ws://localhost:8765"

## 3. IMPORTANT: Run the Server BEFORE the Browser

The most common issue is trying to run the trivia app before starting the speech server.

1. **Always start the speech server first**
2. **Keep the speech server terminal window open**
3. **Only then launch the browser to open the SweetTrivia app**

## 4. Test the Speech Server

Before running the app, make sure the speech server is working correctly:

```bash
# Test espeak-ng directly
espeak-ng "Testing speech output" -p 50 -s 150 -a 200

# Make sure your audio device is working
aplay -l  # List audio devices
```

## 5. Configure Browser for Kiosk Mode

For best results, run your browser in kiosk mode. For Chromium:

```bash
chromium-browser --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8080
```

## 6. Important: Check WebSocket Connection

The SweetTrivia app needs to connect to the speech server via WebSocket. Make sure:

1. The speech server is running before you launch the browser
2. The browser can connect to `ws://localhost:8765`
3. There are no firewall rules blocking the connection

To view debug messages:

```bash
# In Chromium, press F12 to open developer tools and check the console for connection errors
```

## 7. Audio Configuration

Make sure your Raspberry Pi is correctly configured for audio:

```bash
# Set the default audio device (if needed)
sudo raspi-config  # Navigate to System Options > Audio

# Test audio output
speaker-test -t wav -c 2
```

## 8. Autostart on Boot (Recommended)

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

If you're still having issues, please contact support with screenshots of any error messages.