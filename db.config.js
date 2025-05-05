require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  user: process.env.DB_USER || 'postgres', // Default to 'postgres' if DB_USER is not set
  host: process.env.DB_HOST || 'localhost', // Default to 'localhost' if DB_HOST is not set
  database: process.env.DB_NAME || 'study_buddy_db', // Default to 'study_buddy_db'
  password: process.env.DB_PASSWORD || 'your_password', // Replace 'your_password' with your actual PostgreSQL password
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
};