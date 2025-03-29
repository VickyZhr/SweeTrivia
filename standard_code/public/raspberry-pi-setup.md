
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

3. Run the server:

```bash
./speech-server.py
```

You should see a message saying "Speech server started on ws://localhost:8765"

## 3. Configure Browser for Kiosk Mode

For best results, run your browser in kiosk mode. For Chromium:

```bash
chromium-browser --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8080
```

## 4. Autostart on Boot (Optional)

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

- If speech doesn't work, check if the speech server is running.
- Make sure your Raspberry Pi has audio output configured correctly.
- Check the browser console for any WebSocket connection errors.
- Try running espeak-ng manually to verify it works:
  ```bash
  espeak-ng "Testing speech output" -p 50 -s 150 -a 200
  ```
