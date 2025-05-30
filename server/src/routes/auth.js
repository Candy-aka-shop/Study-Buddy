const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db-config');
const { validate, schemas } = require('../middleware/validate');
const { sendVerificationEmail } = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    const emailCheck = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (emailCheck.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const usernameCheck = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length) return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    const userId = uuidv4();

    const insertUser = await pool.query(
      `INSERT INTO users (user_id, email, password_hash, username, first_name, last_name, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, email, username, first_name, last_name, is_verified`,
      [userId, email.toLowerCase(), hashedPassword, username.toLowerCase(), firstName.toLowerCase(), lastName.toLowerCase(), false]
    );

    await sendVerificationEmail(email, verificationLink);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: insertUser.rows[0],
      is_verified: false
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.query;
    const decodedEmail = decodeURIComponent(email);

    if (!decodedEmail || !token) {
      return res.status(400).json({ error: 'Email and verification token are required' });
    }

    let verifyPayload;
    try {
      verifyPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (verifyPayload.email.toLowerCase() !== decodedEmail.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match verification token' });
    }

    const userCheck = await pool.query('SELECT is_verified FROM users WHERE LOWER(email) = LOWER($1)', [decodedEmail]);
    if (!userCheck.rows.length) {
      return res.status(404).json({ error: 'Email not found' });
    }
    if (userCheck.rows[0].is_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const result = await pool.query(
      'UPDATE users SET is_verified = true WHERE LOWER(email) = LOWER($1) AND is_verified = false RETURNING user_id, first_name, last_name, email, username, is_verified',
      [decodedEmail]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Email not found or already verified' });
    }

    const user = result.rows[0];
    const payload = { userId: user.user_id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await pool.query(
      `INSERT INTO refresh_tokens (token_id, user_id, refresh_token, expires_at)
       VALUES ($1, $2, $3, NOW() + interval '7 days')
       ON CONFLICT (user_id) DO UPDATE SET 
       refresh_token = $3, 
       updated_at = NOW(), 
       expires_at = NOW() + interval '7 days'`,
      [uuidv4(), user.user_id, refreshToken]
    );

    res.status(200).json({
      message: 'Email verified successfully',
      user,
      is_verified: true,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'An error occurred while verifying email' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const decodedEmail = decodeURIComponent(email);
    const result = await pool.query('SELECT user_id, is_verified FROM users WHERE LOWER(email) = LOWER($1)', [decodedEmail]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_verified) return res.status(400).json({ error: 'Email already verified' });

    const token = jwt.sign({ email: decodedEmail }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const link = `${process.env.FRONTEND_URL}/verify-email?email=${encodeURIComponent(decodedEmail)}&token=${token}`;

    await sendVerificationEmail(decodedEmail, link);
    res.status(200).json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'An error occurred while resending verification email' });
  }
});

router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const decodedEmail = decodeURIComponent(email);
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [decodedEmail]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ userId: user.user_id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.user_id, email: user.email });

    await pool.query(
      `INSERT INTO refresh_tokens (token_id, user_id, refresh_token, expires_at)
       VALUES ($1, $2, $3, NOW() + interval '7 days')
       ON CONFLICT (user_id) DO UPDATE SET refresh_token = $3, updated_at = NOW(), expires_at = NOW() + interval '7 days'`,
      [uuidv4(), user.user_id, refreshToken]
    );

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        userId: user.user_id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_verified: user.is_verified
      },
      is_verified: user.is_verified
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1 AND refresh_token = $2`,
      [payload.userId, refreshToken]
    );
    if (!result.rows.length) return res.status(403).json({ error: 'Refresh token not found or expired' });

    const userResult = await pool.query('SELECT email FROM users WHERE user_id = $1', [payload.userId]);
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found' });

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: userResult.rows[0].email });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: userResult.rows[0].email });

    await pool.query(
      `UPDATE refresh_tokens SET refresh_token = $1, updated_at = NOW(), expires_at = NOW() + interval '7 days'
       WHERE user_id = $2`,
      [newRefreshToken, payload.userId]
    );

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'An error occurred while refreshing token' });
  }
});

module.exports = router;