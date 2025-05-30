import pool from './src/config/db-config.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query(`
      TRUNCATE TABLE suggestions, messages, chat_room_participants, chat_rooms, 
      study_preferences, refresh_tokens, users RESTART IDENTITY CASCADE;
    `);

    // Seed users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const users = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password_hash: hashedPassword,
        username: 'johndoe',
        academic_year: 'Sophomore',
        profile_picture: 'https://res.cloudinary.com/demo/image/upload/john_doe.jpg',
        is_verified: true,
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password_hash: hashedPassword,
        username: 'janesmith',
        academic_year: 'Junior',
        profile_picture: 'https://res.cloudinary.com/demo/image/upload/jane_smith.jpg',
        is_verified: true,
      },
      {
        first_name: 'Alex',
        last_name: 'Brown',
        email: 'alex.brown@example.com',
        password_hash: hashedPassword,
        username: 'alexbrown',
        academic_year: 'Freshman',
        profile_picture: 'https://res.cloudinary.com/demo/image/upload/alex_brown.jpg',
        is_verified: true,
      },
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, username, 
          academic_year, profile_picture, is_verified, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING user_id`,
        [
          user.first_name,
          user.last_name,
          user.email,
          user.password_hash,
          user.username,
          user.academic_year,
          user.profile_picture,
          user.is_verified,
        ]
      );
    }

    // Seed refresh tokens
    const refreshTokens = [
      { user_id: 1, refresh_token: 'token_john_123', expires_at: '2025-06-28 00:00:00' },
      { user_id: 2, refresh_token: 'token_jane_456', expires_at: '2025-06-28 00:00:00' },
      { user_id: 3, refresh_token: 'token_alex_789', expires_at: '2025-06-28 00:00:00' },
    ];

    for (const token of refreshTokens) {
      await client.query(
        `INSERT INTO refresh_tokens (user_id, refresh_token, expires_at, created_at, updated_at) 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [token.user_id, token.refresh_token, token.expires_at]
      );
    }

    // Seed study preferences
    const studyPreferences = [
      {
        user_id: 1,
        year_of_study: 'Sophomore',
        courses: ['Calculus', 'Physics', 'Chemistry'],
        study_style: 'Group',
        available_slots: [
          { day_of_week: 'Monday', start_time: '14:00:00', end_time: '16:00:00' },
          { day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '12:00:00' },
        ],
      },
      {
        user_id: 2,
        year_of_study: 'Junior',
        courses: ['Chemistry', 'Biology'],
        study_style: 'Mixed',
        available_slots: [
          { day_of_week: 'Monday', start_time: '15:00:00', end_time: '17:00:00' },
          { day_of_week: 'Friday', start_time: '13:00:00', end_time: '15:00:00' },
        ],
      },
      {
        user_id: 3,
        year_of_study: 'Freshman',
        courses: ['Physics', 'Calculus'],
        study_style: 'Individual',
        available_slots: [
          { day_of_week: 'Monday', start_time: '14:30:00', end_time: '16:30:00' },
          { day_of_week: 'Thursday', start_time: '09:00:00', end_time: '11:00:00' },
        ],
      },
    ];

    for (const pref of studyPreferences) {
      await client.query(
        `INSERT INTO study_preferences (user_id, year_of_study, courses, study_style, 
          available_slots, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          pref.user_id,
          pref.year_of_study,
          pref.courses,
          pref.study_style,
          pref.available_slots,
        ]
      );
    }

    // Seed chat rooms
    const chatRooms = [
      { created_by: 1, title: 'Calculus Study Group' },
      { created_by: 2, title: 'Chemistry Discussion' },
    ];

    for (const room of chatRooms) {
      const roomResult = await client.query(
        `INSERT INTO chat_rooms (created_by, title, created_at, updated_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING chat_room_id`,
        [room.created_by, room.title]
      );
      const chatRoomId = roomResult.rows[0].chat_room_id;

      // Seed chat room participants
      const participants = room.created_by === 1 ? [1, 2, 3] : [2, 1];
      for (const userId of participants) {
        await client.query(
          `INSERT INTO chat_room_participants (chat_room_id, user_id, joined_at) 
          VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [chatRoomId, userId]
        );
      }
    }

    // Seed messages
    const messages = [
      {
        chat_room_id: 1,
        sender_username: 'johndoe',
        sender_profile_picture: 'https://res.cloudinary.com/demo/image/upload/john_doe.jpg',
        message_content: 'Hey, anyone up for discussing derivatives?',
        attachments: null,
      },
      {
        chat_room_id: 1,
        sender_username: 'janesmith',
        sender_profile_picture: 'https://res.cloudinary.com/demo/image/upload/jane_smith.jpg',
        message_content: 'Sure, I need help with chain rule!',
        attachments: [
          {
            id: 'file1',
            name: 'chain_rule.pdf',
            url: 'https://res.cloudinary.com/demo/file/chain_rule.pdf',
            type: 'application/pdf',
            size: 102400,
          },
        ],
      },
      {
        chat_room_id: 2,
        sender_username: 'janesmith',
        sender_profile_picture: 'https://res.cloudinary.com/demo/image/upload/jane_smith.jpg',
        message_content: 'What’s the best way to balance chemical equations?',
        attachments: null,
      },
    ];

    for (const msg of messages) {
      await client.query(
        `INSERT INTO messages (chat_room_id, sender_username, sender_profile_picture, 
          message_content, attachments, timestamp, is_read) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)`,
        [
          msg.chat_room_id,
          msg.sender_username,
          msg.sender_profile_picture,
          msg.message_content,
          msg.attachments ? JSON.stringify(msg.attachments) : null,
          msg.is_read || false,
        ]
      );
    }

    // Seed suggestions
    const suggestions = [
      {
        user_id: 1,
        suggested_user_id: 2,
        common_courses: ['Chemistry'],
        study_style_match: 'Mixed',
        availability_overlap: [
          { day_of_week: 'Monday', start_time: '15:00:00', end_time: '16:00:00' },
        ],
      },
      {
        user_id: 1,
        suggested_user_id: 3,
        common_courses: ['Calculus', 'Physics'],
        study_style_match: 'Individual',
        availability_overlap: [
          { day_of_week: 'Monday', start_time: '14:30:00', end_time: '16:00:00' },
        ],
      },
      {
        user_id: 2,
        suggested_user_id: 3,
        common_courses: [],
        study_style_match: 'Individual',
        availability_overlap: [],
      },
    ];

    for (const sugg of suggestions) {
      await client.query(
        `INSERT INTO suggestions (user_id, suggested_user_id, common_courses, 
          study_style_match, availability_overlap, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          sugg.user_id,
          sugg.suggested_user_id,
          sugg.common_courses,
          sugg.study_style_match,
          sugg.availability_overlap,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    client.release();
  }
}

seedDatabase().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});