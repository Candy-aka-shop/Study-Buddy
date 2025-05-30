const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const suggestionsRoutes = require('./routes/suggestions');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chatRoom');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
  path: '/mysocket', 
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// const apiLimiter = rateLimit({
//   windowMs: 20 * 60 * 1000,
//   max: 100,
// });
// app.use('/api/', apiLimiter);

io.use(authenticateSocket);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatrooms', chatRoutes(io));

app.get('/', (req, res) => {
  res.send('Study Buddy API is running');
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});