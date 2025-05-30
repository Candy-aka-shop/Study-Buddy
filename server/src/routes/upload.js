const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const pool = require('../config/db-config');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/upload-signature', authenticateToken, async (req, res) => {
  try {
    const { upload_preset, folder } = req.body;
    if (!upload_preset || !folder) {
      return res.status(400).json({ error: 'Missing upload_preset or folder' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, upload_preset, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      upload_preset,
      folder,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate signature', details: error.message });
  }
});

router.post('/store-file-url', authenticateToken, async (req, res) => {
  try {
    const { file_url, file_type } = req.body;
    if (!file_url || !file_type) {
      return res.status(400).json({ error: 'Missing file_url or file_type' });
    }

    const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [req.user.userId]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const result = await pool.query(
      'INSERT INTO files (file_id, user_id, file_url, file_type, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING file_id, file_url, file_type',
      [uuidv4(), req.user.userId, file_url, file_type]
    );

    res.status(200).json({ message: 'File URL stored successfully', file: result.rows[0] });
  } catch (error) {
    console.error('Error storing file URL:', error);
    res.status(500).json({ error: 'Failed to store file URL', details: error.message });
  }
});

module.exports = router;