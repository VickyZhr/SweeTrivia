#!/usr/bin/env node
/**
 * API Server for Trivia Question Sync + Candy Dispense + Narration
 */

 const express = require('express');
 const cors = require('cors');
 const { exec } = require('child_process');
 const i2c = require('i2c-bus'); // 🧠 Required for I2C communication
 
 const app = express();
 const port = 8083;
 
 // Middleware
 app.use(cors());
 app.use(express.json());
 
 // ====== POST /trigger-fetch-and-prepare ====== //
 app.post('/trigger-fetch-and-prepare', (req, res) => {
   console.log('📥 Triggering fetch_and_prepare.py...');
   const scriptPath = __dirname + '/fetch_and_prepare.py';
 
   exec(`python3 ${scriptPath}`, (err, stdout, stderr) => {
     if (err) {
       console.error('❌ Script failed:', err);
       if (stderr) console.error('stderr:', stderr);
       return res.status(500).send('Failed to run fetch_and_prepare.py');
     }
 
     console.log('✅ fetch_and_prepare.py output:\n', stdout);
     res.send(`✅ Questions updated:\n${stdout}`);
   });
 });
 
 // ====== POST /narrate ====== //
 app.post('/narrate', async (req, res) => {
   const { text } = req.body;
   if (!text) {
     return res.status(400).json({ error: 'No text provided' });
   }
 
   const cmd = `espeak-ng -v en+f2 -s 130 "${text.replace(/"/g, '\\"')}"`;
 
   exec(cmd, (error, stdout, stderr) => {
     if (error) {
       console.error("Narration error:", stderr);
       return res.status(500).json({ error: 'Narration failed' });
     }
     res.status(200).json({ success: true });
   });
 });
 
 // ====== POST /dispense ====== //
 app.post('/dispense', async (req, res) => {
   const { candyType } = req.body;
 
   console.log("Received candyType from frontend:", candyType);
 
   const candyMap = {
     circle: 1,
     triangle: 2,
     square: 3,
     star: 4,
   };
 
   const selection = candyMap[candyType];
 
   if (!selection || selection < 1 || selection > 4) {
     console.error("Invalid or missing candy type! Selection:", selection);
     return res.status(400).json({ error: 'Invalid candy type received' });
   }
 
   console.log(`Mapped candyType "${candyType}" to value ${selection}`);
 
   const I2C_ADDRESS = 0x08;
 
   try {
     const i2cBus = await i2c.openPromisified(1);
     console.log(`Sending candy selection ${selection} to Arduino via sendByte()`);
     await i2cBus.sendByte(I2C_ADDRESS, selection);
 
     // Wait for Arduino acknowledgment (0xAA)
     let ack = 0;
     const maxRetries = 20;
     let tries = 0;
 
     while (ack !== 0xAA && tries < maxRetries) {
       await new Promise(resolve => setTimeout(resolve, 100));
       ack = await i2cBus.receiveByte(I2C_ADDRESS);
       tries++;
     }
 
     await i2cBus.close();
 
     if (ack === 0xAA) {
       console.log("Candy dispensed successfully.");
       res.json({ success: true });
     } else {
       console.warn("Timeout waiting for Arduino ack.");
       res.status(504).json({ error: 'Timeout waiting for Arduino ack' });
     }
   } catch (err) {
     console.error("I2C communication error:", err);
     res.status(500).json({ error: 'I2C communication failed' });
   }
 });
 
 // ====== Start Server ====== //
 app.listen(port, () => {
   console.log(`🚀 API server running at http://localhost:${port}`);
 });
 