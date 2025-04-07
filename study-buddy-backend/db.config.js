require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'study_buddy_db',
    password: process.env.DB_PASSWORD || 'study123',
    port: process.env.DB_PORT || 5433,
};

module.exports = dbConfig;
