const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/:sessionId/ratings', authenticateToken, validate(schemas.rating), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    const sessionCheckResult = await pool.query('SELECT session_id FROM study_sessions WHERE session_id = $1', [sessionId]);
    if (sessionCheckResult.rows.length === 0) {
      return res.status(400).json({ error: 'Study session not found' });
    }

    const participantCheckResult = await pool.query(
      'SELECT * FROM study_session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    if (participantCheckResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this session' });
    }

    const ratingCheckResult = await pool.query(
      'SELECT * FROM session_ratings WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    if (ratingCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'You have already rated this session' });
    }

    const insertResult = await pool.query(
      'INSERT INTO session_ratings (session_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [sessionId, userId, rating, comment || null]
    );

    res.status(201).json({ message: 'Session rated successfully', rating: insertResult.rows[0] });
  } catch (error) {
    console.error('Error rating session:', error);
    res.status(500).json({ error: 'Error rating session', details: error.message });
  }
});

router.get('/:sessionId/ratings', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId) || sessionId <= 0) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const ratingsResult = await pool.query(
      'SELECT rating_id, session_id, user_id, rating, comment, created_at FROM session_ratings WHERE session_id = $1',
      [sessionId]
    );
    res.status(200).json({ ratings: ratingsResult.rows });
  } catch (error) {
    console.error('Error getting session ratings:', error);
    res.status(500).json({ error: 'Error getting session ratings', details: error.message });
  }
});

module.exports = router;