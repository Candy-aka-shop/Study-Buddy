const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { calculateTimeOverlap } = require('../utils/timeOverlap');
const router = express.Router();

router.get('/me/study-buddies', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const userCoursesResult = await pool.query('SELECT course_id FROM user_courses WHERE user_id = $1', [currentUserId]);
    const currentUserCourseIds = userCoursesResult.rows.map((row) => row.course_id);

    const currentUserAvailabilityResult = await pool.query('SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = $1', [currentUserId]);
    const currentUserAvailability = currentUserAvailabilityResult.rows;

    if (currentUserCourseIds.length === 0) {
      return res.status(200).json({ message: 'No study buddy suggestions available. You are not enrolled in any courses yet.', suggestions: [] });
    }

    const potentialMatchesResult = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.academic_year, u.profile_picture,
         ARRAY_AGG(DISTINCT uc.course_id) AS shared_course_ids
       FROM users u
       INNER JOIN user_courses uc ON u.user_id = uc.user_id
       WHERE uc.course_id IN (${currentUserCourseIds.map((_, index) => `$${index + 1}`).join(', ')}) 
         AND u.user_id != $${currentUserCourseIds.length + 1} 
       GROUP BY u.user_id, u.name, u.email, u.academic_year, u.profile_picture
       ORDER BY u.user_id`,
      [...currentUserCourseIds, currentUserId]
    );

    const potentialMatches = potentialMatchesResult.rows;
    const suggestionsWithOverlap = [];

    for (const match of potentialMatches) {
      const matchAvailabilityResult = await pool.query('SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = $1', [match.user_id]);
      const matchAvailability = matchAvailabilityResult.rows;
      let overlapScore = 0;
      const overlappingSlots = [];

      for (const matchSlot of matchAvailability) {
        for (const currentUserSlot of currentUserAvailability) {
          if (currentUserSlot.day_of_week === matchSlot.day_of_week) {
            const overlap = calculateTimeOverlap(currentUserSlot, matchSlot);
            if (overlap > 0) {
              overlapScore += overlap;
              overlappingSlots.push({
                dayOfWeek: currentUserSlot.day_of_week,
                startTime1: currentUserSlot.start_time,
                endTime1: currentUserSlot.end_time,
                startTime2: matchSlot.start_time,
                endTime2: matchSlot.end_time,
                overlapDurationMinutes: overlap,
              });
            }
          }
        }
      }

      suggestionsWithOverlap.push({
        ...match,
        overlapScore,
        overlappingAvailability: overlappingSlots,
      });
    }

    suggestionsWithOverlap.sort((a, b) => b.overlapScore - a.overlapScore);
    const filteredSuggestions = suggestionsWithOverlap.filter((suggestion) => suggestion.overlapScore > 0);

    res.status(200).json({ message: 'Study buddy suggestions retrieved successfully', suggestions: filteredSuggestions });
  } catch (error) {
    console.error('Error getting study buddy suggestions:', error);
    res.status(500).json({ error: 'Error getting study buddy suggestions', details: error.message });
  }
});

module.exports = router;