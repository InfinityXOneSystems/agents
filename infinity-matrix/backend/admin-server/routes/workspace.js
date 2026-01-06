const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Middleware for authentication (if needed)
const { authenticateToken } = require('./auth');

// Example: Google Workspace Drive API
router.get('/drive/files', authenticateToken, async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3' });
    const files = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name)',
    });

    res.json({
      success: true,
      files: files.data.files,
    });
  } catch (error) {
    console.error('Error fetching Drive files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Drive files',
      error: error.message,
    });
  }
});

// Add missing GET endpoint for '/api/workspace'
router.get('/api/workspace', (req, res) => {
  res.json({
    success: true,
    message: 'Workspace endpoint is active',
  });
});

module.exports = router;
