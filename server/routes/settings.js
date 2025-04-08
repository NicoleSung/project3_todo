const express = require('express');
const router = express.Router();
const { db } = require('../db/db');

// GET user settings
router.get('/settings', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  db.get('SELECT username, default_view, notifications_enabled FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Settings and user not found' });
    res.json(row);
  });
});

// PUT user settings
router.put('/settings', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { default_view, notifications_enabled } = req.body;

  const query = 'UPDATE users SET default_view = ?, notifications_enabled = ? WHERE id = ?';
  db.run(query, [default_view, notifications_enabled, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update settings' });
    res.json({ message: 'Settings updated successfully' });
  });
});

module.exports = router;
