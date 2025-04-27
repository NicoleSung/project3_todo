const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

// Dynamo setup
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TASKS_TABLE = 'Tasks';

// GET /api/tasks/ to list all active tasks for this user
router.get('/', async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await dynamo
      .query({
        TableName: TASKS_TABLE,
        IndexName: 'user_id_index',
        KeyConditionExpression: 'user_id = :uid',
        FilterExpression: 'active_note = :active',
        ExpressionAttributeValues: {
          ':uid': userId,
          ':active': true,
        },
      })
      .promise();
    res.json(result.Items);
  } catch (err) {
    console.error('GET /tasks error', err);
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

// POST /api/tasks/ to create a new task
router.post('/', async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { task_title, task_details, priority_lev, est_hour, est_min, due_dates, notification_yes } =
    req.body;
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
    active_note: true,
  };

  try {
    await dynamo.put({ TableName: TASKS_TABLE, Item: item }).promise();
    res.status(201).json({ message: 'Task created', task: item });
  } catch (err) {
    console.error('POST /tasks error', err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// PUT /api/tasks/:id to update an existing task
router.put('/:id', async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.params;
  const { task_title, task_details, priority_lev, est_hour, est_min, due_dates, notification_yes } =
    req.body;
  if (!task_title || priority_lev == null || est_hour == null || est_min == null || !due_dates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dynamo
      .update({
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
          ':n': notification_yes,
        },
      })
      .promise();
    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error('PUT /tasks/:id error', err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

module.exports = router;