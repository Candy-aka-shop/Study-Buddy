const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/', authenticateToken, validate(schemas.message), async (req, res) => {
  try {
    const { receiverUserId, messageContent } = req.body;
    const senderUserId = req.user.userId;

    if (senderUserId === parseInt(receiverUserId)) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const receiverUserResult = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [receiverUserId]);
    if (receiverUserResult.rows.length === 0) {
      return res.status(400).json({ error: 'Receiver user not found' });
    }

    const insertResult = await pool.query(
      'INSERT INTO messages (sender_user_id, receiver_user_id, message_content) VALUES ($1, $2, $3) RETURNING *',
      [senderUserId, receiverUserId, messageContent]
    );

    res.status(201).json({ message: 'Message sent successfully', message: insertResult.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message', details: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const messagesResult = await pool.query(
      'SELECT message_id, sender_user_id, receiver_user_id, message_content, timestamp, is_read FROM messages WHERE receiver_user_id = $1 ORDER BY timestamp DESC',
      [req.user.userId]
    );
    res.status(200).json({ messages: messagesResult.rows });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Error getting messages', details: error.message });
  }
});

module.exports = router;