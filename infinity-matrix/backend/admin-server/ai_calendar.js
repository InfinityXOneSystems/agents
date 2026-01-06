const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Middleware for authentication (if needed)
const { authenticateToken } = require('./auth');

// Google Calendar API integration
router.post('/calendar/create', authenticateToken, async (req, res) => {
  try {
    const { summary, location, description, start, end } = req.body;

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary,
      location,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.json({ success: true, event: response.data });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

module.exports = router;