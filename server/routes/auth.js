const express = require('express');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const USERS_TABLE = 'Users';

// In-memory set to limit active sessions
const activeUsers = new Set();

// Rate‐limit login attempts
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,  // 3 minutes
  max: 5,
  message: { error: 'Too many login attempts. Try again in 3 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper for 500 logging
function handleError(res, context, err) {
  console.error(`[${context}]`, err);
  return res.status(500).json({ error: `${context} failed`, details: err.message });
}

// — REGISTER —
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Check if username already exists
    const scan = await dynamo.scan({
      TableName: USERS_TABLE,
      FilterExpression: '#u = :user',
      ExpressionAttributeNames: { '#u': 'username' },
      ExpressionAttributeValues: { ':user': username },
      Limit: 1
    }).promise();

    if (scan.Items.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash & store
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const userItem = {
      id,
      username,
      user_key: hashed,
      default_view: 'day',
      notifications_enabled: true
    };

    await dynamo.put({
      TableName: USERS_TABLE,
      Item: userItem
    }).promise();

    console.log(`User created: ${username}`);
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return handleError(res, 'Register', err);
  }
});

// — LOGIN —
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (activeUsers.size >= 20) {
    return res.status(429).json({ error: 'Too many active users. Please try again later.' });
  }

  try {
    // Find the user by username
    const scan = await dynamo.scan({
      TableName: USERS_TABLE,
      FilterExpression: '#u = :user',
      ExpressionAttributeNames: { '#u': 'username' },
      ExpressionAttributeValues: { ':user': username },
      Limit: 1
    }).promise();

    if (scan.Items.length === 0) {
      return res.status(401).json({ error: 'Incorrect username.' });
    }
    const user = scan.Items[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.user_key);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Success → set session
    req.session.userId = user.id;
    activeUsers.add(user.id);
    return res.json({ message: 'Login successful.' });
  } catch (err) {
    return handleError(res, 'Login', err);
  }
});

// — WHO AM I? —
router.get('/me', (req, res) => {
  if (req.session.userId) {
    return res.json({ authenticated: true, userId: req.session.userId });
  }
  return res.status(401).json({ authenticated: false });
});

// — LOGOUT —
router.post('/logout', (req, res) => {
  if (req.session.userId) {
    activeUsers.delete(req.session.userId);
  }
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.json({ message: 'Logged out successfully.' });
  });
});

module.exports = router;
