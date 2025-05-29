const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT user_id, name, email, academic_year, profile_picture FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.status(200).json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Error getting user profile', details: error.message });
  }
});

router.patch('/me', authenticateToken, validate(schemas.updateProfile), async (req, res) => {
  try {
    const { name, academicYear, profilePicture } = req.body;
    const updates = [];
    const values = [req.user.userId];
    let valueIndex = 2;

    if (name) {
      updates.push(`name = $${valueIndex}`);
      values.push(name);
      valueIndex++;
    }
    if (academicYear) {
      updates.push(`academic_year = $${valueIndex}`);
      values.push(academicYear);
      valueIndex++;
    }
    if (profilePicture) {
      updates.push(`profile_picture = $${valueIndex}`);
      values.push(profilePicture);
      valueIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    const updateResult = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING user_id, name, email, academic_year, profile_picture`,
      values
    );

    if (!updateResult.rows[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({ message: 'User profile updated successfully', user: updateResult.rows[0] });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error updating user profile', details: error.message });
  }
});

module.exports = router;