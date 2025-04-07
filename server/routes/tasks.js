const express = require('express');
const router = express.Router();
const db = require('../db/db').connectDB();

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

module.exports = router;
