// const express = require('express');
// const path = require('path');
// const session = require('express-session');
// const cors = require('cors');
// const authRoutes = require('./routes/auth');
// const dashRoutes = require('./routes/dashboard');
// const tasksRouter = require('./routes/tasks');
// const settingsRoutes = require('./routes/settings');
// const authenticate = require('./middleware/authenticate');

// const app = express();

// app.set('trust proxy', 1); // Trust the first proxy

// // Config
// const PORT = 3000;
// const SECRET = process.env.SESSION_SECRET || 'supersecret';

// // Middleware
// app.use(cors({
//   origin: 'https://todo332.duckdns.org',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Session middleware is no longer needed for JWT, but can be left temporarily
// app.use(session({
//   secret: SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false }
// }));

// // Mount routes

// // --- Public route (no auth) ---
// app.use('/api/auth', authRoutes);

// // --- Protected routes (requires valid Cognito JWT) ---
// app.use('/api/dashboard', authenticate, dashRoutes);
// app.use('/api/settings', authenticate, settingsRoutes);
// app.use('/api/tasks', authenticate, tasksRouter);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });


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

// Serve static front‑end (if any)
// app.use(express.static(path.join(__dirname, '../client/dist')));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});