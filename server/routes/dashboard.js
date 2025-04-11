const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const { db } = require('../db/db');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone.js')
dayjs.extend(timezone);
dayjs.extend(utc);

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
    task_title,
    task_details,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes
  } = req.body;

  if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let finalEndTime = null;
  let scheduled_time = null;

  const query = `
    INSERT INTO tasks (
      user_id, task_title, task_details, priority_lev, est_hour, est_min, due_dates,
      notification_yes, scheduled_time, end_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    userId,
    task_title,
    task_details || '',
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes,
    scheduled_time,
    finalEndTime
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.status(201).json({ id: this.lastID });
  });
});

// Update task
router.put('/tasks/:id', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.params;

  const {
    task_title,
    task_details,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes
  } = req.body;

  if (
    !task_title ||
    priority_lev == null ||
    est_hour == null ||
    est_min == null ||
    !due_dates
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priority = Number(priority_lev);
  const hour = Number(est_hour);
  const minute = Number(est_min);
  const notify = notification_yes ? 1 : 0;

  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err, existingTask) => {
    if (err) {
      console.error('DB error fetching task:', err);
      return res.status(500).json({ error: 'Failed to fetch task' });
    }

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const timeChanged =
      existingTask.due_dates !== due_dates ||
      existingTask.est_hour !== hour ||
      existingTask.est_min !== minute;

    const query = timeChanged
      ? `UPDATE tasks
           SET task_title = ?, task_details = ?, priority_lev = ?, est_hour = ?, est_min = ?, due_dates = ?, notification_yes = ?, scheduled_time = NULL, end_time = NULL
         WHERE id = ? AND user_id = ?`
      : `UPDATE tasks
           SET task_title = ?, task_details = ?, priority_lev = ?, est_hour = ?, est_min = ?, due_dates = ?, notification_yes = ?
         WHERE id = ? AND user_id = ?`;

    const params = timeChanged
      ? [task_title, task_details, priority, hour, minute, due_dates, notify, id, userId]
      : [task_title, task_details, priority, hour, minute, due_dates, notify, id, userId];

    db.run(query, params, function (err) {
      if (err) {
        console.error('DB error updating task:', err);
        return res.status(500).json({ error: 'Update failed', details: err.message });
      }

      res.json({
        message: 'Task updated' + (timeChanged ? ' and schedule cleared' : '')
      });
    });
  });
});

// schedule
router.put('/tasks/schedule/:id', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.params;
  const { scheduled_time, est_hour, est_min, timezone } = req.body;

  if (!scheduled_time || est_hour == null || est_min == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hour = Number(est_hour);
  const minute = Number(est_min);

  const start = dayjs.tz(scheduled_time, timezone);
  const startUTC = start.utc().toISOString();
  const endUTC = start.add(hour, 'hour').add(minute, 'minute').utc().toISOString();

  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err, existingTask) => {
    if (err || !existingTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const query = `UPDATE tasks
                   SET scheduled_time = ?, end_time = ?
                   WHERE id = ? AND user_id = ?`;

   const params = [startUTC, endUTC, id, userId];

    db.run(query, params, function (err) {
      if (err) {
        console.error('Error updating schedule:', err);
        return res.status(500).json({ error: 'Failed to update schedule' });
      }

      res.json({ message: 'Task scheduled successfully' });
    });
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
  const ignoreBreak = req.query.ignoreBreak=== 'true'; // break buffer toggle

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!duration || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

  db.all(
    'SELECT scheduled_time, end_time FROM tasks WHERE user_id = ? AND scheduled_time IS NOT NULL ORDER BY scheduled_time ASC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const sorted = rows.map(r => ({
        start: dayjs.utc(r.scheduled_time), 
        end: dayjs.utc(r.end_time)
      }));

      let current = dayjs.utc();
      const breakBuffer = ignoreBreak ? 0 : 15; // break in minutes

      for (let i = 0; i <= sorted.length; i++) {
        const nextStart = sorted[i]?.start || null;
        const gapEnd = nextStart || current.add(7, 'day');
        const gapMinutes = gapEnd.diff(current, 'minute');

        if (gapMinutes >= (duration + breakBuffer)) {
          const suggestedTime = current.add(breakBuffer, 'minute');
          const suggestedLocal = dayjs.utc(suggestedTime).local().format();
          return res.json({ suggested_time: suggestedLocal});
        }

        current = sorted[i]?.end;
      }

      return res.status(404).json({ error: 'No available slot found' });
    }
  );
});

// check if a custom schedule time overlaps with existing tasks
router.post('/tasks/validate-time', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { scheduled_time, est_hour, est_min, ignoreBreak } = req.body;

  if (!scheduled_time || est_hour == null || est_min == null)
    return res.status(400).json({ error: 'Missing required fields' });

  const proposedStart = dayjs(scheduled_time).utc();
  const proposedEnd = proposedStart.add(est_hour, 'hour').add(est_min, 'minute');
  const breakBuffer = ignoreBreak ? 0 : 15;

  if (proposedStart.isBefore(dayjs())) {
    return res.status(400).json({ error: 'Scheduled time cannot be in the past' });
  }

  db.all(
    'SELECT scheduled_time, end_time FROM tasks WHERE user_id = ? AND scheduled_time IS NOT NULL',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const conflicts = rows.filter(row => {
        const existingStart = dayjs(row.scheduled_time);
        const existingEnd = dayjs(row.end_time);

        // Add break buffer
        const bufferedStart = existingStart.subtract(breakBuffer, 'minute');
        const bufferedEnd = existingEnd.add(breakBuffer, 'minute');

        return proposedEnd.isAfter(bufferedStart) && proposedStart.isBefore(bufferedEnd);
      });

      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Time conflict with existing task', conflicts });
      }

      res.json({ message: 'Time slot is available' });
    }
  );
});

// Clear scheduled time for a task
router.put('/tasks/unschedule/:id/', (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const query = `
    UPDATE tasks
    SET scheduled_time = NULL, end_time = NULL
    WHERE id = ? AND user_id = ?
  `;

  db.run(query, [id, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Unassign failed' });
    res.json({ message: 'Task unscheduled' });
  });
});

// call from calendar
router.put('/tasks/calendarEdit/:id', (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { task_title, task_details, scheduled_time, est_hour, est_min } = req.body;

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  if (!scheduled_time || est_hour == null || est_min == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const start = dayjs(scheduled_time);
  const end = start.add(est_hour, 'hour').add(est_min, 'minute').toISOString();

  const query = `
    UPDATE tasks
    SET task_title = ?, task_details = ?, scheduled_time = ?, end_time = ?
    WHERE id = ? AND user_id = ?
  `;

  db.run(query, [task_title, task_details, scheduled_time, end, id, userId], function (err) {
    if (err) {
      console.error('Calendar edit error:', err.message);
      return res.status(500).json({ error: 'Failed to update calendar info' });
    }
    res.json({ message: 'Task updated from calendar' });
  });
});


module.exports = router;

