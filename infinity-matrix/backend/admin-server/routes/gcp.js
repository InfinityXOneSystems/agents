const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Middleware for authentication (if needed)
const { authenticateToken } = require('./auth');

// Example: Google Cloud Pub/Sub
router.get('/pubsub/topics', authenticateToken, async (req, res) => {
  try {
    const pubsub = new google.pubsub({ version: 'v1' });
    const topics = await pubsub.projects.topics.list({
      project: `projects/${process.env.GCP_PROJECT_ID}`,
    });

    res.json({
      success: true,
      topics: topics.data,
    });
  } catch (error) {
    console.error('Error fetching Pub/Sub topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Pub/Sub topics',
      error: error.message,
    });
  }
});

// Add missing GET endpoint for '/api/gcp'
router.get('/api/gcp', (req, res) => {
  res.json({
    success: true,
    message: 'GCP endpoint is active',
  });
});

module.exports = router;
