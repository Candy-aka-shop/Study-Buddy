const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/', validate(schemas.course), async (req, res) => {
  try {
    const { courseName, courseCode, description } = req.body;

    const codeCheckResult = await pool.query('SELECT * FROM courses WHERE course_code = $1', [courseCode]);
    if (codeCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Course code already exists' });
    }

    const insertResult = await pool.query(
      'INSERT INTO courses (course_name, course_code, description) VALUES ($1, $2, $3) RETURNING *',
      [courseName, courseCode, description || null]
    );

    res.status(201).json({ message: 'Course created successfully', course: insertResult.rows[0] });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const coursesResult = await pool.query('SELECT course_id, course_name, course_code, description FROM courses');
    res.status(200).json({ courses: coursesResult.rows });
  } catch (error) {
    console.error('Error listing courses:', error);
    res.status(500).json({ error: 'Error listing courses', details: error.message });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId) || courseId <= 0) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const courseResult = await pool.query(
      'SELECT course_id, course_name, course_code, description FROM courses WHERE course_id = $1',
      [courseId]
    );
    if (!courseResult.rows[0]) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ course: courseResult.rows[0] });
  } catch (error) {
    console.error('Error getting course by ID:', error);
    res.status(500).json({ error: 'Error getting course by ID', details: error.message });
  }
});

router.post('/me/courses', authenticateToken, validate(schemas.enroll), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    const courseCheckResult = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [courseId]);
    if (courseCheckResult.rows.length === 0) {
      return res.status(400).json({ error: 'Course not found' });
    }

    const enrollmentCheckResult = await pool.query('SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
    if (enrollmentCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    const insertResult = await pool.query(
      'INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2) RETURNING *',
      [userId, courseId]
    );

    res.status(201).json({ message: 'Successfully enrolled in course', enrollment: insertResult.rows[0] });
  } catch (error) {
    console.error('Error enrolling user in course:', error);
    res.status(500).json({ error: 'Error enrolling user in course', details: error.message });
  }
});

module.exports = router;