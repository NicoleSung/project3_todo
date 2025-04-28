const express = require('express');
const AWS = require('aws-sdk');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TASKS_TABLE = 'Tasks';

// all /api/tasks routes require a valid JWT
router.use(authenticate);

// GET /api/tasks — list active tasks
router.get('/', async (req, res) => {
  const userId = req.auth.sub;
  try {
    const result = await dynamo.query({
      TableName: TASKS_TABLE,
      IndexName: 'user_id_index',
      KeyConditionExpression: 'user_id = :uid',
      FilterExpression: 'active_note = :active',
      ExpressionAttributeValues: {
        ':uid': userId,
        ':active': true
      }
    }).promise();
    res.json(result.Items);
  } catch (err) {
    console.error('GET /tasks error', err);
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

// // GET /api/tasks/suggest?duration=...&ignoreBreak=...
// router.get('/suggest', async (req, res) => {
//   const userId = req.auth.sub;
//   const duration = parseInt(req.query.duration, 10);

//   // only reject when duration is truly invalid (NaN)
//   if (isNaN(duration)) {
//     return res.status(400).json({ error: 'Missing or invalid duration' });
//   }

//   // TODO: replace stub logic with your scheduling algorithm
//   const suggestion = dayjs().add(1, 'hour').toISOString();
//   res.json({ suggested_time: suggestion });
// });

// // POST /api/tasks/validate-time
// router.post('/validate-time', async (req, res) => {
//   const userId = req.auth.sub;
//   const { scheduled_time, est_hour, est_min, ignoreBreak } = req.body;
//   if (!scheduled_time || est_hour == null || est_min == null) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
//   // TODO: replace stub logic with real conflict detection
//   // we'll assume any time is valid
//   res.json({});
// });

// … above imports, router.use(authenticate), etc …

// GET /api/tasks/suggest?duration=...&ignoreBreak=...
router.get('/suggest', async (req, res) => {
  const userId     = req.auth.sub;
  const duration   = parseInt(req.query.duration, 10);    // in minutes
  const ignoreBreak= req.query.ignoreBreak === 'true';

  if (isNaN(duration)) {
    return res.status(400).json({ error: 'Missing or invalid duration' });
  }

  try {
    // 1) Fetch all tasks with a scheduled_time
    const result = await dynamo
      .query({
        TableName: TASKS_TABLE,
        IndexName: 'user_id_index',
        KeyConditionExpression: 'user_id = :uid',
        FilterExpression: 'attribute_exists(scheduled_time)',
        ExpressionAttributeValues: { ':uid': userId }
      })
      .promise();

    // 2) Build busy windows
    const busyWindows = result.Items.map(t => {
      const start = dayjs(t.scheduled_time);
      // compute end = start + est_hour/est_min
      const end   = start.add(t.est_hour, 'hour').add(t.est_min, 'minute');
      return { start, end };
    });

    // optional break in ms
    const breakMs = ignoreBreak ? 0 : 15 * 60 * 1000;

    // 3) Slide a window forward in 15‑min increments
    let cursor = dayjs();
    const horizon = dayjs().add(7, 'day');

    while (cursor.isBefore(horizon)) {
      const slotStart = cursor;
      const slotEnd   = slotStart.add(duration, 'minute');

      // check for conflict
      const conflict = busyWindows.some(w =>
        // if w.end + break > slotStart AND w.start < slotEnd => overlap
        w.end.add(breakMs, 'millisecond').isAfter(slotStart) &&
        w.start.isBefore(slotEnd)
      );

      if (!conflict) {
        return res.json({ suggested_time: slotStart.toISOString() });
      }

      cursor = cursor.add(15, 'minute');
    }

    // 4) nothing found
    return res.status(404).json({ error: 'No available slot in next 7 days' });
  } catch (err) {
    console.error('GET /tasks/suggest error', err);
    return res.status(500).json({ error: 'Could not compute suggestion' });
  }
});


// POST /api/tasks — create task
router.post('/', async (req, res) => {
  const userId = req.auth.sub;
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
  const item = {
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
    await dynamo.put({ TableName: TASKS_TABLE, Item: item }).promise();
    res.status(201).json({ message: 'Task created', task: item });
  } catch (err) {
    console.error('POST /tasks error', err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res) => {
  const userId = req.auth.sub;
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
  if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression:
        'SET task_title = :t, task_details = :d, priority_lev = :p, est_hour = :h, est_min = :m, due_dates = :due, notification_yes = :n',
      ExpressionAttributeValues: {
        ':t': task_title,
        ':d': task_details,
        ':p': priority_lev,
        ':h': est_hour,
        ':m': est_min,
        ':due': due_dates,
        ':n': notification_yes
      }
    }).promise();
    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error('PUT /tasks/:id error', err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// PUT /api/tasks/schedule/:id — schedule a task
router.put('/schedule/:id', async (req, res) => {
  const userId = req.auth.sub;
  const { id } = req.params;
  const { scheduled_time, timezone } = req.body;

  if (!scheduled_time || !timezone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'SET scheduled_time = :st, #tz = :tz',
      ExpressionAttributeNames: {
        '#tz': 'timezone'
      },
      ExpressionAttributeValues: {
        ':st': scheduled_time,
        ':tz': timezone
      }
    }).promise();

    res.json({ message: 'Task scheduled' });
  } catch (err) {
    console.error('PUT /tasks/schedule/:id error', err);
    res.status(500).json({ error: 'Could not schedule task' });
  }
});

// PUT /api/tasks/unschedule/:id — remove scheduled_time
// router.put('/unschedule/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await dynamo.update({
//       TableName: TASKS_TABLE,
//       Key: { id },
//       UpdateExpression: 'REMOVE scheduled_time, timezone'
//     }).promise();
//     res.json({ message: 'Task unscheduled' });
//   } catch (err) {
//     console.error('PUT /tasks/unschedule/:id error', err);
//     res.status(500).json({ error: 'Could not unschedule task' });
//   }
// });

router.put('/unschedule/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'REMOVE scheduled_time, #tz',
      ExpressionAttributeNames: { '#tz': 'timezone' }
    }).promise();
    res.json({ message: 'Task unscheduled' });
  } catch (err) {
    console.error('PUT /tasks/unschedule/:id error', err);
    res.status(500).json({ error: 'Could not unschedule task' });
  }
});


// DELETE /api/tasks/:id — soft‑delete
router.delete('/:id', async (req, res) => {
  const userId = req.auth.sub;
  const { id } = req.params;
  try {
    const { Item: task } = await dynamo.get({
      TableName: TASKS_TABLE,
      Key: { id }
    }).promise();
    if (!task || task.user_id !== userId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const now = dayjs();
    const life = now.diff(dayjs(task.note_creation_time), 'minute');
    await dynamo.update({
      TableName: TASKS_TABLE,
      Key: { id },
      UpdateExpression: 'SET active_note = :a, note_deletion_time = :d, note_life = :l',
      ExpressionAttributeValues: {
        ':a': false,
        ':d': now.toISOString(),
        ':l': life
      }
    }).promise();
    res.json({ message: 'Task deleted and life recorded' });
  } catch (err) {
    console.error('DELETE /tasks/:id error', err);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

module.exports = router;