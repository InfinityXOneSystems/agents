const express = require('express');
const router = express.Router();

// Example: GitHub Webhook
router.post('/webhook/github', (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`Received GitHub event: ${event}`);
    console.log('Payload:', payload);

    // Add logic to handle GitHub events
    res.json({ success: true, message: `Handled GitHub event: ${event}` });
  } catch (error) {
    console.error('Error handling GitHub webhook:', error);
    res.status(500).json({ success: false, message: 'Failed to handle webhook', error: error.message });
  }
});

module.exports = router;