const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/me/availability', authenticateToken, validate(schemas.availability), async (req, res) => {
  try {
    const userId = req.user.userId;
    const availabilitySlots = req.body;

    await pool.query('DELETE FROM availability WHERE user_id = $1', [userId]);

    for (const slot of availabilitySlots) {
      await pool.query(
        'INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
        [userId, slot.dayOfWeek, slot.startTime, slot.endTime]
      );
    }

    res.status(200).json({ message: 'Availability saved successfully' });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({ error: 'Error saving availability', details: error.message });
  }
});

router.delete('/me/availability/:availabilityId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const availabilityId = parseInt(req.params.availabilityId);

    if (isNaN(availabilityId) || availabilityId <= 0) {
      return res.status(400).json({ error: 'Invalid availability ID' });
    }

    const existingSlotResult = await pool.query(
      'SELECT availability_id FROM availability WHERE availability_id = $1 AND user_id = $2',
      [availabilityId, userId]
    );
    if (existingSlotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Availability slot not found or does not belong to you' });
    }

    await pool.query('DELETE FROM availability WHERE availability_id = $1', [availabilityId]);
    res.status(200).json({ message: 'Availability slot deleted successfully', availabilityId });
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    res.status(500).json({ error: 'Error deleting availability slot', details: error.message });
  }
});

router.get('/me/availability', authenticateToken, async (req, res) => {
  try {
    const availabilityResult = await pool.query(
      'SELECT availability_id, day_of_week, start_time, end_time FROM availability WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json({ availability: availabilityResult.rows });
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ error: 'Error getting availability', details: error.message });
  }
});

module.exports = router;