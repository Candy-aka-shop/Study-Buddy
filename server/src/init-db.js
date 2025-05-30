const pool = require('./config/db-config');

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // await client.query(`
    //   DROP TABLE IF EXISTS suggestions CASCADE;
    //   DROP TABLE IF EXISTS messages CASCADE;
    //   DROP TABLE IF EXISTS chat_room_participants CASCADE;
    //   DROP TABLE IF EXISTS chat_rooms CASCADE;
    //   DROP TABLE IF EXISTS refresh_tokens CASCADE;
    //   DROP TABLE IF EXISTS files CASCADE;
    //   DROP TABLE IF EXISTS users CASCADE;
    // `);
    await client.query(`
      CREATE TABLE users (
        user_id UUID PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        academic_year VARCHAR(50),
        profile_picture TEXT,
        courses TEXT[],
        study_style VARCHAR(50),
        available_days JSONB,
        study_preferences TEXT[],
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE refresh_tokens (
        token_id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id)
      );
    `);
    await client.query(`
      CREATE TABLE files (
        file_id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE chat_rooms (
        chat_room_id UUID PRIMARY KEY,
        created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        is_direct BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE chat_room_participants (
        participant_id UUID PRIMARY KEY,
        chat_room_id UUID NOT NULL REFERENCES chat_rooms(chat_room_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_room_id, user_id)
      );
    `);
    await client.query(`
      CREATE TABLE messages (
        message_id UUID PRIMARY KEY,
        chat_room_id UUID NOT NULL REFERENCES chat_rooms(chat_room_id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        sender_username VARCHAR(100) NOT NULL,
        sender_profile_picture TEXT,
        message_content TEXT,
        attachments JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      );
    `);
    await client.query(`
      CREATE TABLE suggestions (
        suggestion_id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        suggested_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        common_courses TEXT[],
        study_style_match VARCHAR(50),
        availability_overlap JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, suggested_user_id)
      );
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chat_room_participants_chat_room_id ON chat_room_participants(chat_room_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);');
    await client.query('COMMIT');
    console.log('Database initialization completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

initializeDatabase();