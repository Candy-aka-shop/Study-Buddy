const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/', authenticateToken, validate(schemas.resource), async (req, res) => {
  try {
    const { courseId, title, fileUrl, description } = req.body;
    const userId = req.user.userId;

    const courseCheckResult = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [courseId]);
    if (courseCheckResult.rows.length === 0) {
      return res.status(400).json({ error: 'Course not found' });
    }

    const insertResult = await pool.query(
      'INSERT INTO study_resources (user_id, course_id, title, file_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, courseId, title, fileUrl, description || null]
    );

    res.status(201).json({ message: 'Resource shared successfully', resource: insertResult.rows[0] });
  } catch (error) {
    console.error('Error sharing resource:', error);
    res.status(500).json({ error: 'Error sharing resource', details: error.message });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId) || courseId <= 0) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const resourcesResult = await pool.query(
      'SELECT resource_id, user_id, course_id, title, file_url, description, created_at FROM study_resources WHERE course_id = $1',
      [courseId]
    );
    res.status(200).json({ resources: resourcesResult.rows });
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ error: 'Error getting resources', details: error.message });
  }
});

module.exports = router;