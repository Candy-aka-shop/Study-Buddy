const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db-config');
const { validate, schemas } = require('../middleware/validate');
const router = express.Router();

router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { name, email, password, academicYear, profilePicture } = req.body;

    const emailCheckResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, password, academic_year, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, academic_year, profile_picture',
      [name, email, hashedPassword, academicYear, profilePicture || null]
    );

    res.status(201).json({ message: 'User registered successfully', user: insertResult.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { userId: user.user_id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, user: { userId: user.user_id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;