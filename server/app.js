const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dbUtils = require('./db/db');
const taskRoutes = require('./routes/tasks');

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET || 'supersecret';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

dbUtils.initializeDatabase();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

