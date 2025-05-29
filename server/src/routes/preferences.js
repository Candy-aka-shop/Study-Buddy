const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/me/preferences', authenticateToken, validate(schemas.preferences), async (req, res) => {
  try {
    const { preferredGroupSize, preferredStudyStyle, studyEnvironmentPreference } = req.body;
    const userId = req.user.userId;

    const existingPreferencesResult = await pool.query('SELECT * FROM study_preferences WHERE user_id = $1', [userId]);
    let query, values;

    if (existingPreferencesResult.rows[0]) {
      const updates = [];
      values = [userId];
      let valueIndex = 2;

      if (preferredGroupSize) {
        updates.push(`preferred_group_size = $${valueIndex}`);
        values.push(preferredGroupSize);
        valueIndex++;
      }
      if (preferredStudyStyle) {
        updates.push(`preferred_study_style = $${valueIndex}`);
        values.push(preferredStudyStyle);
        valueIndex++;
      }
      if (studyEnvironmentPreference) {
        updates.push(`study_environment_preference = $${valueIndex}`);
        values.push(studyEnvironmentPreference);
        valueIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No preferences to update provided' });
      }

      query = `UPDATE study_preferences SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`;
    } else {
      query = `INSERT INTO study_preferences (user_id, preferred_group_size, preferred_study_style, study_environment_preference) VALUES ($1, $2, $3, $4) RETURNING *`;
      values = [userId, preferredGroupSize || null, preferredStudyStyle || null, studyEnvironmentPreference || null];
    }

    const preferenceResult = await pool.query(query, values);
    res.status(200).json({ message: 'Study preferences saved successfully', preferences: preferenceResult.rows[0] });
  } catch (error) {
    console.error('Error saving study preferences:', error);
    res.status(500).json({ error: 'Error saving study preferences', details: error.message });
  }
});

router.get('/me/preferences', authenticateToken, async (req, res) => {
  try {
    const preferencesResult = await pool.query(
      'SELECT preference_id, preferred_group_size, preferred_study_style, study_environment_preference FROM study_preferences WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json({ preferences: preferencesResult.rows[0] || null });
  } catch (error) {
    console.error('Error getting study preferences:', error);
    res.status(500).json({ error: 'Error getting study preferences', details: error.message });
  }
});

module.exports = router;