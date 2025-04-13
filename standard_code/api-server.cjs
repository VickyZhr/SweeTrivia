#!/usr/bin/env node
/**
 * API Server for Google Cloud TTS + Sync Trigger
 */

const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const app = express();
const port = 8083;  // Ensure this matches what the frontend expects!

// Middleware
app.use(cors());
app.use(express.json());

// ========= GOOGLE CLOUD TTS SETUP ========= //
let googleCloudAvailable = false;
let ttsClient;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    ttsClient = new TextToSpeechClient();
    googleCloudAvailable = true;
    console.log('✅ Google Cloud TTS client initialized');
  } else {
    console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. TTS disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize TTS client:', error);
}
// =========================================== //

// ====== POST /api/tts ====== //
app.post('/api/tts', async (req, res) => {
  try {
    if (!googleCloudAvailable) {
      return res.status(503).send('TTS unavailable');
    }

    const { text, voice = 'en-US-Neural2-F', languageCode = 'en-US', pitch = 0, speakingRate = 1.0 } = req.body;

    if (!text) return res.status(400).send('No text provided');

    const request = {
      input: { text },
      voice: { languageCode, name: voice },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch,
        speakingRate,
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    res.set('Content-Type', 'audio/mp3');
    res.send(response.audioContent);
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).send(`TTS error: ${error.message}`);
  }
});

// ====== GET /api/tts/status ====== //
app.get('/api/tts/status', (req, res) => {
  if (googleCloudAvailable) {
    res.json({ status: 'available', provider: 'Google Cloud TTS' });
  } else {
    res.status(503).json({ status: 'unavailable', message: 'TTS not configured' });
  }
});

// ====== POST /trigger-fetch-and-prepare ====== //
app.post('/trigger-fetch-and-prepare', (req, res) => {
  console.log('📥 Triggering fetch_and_prepare.py...');

  exec('python3 public/data/fetch_and_prepare.py', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Script failed:', err);
      return res.status(500).send('Failed to run fetch_and_prepare.py');
    }

    console.log('✅ fetch_and_prepare.py output:\n', stdout);
    res.send(`✅ Questions updated:\n${stdout}`);
  });
});

// ====== Start Server ====== //
app.listen(port, () => {
  console.log(`🚀 API server running at http://localhost:${port}`);
});
