const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const db = require('../db/db').connectDB();

// Suggest the next available time slot
router.get('/tasks/suggest', (req, res) => {
  const userId = req.session.userId;
  const duration = parseInt(req.query.duration); // in minutes

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!duration || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

  db.all(
    'SELECT scheduled_time, end_time FROM tasks WHERE user_id = ? AND scheduled_time IS NOT NULL ORDER BY scheduled_time ASC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const now = dayjs();
      const sorted = rows.map(r => ({
        start: dayjs(r.scheduled_time),
        end: dayjs(r.end_time)
      }));

      let current = now;

      for (let i = 0; i <= sorted.length; i++) {
        const nextStart = sorted[i]?.start || null;

        const gapEnd = nextStart || dayjs().add(7, 'day'); // search up to 7 days ahead
        const gapMinutes = gapEnd.diff(current, 'minute');

        if (gapMinutes >= duration) {
          return res.json({ suggested_time: current.toISOString() });
        }

        // Move pointer forward
        current = sorted[i]?.end || current;
      }

      return res.status(404).json({ error: 'No available slot found' });
    }
  );
});

module.exports = router;