const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 8083;

app.use(cors());
app.use(express.json());

// API endpoint to trigger fetch_and_prepare.py
app.post('/trigger-fetch-and-prepare', (req, res) => {
  exec('python3 fetch_and_prepare.py', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Exec error: ${error.message}`);
      return res.status(500).send(`Error: ${error.message}`);
    }
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    console.log(`✅ Stdout: ${stdout}`);
    res.send('✅ Question set downloaded & updated!');
  });
});

// Run server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
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
