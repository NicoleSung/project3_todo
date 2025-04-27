const express = require('express');
const path = require('path');
const cors = require('cors');
const authenticate = require('./middleware/authenticate');

const authRoutes = require('./routes/auth');
const dashRoutes = require('./routes/dashboard');
const tasksRouter = require('./routes/tasks');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your front‑end origin and credentials
app.use(cors({
  origin: 'https://todo332.duckdns.org',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public auth endpoints (register, login, who‑ami)
app.use('/api/auth', authRoutes);

// All following routes require a valid Cognito JWT in Authorization: Bearer <token>
app.use('/api/dashboard', authenticate, dashRoutes);
app.use('/api/tasks',     authenticate, tasksRouter);
app.use('/api/settings',  authenticate, settingsRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});