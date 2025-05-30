const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

module.exports = (io) => {
  router.post('/room', authenticateToken, async (req, res) => {
    try {
      const { title, participantIds = [] } = req.body;
      const creatorId = req.user.userId;
      
      if (!title?.trim()) {
        return res.status(400).json({ error: 'Room title required' });
      }

      const roomId = uuidv4();
      const allParticipants = [creatorId, ...participantIds.filter(id => id !== creatorId && isValidUUID(id))];
      const isDirect = allParticipants.length === 2;
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        await client.query(
          'INSERT INTO chat_rooms (chat_room_id, created_by, title, is_direct) VALUES ($1, $2, $3, $4)',
          [roomId, creatorId, title, isDirect]
        );
        
        const participantValues = allParticipants.map((userId, index) => 
          `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        ).join(',');
        
        const participantParams = allParticipants.flatMap(userId => [uuidv4(), roomId, userId]);
        
        if (participantValues) {
          await client.query(
            `INSERT INTO chat_room_participants (participant_id, chat_room_id, user_id) VALUES ${participantValues}`,
            participantParams
          );
        }
        
        await client.query('COMMIT');
        
        const roomData = await getRoomData(roomId);
        
        io.emit('roomCreated', roomData);
        
        res.json({ message: 'Room created', room: roomData });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/my-rooms', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const result = await pool.query(`
        SELECT 
          cr.chat_room_id,
          cr.title,
          cr.created_at,
          cr.updated_at,
          ARRAY_AGG(u.username ORDER BY u.username) AS participants,
          ARRAY_AGG(u.user_id ORDER BY u.username) AS participant_ids
        FROM chat_rooms cr
        JOIN chat_room_participants crp ON cr.chat_room_id = crp.chat_room_id
        JOIN users u ON crp.user_id = u.user_id
        WHERE crp.user_id = $1
        GROUP BY cr.chat_room_id, cr.title, cr.created_at, cr.updated_at
        ORDER BY cr.updated_at DESC
      `, [userId]);
      
      res.json({ rooms: result.rows });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/room/:roomId/messages', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;
      
      if (!isValidUUID(roomId)) {
        return res.status(400).json({ error: 'Invalid room ID' });
      }
      
      const participantCheck = await pool.query(
        'SELECT 1 FROM chat_room_participants WHERE chat_room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
      
      if (participantCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not a participant' });
      }
      
      const messages = await pool.query(`
        SELECT 
          m.message_id,
          m.sender_id,
          m.sender_username,
          m.message_content,
          m.timestamp,
          m.attachments
        FROM messages m
        WHERE m.chat_room_id = $1
        ORDER BY m.timestamp ASC
      `, [roomId]);
      
      res.json({ messages: messages.rows });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('joinRoom', (roomId) => {
      if (isValidUUID(roomId)) {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      }
    });
    
    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, content, attachments = [] } = data;
        const user = socket.request.user;
        
        if (!user || !isValidUUID(roomId) || !content?.trim()) {
          return socket.emit('error', { message: 'Invalid message data' });
        }
        
        const isParticipant = await pool.query(
          'SELECT 1 FROM chat_room_participants WHERE chat_room_id = $1 AND user_id = $2',
          [roomId, user.userId]
        );
        
        if (isParticipant.rows.length === 0) {
          return socket.emit('error', { message: 'Not a participant' });
        }
        
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          const messageId = uuidv4();
          const result = await client.query(`
            INSERT INTO messages (
              message_id, chat_room_id, sender_id, sender_username,
              message_content, attachments, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
          `, [messageId, roomId, user.userId, user.username, content, JSON.stringify(attachments)]);
          
          await client.query(
            'UPDATE chat_rooms SET updated_at = NOW() WHERE chat_room_id = $1',
            [roomId]
          );
          
          await client.query('COMMIT');
          
          const message = result.rows[0];
          io.to(roomId).emit('newMessage', message);
          
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  async function getRoomData(roomId) {
    const result = await pool.query(`
      SELECT 
        cr.chat_room_id,
        cr.title,
        cr.created_at,
        cr.updated_at,
        ARRAY_AGG(u.username ORDER BY u.username) AS participants,
        ARRAY_AGG(u.user_id ORDER BY u.username) AS participant_ids
      FROM chat_rooms cr
      JOIN chat_room_participants crp ON cr.chat_room_id = crp.chat_room_id
      JOIN users u ON crp.user_id = u.user_id
      WHERE cr.chat_room_id = $1
      GROUP BY cr.chat_room_id, cr.title, cr.created_at, cr.updated_at
    `, [roomId]);
    
    return result.rows[0] || {};
  }

  return router;
};