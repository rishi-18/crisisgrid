const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const campRoutes = require('./routes/camps');
const needRoutes = require('./routes/needs');
const volunteerRoutes = require('./routes/volunteers');
const assignmentRoutes = require('./routes/assignments');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('CrisisGrid Server is running');
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Successfully connected to MongoDB Atlas'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1); // Exit process with failure
    });
}

// Graceful Connection Error Handling
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
