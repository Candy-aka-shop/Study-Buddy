const express = require('express');
const pool = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const isValidUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

module.exports = (io) => {
  router.post('/room', authenticateToken, async (req, res) => {
    try {
      const { title, participantUsernames, isGroup } = req.body;
      const creatorId = req.user.userId;
      const creatorUsername = req.user.username;

      console.log('POST /room: Request:', { title, participantUsernames, creatorId, isGroup, creatorUsername });

      if (!title?.trim()) {
        console.error('POST /room: Missing title');
        return res.status(400).json({ error: 'Room title required' });
      }

      if (!creatorId || !creatorUsername) {
        console.error('POST /room: Missing creator data:', { creatorId, creatorUsername });
        return res.status(400).json({ error: 'Creator data required' });
      }

      if (!Array.isArray(participantUsernames) || participantUsernames.length < 1) {
        console.error('POST /room: At least one participant username required:', participantUsernames);
        return res.status(400).json({ error: 'At least one participant username required' });
      }

      const validUsernames = participantUsernames.filter(u => u && typeof u === 'string' && u !== creatorUsername);
      if (validUsernames.length < 1) {
        console.error('POST /room: At least one valid participant username required:', participantUsernames);
        return res.status(400).json({ error: 'At least one valid participant username required' });
      }

      const usernames = [...new Set([...validUsernames, creatorUsername])];

      const userResult = await pool.query(
        'SELECT user_id, username FROM users WHERE username = ANY($1)',
        [usernames]
      );

      const users = userResult.rows;
      const foundUsernames = users.map(u => u.username);
      const invalidUsernames = usernames.filter(u => !foundUsernames.includes(u));

      if (invalidUsernames.length > 0) {
        console.error('POST /room: Invalid usernames:', invalidUsernames);
        return res.status(400).json({ error: `Invalid usernames: ${invalidUsernames.join(', ')}` });
      }

      if (users.length < 2) {
        console.error('POST /room: At least two participants required:', users);
        return res.status(400).json({ error: 'At least two valid participants required' });
      }

      const isDirect = !isGroup && usernames.length === 2;
      let existingRoom = null;
      if (isDirect) {
        const participantIds = users.map(u => u.user_id).sort();
        existingRoom = await pool.query(`
          SELECT cr.chat_room_id
          FROM chat_rooms cr
          JOIN chat_room_participants crp ON cr.chat_room_id = crp.chat_room_id
          WHERE cr.is_direct = true
          GROUP BY cr.chat_room_id
          HAVING ARRAY_AGG(crp.user_id ORDER BY crp.user_id) = $1
        `, [participantIds]);

        if (existingRoom.rows.length > 0) {
          const roomData = await getRoomData(existingRoom.rows[0].chat_room_id);
          console.log('POST /room: Existing room:', JSON.stringify(roomData, null, 2));
          return res.json({ message: 'Room already exists', room: roomData });
        }
      }

      const roomId = uuidv4();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          'INSERT INTO chat_rooms (chat_room_id, created_by, title, is_direct) VALUES ($1, $2, $3, $4)',
          [roomId, creatorId, title, isDirect]
        );

        const participantValues = users.map((user, index) => 
          `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        ).join(',');
        const participantParams = users.flatMap(user => [uuidv4(), roomId, user.user_id]);

        await client.query(
          `INSERT INTO chat_room_participants (participant_id, chat_room_id, user_id) VALUES ${participantValues}`,
          participantParams
        );

        const participantCount = await client.query(
          'SELECT COUNT(*) FROM chat_room_participants WHERE chat_room_id = $1',
          [roomId]
        );
        if (parseInt(participantCount.rows[0].count) < 2) {
          await client.query('ROLLBACK');
          console.error('POST /room: Failed to add at least two participants:', participantCount.rows[0].count);
          throw new Error('Failed to add at least two participants');
        }

        await client.query('COMMIT');

        const roomData = await getRoomData(roomId);
        if (!roomData.participants || roomData.participants.length < 2) {
          console.error('POST /room: Invalid room data after creation:', roomData);
          throw new Error('Room creation failed: invalid participant data');
        }

        console.log('POST /room: Created room:', JSON.stringify(roomData, null, 2));

        users.forEach(user => {
          io.to(user.user_id).emit('roomCreated', roomData);
        });

        res.json({ message: 'Room created', room: roomData });

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('POST /room: Database error:', error.message, error.stack);
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('POST /room: Error:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/my-rooms', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      const result = await pool.query(`
        SELECT 
          cr.chat_room_id,
          cr.title,
          cr.is_direct,
          cr.created_at,
          cr.updated_at,
          ARRAY_AGG(u.username ORDER BY u.username) AS participants,
          ARRAY_AGG(u.user_id ORDER BY u.username) AS participant_ids
        FROM chat_rooms cr
        JOIN chat_room_participants crp ON cr.chat_room_id = crp.chat_room_id
        JOIN users u ON crp.user_id = u.user_id
        WHERE cr.chat_room_id IN (
          SELECT DISTINCT crp2.chat_room_id 
          FROM chat_room_participants crp2 
          WHERE crp2.user_id = $1
        )
        GROUP BY cr.chat_room_id, cr.title, cr.is_direct, cr.created_at, cr.updated_at
        ORDER BY cr.updated_at DESC
      `, [userId]);

      result.rows.forEach(row => {
        if (!row.participants || row.participants.length < 2) {
          console.warn('GET /my-rooms: Invalid participants for room:', row);
        }
      });

      res.json({ rooms: result.rows });
    } catch (error) {
      console.error('GET /my-rooms: Error:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/room/:roomId', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    if (!isValidUUID(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    try {
      const roomData = await getRoomData(roomId);
      if (!roomData.chat_room_id) {
        return res.status(404).json({ error: 'Room not found' });
      }
      if (!roomData.participants || roomData.participants.length < 2) {
        console.error('GET /room/:roomId: Invalid participants:', roomData);
        return res.status(400).json({ error: 'Room must have at least two participants' });
      }
      console.log('GET /room/:roomId: Room data:', JSON.stringify(roomData, null, 2));
      res.json({ room: roomData });
    } catch (error) {
      console.error('GET /room/:roomId: Error:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/room/:roomId/messages', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;

      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      if (!isValidUUID(roomId)) {
        console.error('GET /room/:roomId/messages: Invalid roomId:', roomId);
        return res.status(400).json({ error: 'Invalid room ID' });
      }

      const participantCheck = await pool.query(
        'SELECT 1 FROM chat_room_participants WHERE chat_room_id = $1 AND user_id = $2',
        [roomId, userId]
      );

      if (participantCheck.rows.length === 0) {
        console.error('GET /room/:roomId/messages: User not a participant:', { roomId, userId });
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
      console.error('GET /room/:roomId/messages: Error:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket.IO: User connected:', { id: socket.id, userId: socket.request.user.userId, username: socket.request.user.username });

    socket.on('joinRoom', async ({ chatRoomId, username }) => {
      try {
        if (!isValidUUID(chatRoomId)) {
          console.error('joinRoom: Invalid chatRoomId:', chatRoomId);
          socket.emit('error', { message: 'Invalid room ID' });
          return;
        }

        if (!username || username !== socket.request.user.username) {
          console.error('joinRoom: Invalid or unauthorized username:', { provided: username, expected: socket.request.user.username });
          socket.emit('error', { message: 'Invalid or unauthorized username' });
          return;
        }

        const participantCheck = await pool.query(`
          SELECT 1 
          FROM chat_room_participants crp
          JOIN users u ON crp.user_id = u.user_id
          WHERE crp.chat_room_id = $1 AND u.username = $2
        `, [chatRoomId, username]);

        if (participantCheck.rows.length === 0) {
          console.error('joinRoom: User not a participant:', { chatRoomId, username });
          socket.emit('error', { message: 'Not a participant in this room' });
          return;
        }

        socket.join(chatRoomId);
        console.log(`Socket.IO joinRoom: Socket ${socket.id} (username: ${username}) joined room ${chatRoomId}`);
        socket.emit('roomJoined', { chatRoomId, message: 'Successfully joined room' });

      } catch (error) {
        console.error('joinRoom: Error:', error.message, error.stack);
        socket.emit('error', { message: 'Failed to join room', details: error.message });
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, content, attachments = [], username } = data;
        console.log('Socket.IO sendMessage: Received:', { roomId, content, attachments, username });

        if (!isValidUUID(roomId)) {
          console.error('sendMessage: Invalid roomId:', roomId);
          throw new Error('Invalid room ID');
        }

        if (!content?.trim() && (!attachments || attachments.length === 0)) {
          console.error('sendMessage: No content or attachments');
          throw new Error('Message content or attachments required');
        }

        if (!username || username !== socket.request.user.username) {
          console.error('sendMessage: Invalid or unauthorized username:', { provided: username, expected: socket.request.user.username });
          throw new Error('Unauthorized username');
        }

        const participantCheck = await pool.query(`
          SELECT u.user_id, u.username 
          FROM chat_room_participants crp
          JOIN users u ON crp.user_id = u.user_id
          WHERE crp.chat_room_id = $1 AND u.username = $2
        `, [roomId, username]);

        if (participantCheck.rows.length === 0) {
          console.error('sendMessage: User not a participant:', { roomId, username });
          throw new Error('Not a participant');
        }

        const userId = participantCheck.rows[0].user_id;
        const senderUsername = participantCheck.rows[0].username;

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
          `, [messageId, roomId, userId, senderUsername, content, JSON.stringify(attachments)]);

          await client.query(
            'UPDATE chat_rooms SET updated_at = NOW() WHERE chat_room_id = $1',
            [roomId]
          );

          await client.query('COMMIT');

          const message = result.rows[0];
          console.log('sendMessage: Message saved and broadcasted:', message);
          io.to(roomId).emit('newMessage', message);

        } catch (error) {
          await client.query('ROLLBACK');
          console.error('sendMessage: Database error:', error.message, error.stack);
          throw error;
        } finally {
          client.release();
        }

      } catch (error) {
        console.error('sendMessage: Error:', error.message, error.stack);
        socket.emit('error', { message: 'Failed to send message', details: error.message });
      }
    });

    socket.on('leaveRoom', (roomId) => {
      if (isValidUUID(roomId)) {
        socket.leave(roomId);
        console.log(`Socket.IO: Socket ${socket.id} left room ${roomId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO: User disconnected:', socket.id);
    });
  });

  async function getRoomData(roomId) {
    const result = await pool.query(`
      SELECT 
        cr.chat_room_id,
        cr.title,
        cr.is_direct,
        cr.created_at,
        cr.updated_at,
        ARRAY_AGG(u.username ORDER BY u.username) AS participants,
        ARRAY_AGG(u.user_id ORDER BY u.username) AS participant_ids
      FROM chat_rooms cr
      JOIN chat_room_participants crp ON cr.chat_room_id = crp.chat_room_id
      JOIN users u ON crp.user_id = u.user_id
      WHERE cr.chat_room_id = $1
      GROUP BY cr.chat_room_id, cr.title, cr.is_direct, cr.created_at, cr.updated_at
    `, [roomId]);

    const room = result.rows[0] || {};
    if (room.participants && room.participants.length < 2) {
      console.warn('getRoomData: Invalid participants count:', room);
    }
    return room;
  }

  return router;
};