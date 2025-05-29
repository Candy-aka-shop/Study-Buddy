import pool from "./config/db-config.js";

async function initializeDatabase() {
  try {
    // Array of table creation queries
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        academic_year VARCHAR(50) NOT NULL,
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Study Preferences table
      `CREATE TABLE IF NOT EXISTS study_preferences (
        preference_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        preferred_group_size VARCHAR(50),
        preferred_study_style VARCHAR(50),
        study_environment_preference VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Availability table
      `CREATE TABLE IF NOT EXISTS availability (
        availability_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_day CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
        CONSTRAINT valid_time CHECK (start_time < end_time)
      )`,

      // Courses table
      `CREATE TABLE IF NOT EXISTS courses (
        course_id SERIAL PRIMARY KEY,
        course_name VARCHAR(100) NOT NULL,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // User Courses table
      `CREATE TABLE IF NOT EXISTS user_courses (
        user_course_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, course_id)
      )`,

      // Messages table
      `CREATE TABLE IF NOT EXISTS messages (
        message_id SERIAL PRIMARY KEY,
        sender_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        receiver_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        message_content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      )`,

      // Study Sessions table
      `CREATE TABLE IF NOT EXISTS study_sessions (
        session_id SERIAL PRIMARY KEY,
        creator_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        scheduled_time TIMESTAMP NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Study Session Participants table
      `CREATE TABLE IF NOT EXISTS study_session_participants (
        participant_id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES study_sessions(session_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (session_id, user_id)
      )`,

      // Study Resources table
      `CREATE TABLE IF NOT EXISTS study_resources (
        resource_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Session Ratings table
      `CREATE TABLE IF NOT EXISTS session_ratings (
        rating_id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES study_sessions(session_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (session_id, user_id)
      )`
    ];

    for (const query of tableQueries) {
      await pool.query(query);
      console.log('Table checked/created successfully');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();