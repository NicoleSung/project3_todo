const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db/db').connectDB();

// Register
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if the user already exists
    db.get('SELECT * FROM user WHERE username = ?', [username], (err, row) => {
        if (row) {
        return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        const insertQuery = 'INSERT INTO user (username, user_key) VALUES (?, ?)';
        
        db.run(insertQuery, [username, hashedPassword], function(err) {
        if (err) {
            console.error('DB SELECT error:', err);
            return res.status(500).json({ error: 'Database error during lookup' });
        }
        
        if (row) {
        return res.status(409).json({ error: 'User already exists' });
        }
        
        console.log('User created:', username);

        res.status(201).json({ message: 'User registered successfully' });
        });
    });
});


// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM user WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user) return res.status(401).json({ error: 'Incorrect username.' });

        const isValid = bcrypt.compareSync(password, user.user_key);
        if (!isValid) return res.status(401).json({ error: 'Incorrect password.' });

        req.session.userId = user.id;
        res.json({ message: 'Login successful.' });
    });
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully.' });
    });
});

module.exports = router;
