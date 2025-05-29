const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const morgan = require('morgan'); 
const compression = require('compression'); 
const rateLimit = require('express-rate-limit'); 
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const preferencesRoutes = require('./routes/preferences');
const availabilityRoutes = require('./routes/availability');
const messagesRoutes = require('./routes/messages');
const coursesRoutes = require('./routes/courses');
const studyBuddiesRoutes = require('./routes/studyBuddies');
const sessionsRoutes = require('./routes/sessions');
const resourcesRoutes = require('./routes/resources');
const ratingsRoutes = require('./routes/ratings');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
});
app.use('/api/', apiLimiter);

app.use('/api/users', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', preferencesRoutes);
app.use('/api/users', availabilityRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/users', studyBuddiesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/sessions', ratingsRoutes);

app.get('/', (req, res) => {
  res.send('Study Buddy API is running');
});

app.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
