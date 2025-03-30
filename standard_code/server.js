const express = require('express');
const bodyParser = require('body-parser');
const i2c = require('i2c-bus');
const cors = require('cors');

const I2C_ADDRESS = 0x08; // Arduino I2C address
const PORT = 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/dispense', async (req, res) => {
  const { candyType } = req.body;

  const candyMap = {
    circle: 1,
    triangle: 2,
    square: 3,
    star: 4,
  };

  const selection = candyMap[candyType];

  if (!selection) {
    return res.status(400).json({ error: 'Invalid candy type' });
  }

  const i2cBus = await i2c.openPromisified(1); // I2C bus 1 on RPi

  try {
    console.log(`Sending candy selection: ${selection}`);
    await i2cBus.writeByte(I2C_ADDRESS, 0x00, selection);

    // Wait for Arduino acknowledgment (0xAA)
    let ack = 0;
    const maxRetries = 20;
    let tries = 0;

    while (ack !== 0xAA && tries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      ack = await i2cBus.readByte(I2C_ADDRESS, 0x00);
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

app.listen(PORT, () => {
  console.log(`Candy dispenser backend running on http://localhost:${PORT}`);
});
