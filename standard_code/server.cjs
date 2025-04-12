// const express = require('express');
// const cors = require('cors');
// const { exec } = require('child_process');
// const path = require('path');

// const app = express();
// const PORT = 8080;

// app.use(cors());
// app.use(express.json());

// // POST endpoint to run fetch_and_prepare.py
// app.post('/trigger-fetch-and-prepare', (req, res) => {
//   const scriptPath = path.join(__dirname, 'fetch_and_prepare.py');

//   exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`❌ Error: ${stderr}`);
//       return res.status(500).send(`Error: ${stderr}`);
//     }

//     console.log(`✅ Output:\n${stdout}`);
//     res.send('✅ Question set downloaded & appended!');
//   });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
// });



// import express from 'express';
// import cors from 'cors';
// import { exec } from 'child_process';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const app = express();
// const PORT = 8082;

// app.use(cors());
// app.use(express.json());

// // Used to determine directory location
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
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
