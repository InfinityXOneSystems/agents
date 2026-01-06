const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const router = express.Router();

// Middleware for authentication (if needed)
const { authenticateToken } = require('./auth');

// Google Cloud Text-to-Speech client
const client = new TextToSpeechClient();

// Text-to-Voice endpoint
router.post('/text-to-voice', authenticateToken, async (req, res) => {
  try {
    const { text, languageCode, voiceName } = req.body;

    const request = {
      input: { text },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const filePath = `output-${Date.now()}.mp3`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filePath, response.audioContent, 'binary');

    res.json({ success: true, message: 'Audio file created', filePath });
  } catch (error) {
    console.error('Error generating voice:', error);
    res.status(500).json({ success: false, message: 'Failed to generate voice', error: error.message });
  }
});

module.exports = router;