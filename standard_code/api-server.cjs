#!/usr/bin/env node
/**
 * API Server for Trivia Question Sync
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 8083;  // Make sure frontend expects this!

// Middleware
app.use(cors());
app.use(express.json());

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

app.post('/narrate', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  const { exec } = require('child_process');
  const cmd = `espeak-ng -v en+f2 -s 130 "${text.replace(/"/g, '\\"')}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Narration error:", stderr);
      return res.status(500).json({ error: 'Narration failed' });
    }
    res.status(200).json({ success: true });
  });
});