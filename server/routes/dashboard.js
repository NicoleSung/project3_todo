// const express = require('express');
// const dayjs = require('dayjs');
// const router = express.Router();
// const { db } = require('../db/db');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone.js')
// dayjs.extend(timezone);
// dayjs.extend(utc);

// // Get all tasks for logged-in user
// router.get('/tasks', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_dates ASC', [userId], (err, rows) => {
//     if (err) return res.status(500).json({ error: 'Database error' });
//     res.json(rows);
//   });
// });

// // Add a new task
// router.post('/tasks', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  
//   const {
//     task_title,
//     task_details,
//     priority_lev,
//     est_hour,
//     est_min,
//     due_dates,
//     notification_yes
//   } = req.body;

//   if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   let finalEndTime = null;
//   let scheduled_time = null;

//   const query = `
//     INSERT INTO tasks (
//       user_id, task_title, task_details, priority_lev, est_hour, est_min, due_dates,
//       notification_yes, scheduled_time, end_time
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.run(query, [
//     userId,
//     task_title,
//     task_details || '',
//     priority_lev,
//     est_hour,
//     est_min,
//     due_dates,
//     notification_yes,
//     scheduled_time,
//     finalEndTime
//   ], function (err) {
//     if (err) return res.status(500).json({ error: 'Insert failed' });
//     res.status(201).json({ id: this.lastID });
//   });
// });

// // Update task
// router.put('/tasks/:id', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const { id } = req.params;

//   const {
//     task_title,
//     task_details,
//     priority_lev,
//     est_hour,
//     est_min,
//     due_dates,
//     notification_yes
//   } = req.body;

//   if (
//     !task_title ||
//     priority_lev == null ||
//     est_hour == null ||
//     est_min == null ||
//     !due_dates
//   ) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const priority = Number(priority_lev);
//   const hour = Number(est_hour);
//   const minute = Number(est_min);
//   const notify = notification_yes ? 1 : 0;

//   db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err, existingTask) => {
//     if (err) {
//       console.error('DB error fetching task:', err);
//       return res.status(500).json({ error: 'Failed to fetch task' });
//     }

//     if (!existingTask) {
//       return res.status(404).json({ error: 'Task not found' });
//     }

//     const timeChanged =
//       existingTask.due_dates !== due_dates ||
//       existingTask.est_hour !== hour ||
//       existingTask.est_min !== minute;

//     const query = timeChanged
//       ? `UPDATE tasks
//            SET task_title = ?, task_details = ?, priority_lev = ?, est_hour = ?, est_min = ?, due_dates = ?, notification_yes = ?, scheduled_time = NULL, end_time = NULL
//          WHERE id = ? AND user_id = ?`
//       : `UPDATE tasks
//            SET task_title = ?, task_details = ?, priority_lev = ?, est_hour = ?, est_min = ?, due_dates = ?, notification_yes = ?
//          WHERE id = ? AND user_id = ?`;

//     const params = timeChanged
//       ? [task_title, task_details, priority, hour, minute, due_dates, notify, id, userId]
//       : [task_title, task_details, priority, hour, minute, due_dates, notify, id, userId];

//     db.run(query, params, function (err) {
//       if (err) {
//         console.error('DB error updating task:', err);
//         return res.status(500).json({ error: 'Update failed', details: err.message });
//       }

//       res.json({
//         message: 'Task updated' + (timeChanged ? ' and schedule cleared' : '')
//       });
//     });
//   });
// });

// // schedule
// router.put('/tasks/schedule/:id', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const { id } = req.params;
//   const { scheduled_time, est_hour, est_min, timezone } = req.body;

//   if (!scheduled_time || est_hour == null || est_min == null) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const hour = Number(est_hour);
//   const minute = Number(est_min);

//   const start = dayjs.tz(scheduled_time, timezone);
//   const startUTC = start.utc().toISOString();
//   const endUTC = start.add(hour, 'hour').add(minute, 'minute').utc().toISOString();

//   db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId], (err, existingTask) => {
//     if (err || !existingTask) {
//       return res.status(404).json({ error: 'Task not found or access denied' });
//     }

//     const query = `UPDATE tasks
//                    SET scheduled_time = ?, end_time = ?
//                    WHERE id = ? AND user_id = ?`;

//    const params = [startUTC, endUTC, id, userId];

//     db.run(query, params, function (err) {
//       if (err) {
//         console.error('Error updating schedule:', err);
//         return res.status(500).json({ error: 'Failed to update schedule' });
//       }

//       res.json({ message: 'Task scheduled successfully' });
//     });
//   });
// });

// // Delete task
// router.delete('/tasks/:id', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const { id } = req.params;
//   db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId], function (err) {
//     if (err) return res.status(500).json({ error: 'Delete failed' });
//     res.json({ message: 'Task deleted' });
//   });
// });

// // Suggest the next available time slot
// router.get('/tasks/suggest', (req, res) => {
//   const userId = req.session.userId;
//   const duration = parseInt(req.query.duration); // in minutes
//   const ignoreBreak = req.query.ignoreBreak=== 'true'; // break buffer toggle

//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });
//   if (!duration || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

//   db.all(
//     'SELECT scheduled_time, end_time FROM tasks WHERE user_id = ? AND scheduled_time IS NOT NULL ORDER BY scheduled_time ASC',
//     [userId],
//     (err, rows) => {
//       if (err) return res.status(500).json({ error: 'Database error' });

//       const sorted = rows.map(r => ({
//         start: dayjs.utc(r.scheduled_time), 
//         end: dayjs.utc(r.end_time)
//       }));

//       let current = dayjs.utc();
//       const breakBuffer = ignoreBreak ? 0 : 15; // break in minutes

//       for (let i = 0; i <= sorted.length; i++) {
//         const nextStart = sorted[i]?.start || null;
//         const gapEnd = nextStart || current.add(7, 'day');
//         const gapMinutes = gapEnd.diff(current, 'minute');

//         if (gapMinutes >= (duration + breakBuffer)) {
//           const suggestedTime = current.add(breakBuffer, 'minute');
//           const suggestedLocal = dayjs.utc(suggestedTime).local().format();
//           return res.json({ suggested_time: suggestedLocal});
//         }

//         current = sorted[i]?.end;
//       }

//       return res.status(404).json({ error: 'No available slot found' });
//     }
//   );
// });

// // check if a custom schedule time overlaps with existing tasks
// router.post('/tasks/validate-time', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const { scheduled_time, est_hour, est_min, ignoreBreak } = req.body;

//   if (!scheduled_time || est_hour == null || est_min == null)
//     return res.status(400).json({ error: 'Missing required fields' });

//   const proposedStart = dayjs(scheduled_time).utc();
//   const proposedEnd = proposedStart.add(est_hour, 'hour').add(est_min, 'minute');
//   const breakBuffer = ignoreBreak ? 0 : 15;

//   if (proposedStart.isBefore(dayjs())) {
//     return res.status(400).json({ error: 'Scheduled time cannot be in the past' });
//   }

//   db.all(
//     'SELECT scheduled_time, end_time FROM tasks WHERE user_id = ? AND scheduled_time IS NOT NULL',
//     [userId],
//     (err, rows) => {
//       if (err) return res.status(500).json({ error: 'Database error' });

//       const conflicts = rows.filter(row => {
//         const existingStart = dayjs(row.scheduled_time);
//         const existingEnd = dayjs(row.end_time);

//         // Add break buffer
//         const bufferedStart = existingStart.subtract(breakBuffer, 'minute');
//         const bufferedEnd = existingEnd.add(breakBuffer, 'minute');

//         return proposedEnd.isAfter(bufferedStart) && proposedStart.isBefore(bufferedEnd);
//       });

//       if (conflicts.length > 0) {
//         return res.status(409).json({ error: 'Time conflict with existing task', conflicts });
//       }

//       res.json({ message: 'Time slot is available' });
//     }
//   );
// });

// // Clear scheduled time for a task
// router.put('/tasks/unschedule/:id/', (req, res) => {
//   const userId = req.session.userId;
//   const { id } = req.params;

//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const query = `
//     UPDATE tasks
//     SET scheduled_time = NULL, end_time = NULL
//     WHERE id = ? AND user_id = ?
//   `;

//   db.run(query, [id, userId], function (err) {
//     if (err) return res.status(500).json({ error: 'Unassign failed' });
//     res.json({ message: 'Task unscheduled' });
//   });
// });

// // call from calendar
// router.put('/tasks/calendarEdit/:id', (req, res) => {
//   const userId = req.session.userId;
//   const { id } = req.params;
//   const { task_title, task_details, scheduled_time, est_hour, est_min } = req.body;

//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   if (!scheduled_time || est_hour == null || est_min == null) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const start = dayjs(scheduled_time);
//   const end = start.add(est_hour, 'hour').add(est_min, 'minute').toISOString();

//   const query = `
//     UPDATE tasks
//     SET task_title = ?, task_details = ?, scheduled_time = ?, end_time = ?
//     WHERE id = ? AND user_id = ?
//   `;

//   db.run(query, [task_title, task_details, scheduled_time, end, id, userId], function (err) {
//     if (err) {
//       console.error('Calendar edit error:', err.message);
//       return res.status(500).json({ error: 'Failed to update calendar info' });
//     }
//     res.json({ message: 'Task updated from calendar' });
//   });
// });


// module.exports = router;

// -------------------------- MODIFIED CODE FOR DYNAMO DB -------------------------- //

// Enhanced DynamoDB-backed Express router with detailed try/catch debugging

const express = require('express');
const AWS = require('aws-sdk');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
dayjs.extend(utc);
dayjs.extend(timezone);

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TASKS_TABLE = 'Tasks';

// Helper to send error responses with details
function handleError(res, context, err) {
  console.error(`[${context}]`, err);
  res.status(500).json({ error: `${context} failed`, details: err.message });
}

// Get all tasks for logged-in user
router.get('/tasks', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await dynamo.query({
      TableName: TASKS_TABLE,
      IndexName: 'user_id_index',
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: { ':uid': userId }
    }).promise();
    res.json(result.Items);
  } catch (err) {
    handleError(res, 'Query tasks', err);
  }
});

// Create a new task
router.post('/tasks', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { task_title, task_details, priority_lev, est_hour, est_min, due_dates, notification_yes } = req.body;
  if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const task = {
    id: uuidv4(),
    user_id: userId,
    task_title,
    task_details,
    priority_lev,
    est_hour,
    est_min,
    due_dates,
    notification_yes,
    note_creation_time: dayjs().toISOString(),
    active_note: true
  };

  try {
    await dynamo.put({ TableName: TASKS_TABLE, Item: task }).promise();
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    handleError(res, 'Create task', err);
  }
});

// Update an existing task and clear schedule
router.put('/tasks/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { task_title, task_details, priority_lev, est_hour, est_min, due_dates, notification_yes } = req.body;

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const values = {
    ':title': task_title,
    ':details': task_details,
    ':priority': priority_lev,
    ':hour': est_hour,
    ':min': est_min,
    ':due': due_dates,
    ':notify': notification_yes,
    ':sched': null,
    ':end': null
  };

  try {
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression:
        'SET task_title = :title, task_details = :details, priority_lev = :priority, est_hour = :hour, est_min = :min, due_dates = :due, notification_yes = :notify, scheduled_time = :sched, end_time = :end',
      ExpressionAttributeValues: values
    }).promise();
    res.json({ message: 'Task updated and schedule cleared' });
  } catch (err) {
    handleError(res, 'Update task', err);
  }
});

// Schedule a task
router.put('/tasks/schedule/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { scheduled_time, est_hour, est_min, timezone: tz } = req.body;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!scheduled_time || est_hour == null || est_min == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const start = dayjs.tz(scheduled_time, tz);
    const update = {
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'SET scheduled_time = :start, end_time = :end',
      ExpressionAttributeValues: {
        ':start': start.utc().toISOString(),
        ':end': start.add(est_hour, 'hour').add(est_min, 'minute').utc().toISOString()
      }
    };
    await dynamo.update(update).promise();
    res.json({ message: 'Task scheduled successfully' });
  } catch (err) {
    handleError(res, 'Schedule task', err);
  }
});

// Unschedule a task
router.put('/tasks/unschedule/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'REMOVE scheduled_time, end_time'
    }).promise();
    res.json({ message: 'Task unscheduled' });
  } catch (err) {
    handleError(res, 'Unschedule task', err);
  }
});

// Delete task: mark inactive and compute note_life
router.delete('/tasks/:id', async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { Item: task } = await dynamo.get({ TableName: TASKS_TABLE, Key: { id } }).promise();
    if (!task || task.user_id !== userId) return res.status(404).json({ error: 'Task not found' });

    if (!task.note_creation_time) {
      return res.status(400).json({ error: 'Missing note_creation_time' });
    }

    const now = dayjs();
    const noteLife = now.diff(dayjs(task.note_creation_time), 'minute');
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'SET active_note = :a, note_deletion_time = :d, note_life = :l',
      ExpressionAttributeValues: {
        ':a': false,
        ':d': now.toISOString(),
        ':l': noteLife
      }
    }).promise();
    res.json({ message: 'Task deleted and note_life recorded' });
  } catch (err) {
    handleError(res, 'Delete task', err);
  }
});

// Suggest next available time slot
router.get('/tasks/suggest', async (req, res) => {
  const userId = req.session.userId;
  const duration = parseInt(req.query.duration, 10);
  const ignoreBreak = req.query.ignoreBreak === 'true';
  const breakBuffer = ignoreBreak ? 0 : 15;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!duration || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

  try {
    const { Items } = await dynamo.query({
      TableName: TASKS_TABLE,
      IndexName: 'user_id_index',
      KeyConditionExpression: 'user_id = :uid',
      FilterExpression: 'attribute_exists(scheduled_time)',
      ExpressionAttributeValues: { ':uid': userId }
    }).promise();

    const sorted = Items.map(t => ({ start: dayjs.utc(t.scheduled_time), end: dayjs.utc(t.end_time) }))
      .sort((a, b) => a.start - b.start);

    let current = dayjs.utc();
    for (let i = 0; i <= sorted.length; i++) {
      const nextStart = sorted[i]?.start;
      const gapEnd = nextStart || current.add(7, 'day');
      if (gapEnd.diff(current, 'minute') >= duration + breakBuffer) {
        const suggested = current.add(breakBuffer, 'minute');
        return res.json({ suggested_time: dayjs.utc(suggested).local().format() });
      }
      current = sorted[i]?.end;
    }
    res.status(404).json({ error: 'No available slot found' });
  } catch (err) {
    handleError(res, 'Suggest time', err);
  }
});

// Validate custom schedule time
router.post('/tasks/validate-time', async (req, res) => {
  const userId = req.session.userId;
  const { scheduled_time, est_hour, est_min, ignoreBreak } = req.body;
  const breakBuffer = ignoreBreak === true ? 0 : 15;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!scheduled_time || est_hour == null || est_min == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const proposedStart = dayjs(scheduled_time).utc();
  const proposedEnd = proposedStart.add(est_hour, 'hour').add(est_min, 'minute');
  if (proposedStart.isBefore(dayjs())) {
    return res.status(400).json({ error: 'Scheduled time cannot be in the past' });
  }

  try {
    const { Items } = await dynamo.query({
      TableName: TASKS_TABLE,
      IndexName: 'user_id_index',
      KeyConditionExpression: 'user_id = :uid',
      FilterExpression: 'attribute_exists(scheduled_time)',
      ExpressionAttributeValues: { ':uid': userId }
    }).promise();

    const conflicts = Items.filter(row => {
      const start = dayjs(row.scheduled_time);
      const end = dayjs(row.end_time);
      return proposedEnd.isAfter(start.subtract(breakBuffer, 'minute')) && proposedStart.isBefore(end.add(breakBuffer, 'minute'));
    });
    if (conflicts.length) {
      return res.status(409).json({ error: 'Time conflict', conflicts });
    }
    res.json({ message: 'Time slot is available' });
  } catch (err) {
    handleError(res, 'Validate time', err);
  }
});

module.exports = router;
// -------------------------- END OF MODIFIED CODE -------------------------- //