const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const { db } = require('../db/db');

// Get all tasks for logged-in user
router.get('/tasks', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_dates ASC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new task
router.post('/tasks', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const {
    title,
    description,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes,
    scheduled_time
  } = req.body;

  if (scheduled_time && dayjs(scheduled_time).isBefore(dayjs())) {
    return res.status(400).json({ error: 'Scheduled time must be in the future.' });
  }

  let finalEndTime = null;
  if (scheduled_time) {
    finalEndTime = dayjs(scheduled_time)
      .add(est_hour || 0, 'hour')
      .add(est_min || 0, 'minute')
      .toISOString();
  }

  const query = `
    INSERT INTO tasks (
      user_id, task_title, task_details, priority_lev, est_hour, est_min, due_dates,
      notification_yes, scheduled_time, end_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    userId,
    title,
    description,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes || 0,
    scheduled_time || null,
    finalEndTime
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.status(201).json({ id: this.lastID });
  });
});

// Update task (includes scheduling)
router.put('/tasks/:id', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.params;
  const {
    title,
    description,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes,
    scheduled_time
  } = req.body;

  if (scheduled_time && dayjs(scheduled_time).isBefore(dayjs())) {
    return res.status(400).json({ error: 'Scheduled time must be in the future.' });
  }

  let finalEndTime = null;
  if (scheduled_time) {
    finalEndTime = dayjs(scheduled_time)
      .add(est_hour || 0, 'hour')
      .add(est_min || 0, 'minute')
      .toISOString();
  }

  const query = `
    UPDATE tasks
    SET task_title = ?, task_details = ?, priority_lev = ?, est_hour = ?, est_min = ?, due_dates = ?, notification_yes = ?, scheduled_time = ?, end_time = ?
    WHERE id = ? AND user_id = ?
  `;

  db.run(query, [
    title,
    description,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes || 0,
    scheduled_time || null,
    finalEndTime,
    id,
    userId
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Task updated with end_time calculated.' });
  });
});


// Delete task
router.delete('/tasks/:id', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Task deleted' });
  });
});

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
