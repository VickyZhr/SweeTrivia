import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import i2c from 'i2c-bus';
import { exec } from 'child_process';

const I2C_ADDRESS = 0x08;
const PORT = 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

  const i2cBus = await i2c.openPromisified(1);

  try {
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
  } finally {
    await i2cBus.close();
  }
});

// New audio endpoint
app.post('/speak', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  console.log("Speaking:", text);
  exec(`espeak-ng "${text.replace(/"/g, '\\"')}" -p 50 -s 150 -a 200`, (err) => {
    if (err) {
      console.error("espeak-ng error:", err);
      return res.status(500).json({ error: 'espeak-ng failed' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Candy dispenser backend running on http://localhost:${PORT}`);
});
