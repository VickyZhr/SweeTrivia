
# Raspberry Pi Setup for SweetTrivia with Google Cloud TTS

This guide will help you set up high-quality speech capabilities for SweetTrivia on your Raspberry Pi using Google Cloud Text-to-Speech.

## Quick Troubleshooting for Speech Issues

If you're having speech problems:

1. **Make sure the speech server is running before starting the app**
   ```bash
   # Check if speech-server-gcloud.py is running
   ps aux | grep speech-server-gcloud.py
   
   # If not running, start it
   cd /path/to/your/project/public
   python3 ./speech-server-gcloud.py
   ```

2. **Turn up your volume** - Ensure audio is not muted and volume is set high enough

3. **Try the "Retry Narration" button** in the trivia game if narration fails

4. **Check your terminal** for speech server error messages

5. **Verify API key setup** - Make sure your Google Cloud credentials are correctly configured

## Environment Setup Notes

All commands in this guide should be run directly in the Raspberry Pi terminal (not in a virtual environment) unless specifically noted otherwise.

- ✅ Install system packages using `apt-get` directly on the Raspberry Pi OS
- ✅ Configure audio output on the Raspberry Pi
- ✅ Set up Google Cloud API credentials
- ✅ Only use a Python virtual environment if the regular pip install fails

## Setting Up Google Cloud TTS

For best results, we'll use Google Cloud Text-to-Speech API, which provides high-quality voices both on web browsers and Raspberry Pi.

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Cloud Text-to-Speech API" for your project
4. Create a service account with "Text-to-Speech User" role
5. Generate and download a JSON key file for the service account

### 2. Set Up Environment Variable

Save your Google Cloud credentials JSON file on your Raspberry Pi and set the environment variable:

```bash
# Create a directory for credentials
mkdir -p ~/.google-cloud

# Copy your downloaded JSON key file here
# (replace with your actual file path)
cp /path/to/downloaded/credentials.json ~/.google-cloud/tts-credentials.json

# Set the environment variable
echo 'export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.google-cloud/tts-credentials.json"' >> ~/.bashrc

# Apply the changes
source ~/.bashrc

# Verify the variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### 3. Install Required Packages

```bash
# Update system packages
sudo apt-get update

# Install Python and pip
sudo apt-get install -y python3-pip

# Install audio players for MP3
sudo apt-get install -y mpg123

# Install Python packages
pip3 install websockets google-cloud-texttospeech

# Install Node.js and npm (for API server)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Node.js packages (in the project directory)
cd /path/to/your/project
npm install express cors @google-cloud/text-to-speech
```

### 4. Set Up the Speech Servers

#### For Raspberry Pi:

```bash
# Make the speech server executable
cd /path/to/your/project/public
chmod +x speech-server-gcloud.py

# Run the server
./speech-server-gcloud.py
```

#### For Web Browser Testing (optional, only needed for development):

```bash
# Make the API server executable
cd /path/to/your/project/public
chmod +x api-server.js

# Run the server
./api-server.js
```

## Forcing Raspberry Pi Mode

If your Raspberry Pi isn't being detected correctly (app shows "Using standard Web Speech API"), you can force Raspberry Pi mode using any of these methods:

1. **Add URL parameter** when launching the browser:
   ```bash
   chromium-browser --kiosk --autoplay-policy=no-user-gesture-required "http://localhost:8080?rpi_mode=true"
   ```

2. **Use developer console**:
   - Open browser developer tools (press F12)
   - Enter this command: `window.forceRaspberryPiMode(true)`
   - Refresh the page

3. **Add a startup script** that forces RPI mode automatically:
   ```bash
   # Add this to your startup commands
   sed -i 's|http://localhost:8080|http://localhost:8080?rpi_mode=true|' /path/to/your/browser/startup/script
   ```

## After Pulling New Code

If you've just pulled new code updates, follow these steps:

1. **Restart the speech server**:
   ```bash
   # Find and kill any existing speech server processes
   pkill -f speech-server-gcloud.py
   
   # Start the speech server again
   cd /path/to/your/project/public
   python3 ./speech-server-gcloud.py
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

## Fallback Options

The system will automatically use fallbacks in case Google Cloud TTS is unavailable:

1. **On Raspberry Pi**: Falls back to espeak-ng if Google Cloud TTS fails
2. **In web browsers**: Falls back to Web Speech API if Google Cloud TTS fails

To install the fallback option for Raspberry Pi:

```bash
sudo apt-get install -y espeak-ng
```

## Autostart on Boot

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
ExecStart=/path/to/speech-server-gcloud.py
WorkingDirectory=/path/to/directory
Restart=always
User=pi
Environment="GOOGLE_APPLICATION_CREDENTIALS=/home/pi/.google-cloud/tts-credentials.json"

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl enable trivia-speech
sudo systemctl start trivia-speech
```

## Troubleshooting

### Speech server won't start

1. **Check Python dependencies**:
   ```bash
   pip3 list | grep websockets
   pip3 list | grep google-cloud-texttospeech
   # If not found, install them:
   pip3 install websockets google-cloud-texttospeech
   ```

2. **Verify Google Cloud credentials**:
   ```bash
   # Ensure the environment variable is set
   echo $GOOGLE_APPLICATION_CREDENTIALS
   
   # Make sure the file exists and is readable
   cat $GOOGLE_APPLICATION_CREDENTIALS | head -5
   ```

3. **Check for port conflicts**:
   ```bash
   sudo netstat -tulpn | grep -E "8765|8766|8767|8768|8769|8770"
   # If any ports are in use, kill those processes
   ```

### No sound output

1. **Check audio configuration**:
   ```bash
   # List audio devices
   aplay -l
   
   # Test audio output with a simple sound
   speaker-test -t wav -c 2
   ```

2. **Verify mpg123 is installed**:
   ```bash
   mpg123 --version
   # If not installed:
   sudo apt-get install -y mpg123
   ```

3. **Test Google Cloud TTS directly**:
   ```python
   # Create a test file test-tts.py
   from google.cloud import texttospeech
   client = texttospeech.TextToSpeechClient()
   synthesis_input = texttospeech.SynthesisInput(text="Testing Google Cloud Text to Speech")
   voice = texttospeech.VoiceSelectionParams(language_code="en-US", name="en-US-Neural2-F")
   audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
   response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
   with open("output.mp3", "wb") as out:
       out.write(response.audio_content)
   print("Audio content written to output.mp3")
   
   # Run the test
   python3 test-tts.py
   mpg123 output.mp3
   ```

### WebSocket connection errors

1. **Check server status**:
   ```bash
   ps aux | grep speech-server
   # If not running, start it
   ```

2. **Test WebSocket connection**:
   ```bash
   # Install wscat for testing
   sudo npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:8765
   # Then type: {"action":"speak","text":"testing","mode":"google_cloud_tts"}
   ```

3. **Check firewall settings**:
   ```bash
   sudo ufw status
   # If active, allow WebSocket ports
   sudo ufw allow 8765
   ```

If you continue to experience issues, please look at the speech server logs for detailed error messages.
