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

// GET all active tasks for logged‑in user
router.get('/tasks', async (req, res) => {
  // express-jwt puts the validated token payload on req.auth
  const userId = req.auth?.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

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

    return res.json(result.Items);
  } catch (err) {
    return handleError(res, 'Query active tasks', err);
  }
});

// CREATE a new task
router.post('/tasks', async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

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
    return res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    return handleError(res, 'Create task', err);
  }
});

// UPDATE an existing task
router.put('/tasks/:id', async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

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

    return res.json({ message: 'Task updated and schedule cleared' });
  } catch (err) {
    return handleError(res, 'Update task', err);
  }
});



// Schedule a task
router.put('/tasks/schedule/:id', async (req, res) => {
  // const userId = req.session.userId;
  const userId = req.auth?.sub;
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
  // const userId = req.session.userId;
  const userId = req.auth?.sub;
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

// Delete task: mark inactive and record deletion time and life
router.delete('/tasks/:id', async (req, res) => {
  const userId = req.auth?.sub;
  const { id } = req.params;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // fetch existing task
    const { Item: task } = await dynamo
      .get({ TableName: TASKS_TABLE, Key: { id } })
      .promise();
    if (!task || task.user_id !== userId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (!task.note_creation_time) {
      return res.status(400).json({ error: 'Missing note_creation_time' });
    }

    // compute life span in minutes
    const now = dayjs();
    const noteLife = now.diff(dayjs(task.note_creation_time), 'minute');

    // soft‑delete + record deletion time and life
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
  // const userId = req.session.userId;
  const userId = req.auth?.sub;
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
      ExpressionAttributeValues: { ':uid': String(userId) }
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
  // const userId = req.session.userId;
  const userId = req.auth?.sub;
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
      ExpressionAttributeValues: { ':uid': String(userId) }
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
