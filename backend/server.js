const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer to handle file upload via FormData
const upload = multer({ storage: multer.memoryStorage() });

// Upload endpoint that accepts a file and pushes it to Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('❌ No file uploaded');
  }

  // Setup Google OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // uploads folder
    };

    const { Readable } = require('stream');

    const media = {
        mimeType: req.file.mimetype,
        body: Readable.from(req.file.buffer),
    };


    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Make file publicly readable
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const downloadLink = `https://drive.google.com/uc?id=${file.data.id}&export=download`;

    res.send({
      success: true,
      fileId: file.data.id,
      downloadLink,
    });
  } catch (err) {
    console.error('❌ Google Drive upload failed:', err);
    res.status(500).send('Upload failed');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
