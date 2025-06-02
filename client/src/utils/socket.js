// client/src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      const userData = JSON.parse(atob(token.split('.')[1])); 
      if (!userData.userId) {
        return;
      }

      this.socket = io(SOCKET_URL, {
        path: '/mysocket',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket.id, 'Namespace:', this.socket.nsp);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message, 'Details:', error);
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO server error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });
    } catch (error) {
      console.error('Socket.IO: Token parsing error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(chatRoomId, username) {
    if (this.socket && chatRoomId && username) {
      this.socket.emit('joinRoom', { chatRoomId, username });
    }
  }

  leaveRoom(chatRoomId) {
    if (this.socket && chatRoomId) {
      this.socket.emit('leaveRoom', chatRoomId);
    }
  }

  sendMessage(chatRoomId, content, attachments, username) {
    if (this.socket && chatRoomId && username) {
      const messageData = { roomId: chatRoomId, content, attachments, username };
      this.socket.emit('sendMessage', messageData);
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('newMessage', (message) => {
        callback(message);
      });
    }
  }

  onRoomCreated(callback) {
    if (this.socket) {
      this.socket.on('roomCreated', (room) => {
        if (!room?.participants || room.participants.length < 2) {
          return;
        }
        callback(room);
      });
    }
  }

  onRoomUpdate(callback) {
    if (this.socket) {
      this.socket.on('roomUpdate', (room) => {
        callback(room);
      });
    }
  }

  offMessageReceived() {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }

  offRoomCreated() {
    if (this.socket) {
      this.socket.off('roomCreated');
    }
  }

  offRoomUpdate() {
    if (this.socket) {
      this.socket.off('roomUpdate');
    }
  }
}

export const socketService = new SocketService();