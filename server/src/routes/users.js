const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const userResult = await pool.query(
      'SELECT user_id, first_name, last_name, email, username, COALESCE(academic_year, \'Not Specified\') AS academic_year, profile_picture, is_verified, courses, study_style, available_days FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'An error occurred while fetching profile' });
  }
});

router.patch('/me', authenticateToken, validate(schemas.updateProfile), async (req, res) => {
  try {
    const { firstName, lastName, email, password, username, academicYear, profilePicture, courses, studyStyle, availableDays } = req.body;
    const validYears = ['first year', 'second year', 'third year', 'final year'];
    const validStudyStyles = ['group', 'individual', 'mixed'];

    console.log('Update profile request body:', req.body);

    if (academicYear && !validYears.includes(academicYear.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid academic year' });
    }

    if (studyStyle && !validStudyStyles.includes(studyStyle.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid study style' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const updates = [];
    const values = [req.user.userId]; 
    let valueIndex = 2;

    if (firstName !== undefined) {
      updates.push(`first_name = $${valueIndex}`);
      values.push(firstName ? firstName.toLowerCase() : null);
      valueIndex++;
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${valueIndex}`);
      values.push(lastName ? lastName.toLowerCase() : null);
      valueIndex++;
    }
    if (email !== undefined) {
      updates.push(`email = $${valueIndex}`);
      values.push(email ? email.toLowerCase() : null);
      valueIndex++;
    }
    if (password !== undefined) {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      updates.push(`password_hash = $${valueIndex}`);
      values.push(hashedPassword);
      valueIndex++;
    }
    if (username !== undefined) {
      updates.push(`username = $${valueIndex}`);
      values.push(username ? username.toLowerCase() : null);
      valueIndex++;
    }
    if (academicYear !== undefined) {
      updates.push(`academic_year = $${valueIndex}`);
      values.push(academicYear ? academicYear.toLowerCase() : null);
      valueIndex++;
    }
    if (profilePicture !== undefined) {
      if (profilePicture && (typeof profilePicture !== 'string' || profilePicture.length > 2048)) {
        return res.status(400).json({ error: 'Invalid profile picture URL' });
      }
      updates.push(`profile_picture = $${valueIndex}`);
      values.push(profilePicture || null);
      valueIndex++;
    }
    if (courses !== undefined) {
      if (Array.isArray(courses)) {
        const pgArray = courses.length > 0 
          ? `{${courses.map(course => `"${course.replace(/"/g, '""')}"`).join(",")}}` 
          : '{}';
        updates.push(`courses = $${valueIndex}`);
        values.push(pgArray);
        valueIndex++;
      } else {
        return res.status(400).json({ error: 'Courses must be an array' });
      }
    }
    if (studyStyle !== undefined) {
      updates.push(`study_style = $${valueIndex}`);
      values.push(studyStyle ? studyStyle.toLowerCase() : null);
      valueIndex++;
    }
    if (availableDays !== undefined) {
      if (Array.isArray(availableDays)) {
        updates.push(`available_days = $${valueIndex}`);
        values.push(JSON.stringify(availableDays)); 
        valueIndex++;
      } else {
        return res.status(400).json({ error: 'Available days must be an array' });
      }
    }

    let updatedUser = null;
    if (updates.length > 0) {
      const updateResult = await pool.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 
         RETURNING user_id, first_name, last_name, email, username, academic_year, profile_picture, courses, study_style, available_days`,
        values
      );
      if (!updateResult.rows[0]) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      updatedUser = updateResult.rows[0];
    } else {
      const userResult = await pool.query(
        'SELECT user_id, first_name, last_name, email, username, academic_year, profile_picture, courses, study_style, available_days FROM users WHERE user_id = $1',
        [req.user.userId]
      );
      updatedUser = userResult.rows[0];
    }

    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'An error occurred while updating profile' });
  }
});

router.get('/by-username/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const userResult = await pool.query(
      'SELECT user_id, username FROM users WHERE username = $1',
      [username]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user_id: userResult.rows[0].user_id });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'An error occurred while fetching user' });
  }
});

module.exports = router;