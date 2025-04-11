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

  try {
    const i2cBus = await i2c.openPromisified(1);
    console.log(`Sending candy selection ${selection} to Arduino via sendByte()`);

    await i2cBus.sendByte(I2C_ADDRESS, selection);

    // Optionally wait for confirmation byte
    const confirmation = await i2cBus.receiveByte(I2C_ADDRESS);
    console.log("Arduino confirmation:", confirmation);

    await i2cBus.close();

    res.json({ success: true, message: 'Dispense command sent', confirmation });
  } catch (error) {
    console.error("I2C communication failed:", error);
    res.status(500).json({ error: 'I2C communication error' });
  }
});

// 🔊 Narration endpoint using espeak-ng
app.post('/narrate', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text to narrate' });
  }

  console.log("Narrating:", text);

  // Use espeak-ng with female voice and slower speed for clarity
  const cmd = `espeak-ng -v en+f3 -s 140 "${text.replace(/"/g, '\\"')}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Narration failed:", stderr);
      return res.status(500).json({ error: 'Narration failed' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
