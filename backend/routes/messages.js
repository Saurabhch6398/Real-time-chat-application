const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * GET /api/messages
 * Fetches all previous messages.
 */
router.get('/', (req, res) => {
  try {
    const messages = db.getMessages();
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to retrieve message history' });
  }
});

/**
 * POST /api/messages
 * Sends a message, saves it, and broadcasts it over Socket.io.
 */
router.post('/', (req, res) => {
  try {
    const { text, user } = req.body;

    if (!text || !user) {
      return res.status(400).json({ error: 'Missing message content (text) or sender (user)' });
    }

    const message = {
      id: uuidv4(),
      text,
      user,
      timestamp: new Date().toISOString()
    };

    const saved = db.saveMessage(message);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save message to database' });
    }

    // Broadcast the message via Socket.io if the server is set up with it
    const io = req.app.get('socketio');
    if (io) {
      io.emit('receive_message', message);
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
