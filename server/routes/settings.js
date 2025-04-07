const express = require('express');
const router = express.Router();
const db = require('../db/db').connectDB();

// GET user settings
router.get('/user/settings', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  db.get('SELECT default_view, notifications_enabled FROM user WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(row);
  });
});

// PUT user settings
router.put('/user/settings', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { default_view, notifications_enabled } = req.body;

  const query = 'UPDATE user SET default_view = ?, notifications_enabled = ? WHERE id = ?';
  db.run(query, [default_view || 'day', notifications_enabled ? 1 : 0, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update settings' });
    res.json({ message: 'Settings updated successfully' });
  });
});

module.exports = router;
