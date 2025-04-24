const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
// const { initializeDatabase } = require('./db/db');
const dashRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const app = express();

app.set('trust proxy', 1); // Trust the first proxy

// Config
const PORT = 3000;
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

// initializeDatabase();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', dashRoutes);
app.use('/api',settingsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

