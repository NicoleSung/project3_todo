const express = require('express');
const AWS = require('aws-sdk');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const USERS_TABLE = 'Users';

// Helper to send error responses with details
function handleError(res, context, err) {
  console.error(`[${context}]`, err);
  return res.status(500).json({ error: `${context} failed`, details: err.message });
}

// All /api/settings routes below require a valid JWT
router.use(authenticate);

// GET /api/settings — return current user’s settings
router.get('/', async (req, res) => {
  const userId = req.auth.sub;
  try {
    const result = await dynamo
      .get({
        TableName: USERS_TABLE,
        Key: { id: userId },
        ProjectionExpression: 'default_view, notifications_enabled'
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      default_view: result.Item.default_view,
      notifications_enabled: !!result.Item.notifications_enabled
    });
  } catch (err) {
    return handleError(res, 'Get settings', err);
  }
});

// PUT /api/settings — save updated settings
router.put('/', async (req, res) => {
  const userId = req.auth.sub;
  const { default_view, notifications_enabled } = req.body;

  if (!['day','week'].includes(default_view) || typeof notifications_enabled !== 'boolean') {
    return res.status(400).json({ error: 'Invalid settings payload' });
  }

  try {
    await dynamo
      .update({
        TableName: USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: 'SET default_view = :dv, notifications_enabled = :ne',
        ExpressionAttributeValues: {
          ':dv': default_view,
          ':ne': notifications_enabled
        }
      })
      .promise();
    return res.json({ default_view, notifications_enabled });
  } catch (err) {
    return handleError(res, 'Update settings', err);
  }
});

// GET /api/settings/view — return only default_view
router.get('/view', async (req, res) => {
  const userId = req.auth.sub;
  try {
    const result = await dynamo
      .get({
        TableName: USERS_TABLE,
        Key: { id: userId },
        ProjectionExpression: 'default_view'
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ default_view: result.Item.default_view });
  } catch (err) {
    return handleError(res, 'Get default view', err);
  }
});

module.exports = router;