const jwt = require('jsonwebtoken');
const pool = require('../config/db-config');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      console.error('authenticateToken: Invalid user data in token:', decoded);
      return res.status(403).json({ error: 'Invalid user data in token' });
    }

    const userResult = await pool.query(
      'SELECT username FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      console.error('authenticateToken: User not found for userId:', decoded.userId);
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = { userId: decoded.userId, username: userResult.rows[0].username };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return next(new Error('Authentication error: Invalid user data in token'));
    }

    const userResult = await pool.query(
      'SELECT username FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.request.user = { userId: decoded.userId, username: userResult.rows[0].username };
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = { authenticateToken, authenticateSocket };