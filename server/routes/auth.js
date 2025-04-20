const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { db } = require('../db/db');
const activeUsers = new Set();
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5,                  // Limit each IP to 5 login attempts per window
    message: {
      error: 'Too many login attempts. Try again in 3 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Register
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if the user already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (row) {
        return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        const insertQuery = 'INSERT INTO users (username, user_key) VALUES (?, ?)';
        
        db.run(insertQuery, [username, hashedPassword], function(err) {
        if (err) {
            console.error('DB SELECT error:', err);
            return res.status(500).json({ error: 'Database error during lookup' });
        }
                
        console.log('User created:', username);

        res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// Login
router.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;

    if (activeUsers.size >= 20) { // Limit active users to 20
        return res.status(429).json({ error: 'Too many active users. Please try again later.' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user) return res.status(401).json({ error: 'Incorrect username.' });

        const isValid = bcrypt.compareSync(password, user.user_key);
        if (!isValid) return res.status(401).json({ error: 'Incorrect password.' });

        req.session.userId = user.id;
        activeUsers.add(user.id); // Add user to active users set
        res.json({ message: 'Login successful.' });
    });
});

// Check if user is authenticated
router.get('/me', (req, res) => {
    if (req.session.userId) {
      res.json({ authenticated: true, userId: req.session.userId });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });
  
// Logout
router.post('/logout', (req, res) => {
    if (req.session.userId) {
        activeUsers.delete(req.session.userId); // Remove user from active users set
    }

    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully.' });
    });
});

module.exports = router;
