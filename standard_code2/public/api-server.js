
#!/usr/bin/env node
/**
 * API Server for Google Cloud TTS
 * This server provides an API endpoint for Google Cloud Text-to-Speech services.
 */

const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Check if Google Cloud credentials are available
let googleCloudAvailable = false;
let ttsClient;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    ttsClient = new TextToSpeechClient();
    googleCloudAvailable = true;
    console.log('Google Cloud Text-to-Speech client initialized successfully');
  } else {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS environment variable not set.');
    console.warn('Google Cloud TTS will not be available.');
  }
} catch (error) {
  console.error('Failed to initialize Google Cloud TTS client:', error);
}

// TTS API endpoint
app.post('/api/tts', async (req, res) => {
  try {
    if (!googleCloudAvailable) {
      return res.status(503).send('Google Cloud TTS service not available');
    }

    const { text, voice = 'en-US-Neural2-F', languageCode = 'en-US', pitch = 0, speakingRate = 1.0 } = req.body;

    if (!text) {
      return res.status(400).send('No text provided');
    }

    console.log(`TTS request: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

    // Configure request
    const request = {
      input: { text },
      voice: { languageCode, name: voice },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch,
        speakingRate,
      },
    };

    // Call Google Cloud TTS API
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Send audio content as response
    res.set('Content-Type', 'audio/mp3');
    res.send(response.audioContent);
    
  } catch (error) {
    console.error('Error in TTS API:', error);
    res.status(500).send(`TTS error: ${error.message}`);
  }
});

// Status endpoint
app.get('/api/tts/status', (req, res) => {
  if (googleCloudAvailable) {
    res.json({ status: 'available', provider: 'Google Cloud TTS' });
  } else {
    res.status(503).json({ status: 'unavailable', message: 'Google Cloud TTS not configured' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
  console.log(`TTS endpoint available at http://localhost:${port}/api/tts`);
});
