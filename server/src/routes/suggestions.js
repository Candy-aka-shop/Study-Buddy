const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const calculateTimeOverlap = (slot1, slot2) => {
  console.log('suggestionsRouter: Calculating time overlap:', { slot1, slot2 });
  const start1 = new Date(`1970-01-01T${slot1.startTime}Z`);
  const end1 = new Date(`1970-01-01T${slot1.endTime}Z`);
  const start2 = new Date(`1970-01-01T${slot2.startTime}Z`);
  const end2 = new Date(`1970-01-01T${slot2.endTime}Z`);

  const start = new Date(Math.max(start1, start2));
  const end = new Date(Math.min(end1, end2));
  return end > start ? (end - start) / 60000 : 0;
};

router.get('/me', authenticateToken, async (req, response) => {
  try {
    console.log('suggestionsRouter: Handling /suggestions/me for user:', req.user.userId);
    response.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.set('Pragma', 'no-cache');
    response.set('Expires', '0');

    const currentUserId = req.user.userId;

    console.log('suggestionsRouter: Querying user data for user_id:', currentUserId);
    const userResult = await pool.query(
      `SELECT study_style, available_days, academic_year, courses, study_preferences
       FROM users
       WHERE user_id = $1`,
      [currentUserId]
    );

    if (userResult.rows.length === 0) {
      console.log('suggestionsRouter: User not found:', currentUserId);
      return response.status(404).json({ error: 'User not found' });
    }

    const { study_style: currentUserStyle, available_days: currentUserSlots, academic_year: currentAcademicYear, courses: currentUserCourses, study_preferences: currentUserPreferences } = userResult.rows[0];
    console.log('suggestionsRouter: Current user data:', { studyStyle: currentUserStyle, availableDays: currentUserSlots, academicYear: currentAcademicYear, courses: currentUserCourses, studyPreferences: currentUserPreferences });

    console.log('suggestionsRouter: Querying potential matches');
    const potentialMatchesResult = await pool.query(
      `SELECT 
        u.user_id, u.username, u.email, u.first_name, u.last_name, 
        u.academic_year, u.profile_picture, u.study_style, u.available_days, u.courses, u.study_preferences
      FROM users u
      WHERE u.user_id != $1 AND u.study_style IS NOT NULL`,
      [currentUserId]
    );
    console.log('suggestionsRouter: Potential matches:', potentialMatchesResult.rows.length);

    const suggestions = [];

    for (const match of potentialMatchesResult.rows) {
      const studyStyleMatch = currentUserStyle && match.study_style && 
        currentUserStyle.toLowerCase() === match.study_style.toLowerCase() ? 'Match' : 'No Match';

      const commonCourses = currentUserCourses && match.courses ? 
        currentUserCourses.filter(course => match.courses.includes(course)) : [];

      let overlapScore = 0;
      const overlappingSlots = [];

      if (currentUserSlots && match.available_days) {
        for (const matchSlot of match.available_days) {
          for (const currentUserSlot of currentUserSlots) {
            if (currentUserSlot.day === matchSlot.day) {
              const overlap = calculateTimeOverlap(currentUserSlot, matchSlot);
              if (overlap > 0) {
                overlapScore += overlap;
                overlappingSlots.push({
                  day: currentUserSlot.day,
                  startTime: currentUserSlot.startTime,
                  endTime: currentUserSlot.endTime,
                  overlapDurationMinutes: overlap
                });
              }
            }
          }
        }
      }

      suggestions.push({
        userId: match.user_id,
        username: `@${match.username}`,
        name: `${match.first_name || ''} ${match.last_name || ''}`.trim(),
        studyStyle: match.study_style || 'Not specified',
        studyStyleMatch,
        academicYear: match.academic_year || 'Not specified',
        courses: match.courses || [],
        availableDays: match.available_days || [],
        avatar: match.profile_picture || null,
        overlapScore: overlapScore || 0,
        commonCourses
      });
    }

    console.log('suggestionsRouter: Generated suggestions:', suggestions.length);
    suggestions.sort((a, b) => b.overlapScore - a.overlapScore || (a.name || '').localeCompare(b.name || ''));

    for (const suggestion of suggestions) {
      console.log('suggestionsRouter: Inserting suggestion for user:', suggestion.userId);
      await pool.query(
        `INSERT INTO suggestions (suggestion_id, user_id, suggested_user_id, common_courses, study_style_match, availability_overlap, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, suggested_user_id) DO UPDATE
        SET 
          common_courses = EXCLUDED.common_courses,
          study_style_match = EXCLUDED.study_style_match,
          availability_overlap = EXCLUDED.availability_overlap,
          updated_at = CURRENT_TIMESTAMP`,
        [
          currentUserId,
          suggestion.userId,
          suggestion.commonCourses,
          suggestion.studyStyleMatch,
          JSON.stringify(suggestion.availableDays)
        ]
      );
    }

    response.status(200).json({ message: 'Study buddy suggestions retrieved successfully', suggestions });
  } catch (error) {
    console.error('suggestionsRouter: Error getting study buddy suggestions:', error);
    response.status(500).json({ error: 'Error getting study buddy suggestions', details: error.message });
  }
});

module.exports = router;