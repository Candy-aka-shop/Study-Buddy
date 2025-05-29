const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/', authenticateToken, validate(schemas.session), async (req, res) => {
  try {
    const { courseId, title, description, scheduledTime, location } = req.body;
    const creatorUserId = req.user.userId;

    const courseCheckResult = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [courseId]);
    if (courseCheckResult.rows.length === 0) {
      return res.status(400).json({ error: 'Course not found' });
    }

    const insertResult = await pool.query(
      'INSERT INTO study_sessions (creator_user_id, course_id, title, description, scheduled_time, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [creatorUserId, courseId, title, description || null, scheduledTime, location || null]
    );

    await pool.query(
      'INSERT INTO study_session_participants (session_id, user_id, status) VALUES ($1, $2, $3)',
      [insertResult.rows[0].session_id, creatorUserId, 'confirmed']
    );

    res.status(201).json({ message: 'Study session created successfully', session: insertResult.rows[0] });
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ error: 'Error creating study session', details: error.message });
  }
});

router.get('/me/sessions', authenticateToken, async (req, res) => {
  try {
    const sessionsResult = await pool.query(
      `SELECT s.session_id, s.creator_user_id, s.course_id, s.title, s.description, s.scheduled_time, s.location, p.status
       FROM study_sessions s
       LEFT JOIN study_session_participants p ON s.session_id = p.session_id
       WHERE p.user_id = $1
       ORDER BY s.scheduled_time`,
      [req.user.userId]
    );
    res.status(200).json({ sessions: sessionsResult.rows });
  } catch (error) {
    console.error('Error getting study sessions:', error);
    res.status(500).json({ error: 'Error getting study sessions', details: error.message });
  }
});

router.post('/:sessionId/participants', authenticateToken, validate(schemas.participant), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const userId = req.user.userId;
    const { status } = req.body;

    const sessionCheckResult = await pool.query('SELECT session_id FROM study_sessions WHERE session_id = $1', [sessionId]);
    if (sessionCheckResult.rows.length === 0) {
      return res.status(400).json({ error: 'Study session not found' });
    }

    const participantCheckResult = await pool.query(
      'SELECT * FROM study_session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    if (participantCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Already a participant in this session' });
    }

    const insertResult = await pool.query(
      'INSERT INTO study_session_participants (session_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, userId, status]
    );

    res.status(201).json({ message: 'Joined study session successfully', participant: insertResult.rows[0] });
  } catch (error) {
    console.error('Error joining study session:', error);
    res.status(500).json({ error: 'Error joining study session', details: error.message });
  }
});

module.exports = router;