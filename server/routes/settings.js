// const express = require('express');
// const router = express.Router();
// const { db } = require('../db/db');

// // GET user settings
// router.get('/settings', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   db.get('SELECT username, default_view, notifications_enabled FROM users WHERE id = ?', [userId], (err, row) => {
//     if (err) return res.status(500).json({ error: 'Database error' });
//     if (!row) return res.status(404).json({ error: 'Settings and user not found' });
//     res.json(row);
//   });
// });

// // PUT user settings
// router.put('/settings', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   const { default_view, notifications_enabled } = req.body;

//   const query = 'UPDATE users SET default_view = ?, notifications_enabled = ? WHERE id = ?';
//   db.run(query, [default_view, notifications_enabled, userId], function (err) {
//     if (err) return res.status(500).json({ error: 'Failed to update settings' });
//     res.json({ message: 'Settings updated successfully' });
//   });
// });

// // get user's default view
// router.get('/settings/view', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//   db.get('SELECT default_view FROM users WHERE id = ?', [userId], (err, row) => {
//     if (err) return res.status(500).json({ error: 'Database error' });
//     if (!row) return res.status(404).json({ error: 'Settings and user not found' });
//     res.json(row);
//   });
// });

// // // get user's notification preference
// // router.get('/settings/notifications', (req, res) => {
// //   const userId = req.session.userId;
// //   if (!userId) return res.status(401).json({ error: 'Not authenticated' });

// //   db.get('SELECT notifications_enabled FROM users WHERE id = ?', [userId], (err, row) => {
// //     if (err) return res.status(500).json({ error: 'Database error' });
// //     if (!row) return res.status(404).json({ error: 'Settings and user not found' });
// //     res.json(row);
// //   });
// // });

// module.exports = router;


const express = require('express');
const AWS = require('aws-sdk');

const router = express.Router();
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const USERS_TABLE = 'Users';

// Helper to send error responses with details
function handleError(res, context, err) {
  console.error(`[${context}]`, err);
  return res.status(500).json({ error: `${context} failed`, details: err.message });
}

// GET user settings
router.get('/settings', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await dynamo.get({
      TableName: USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'username, default_view, notifications_enabled'
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'Settings and user not found' });
    }

    res.json(result.Item);
  } catch (err) {
    handleError(res, 'Get settings', err);
  }
});

// PUT user settings
router.put('/settings', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { default_view, notifications_enabled } = req.body;

  if (default_view == null || notifications_enabled == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dynamo.update({
      TableName: USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET default_view = :dv, notifications_enabled = :ne',
      ExpressionAttributeValues: {
        ':dv': default_view,
        ':ne': notifications_enabled
      }
    }).promise();

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    handleError(res, 'Update settings', err);
  }
});

// GET user's default view only
router.get('/settings/view', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await dynamo.get({
      TableName: USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'default_view'
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'Settings and user not found' });
    }

    res.json({ default_view: result.Item.default_view });
  } catch (err) {
    handleError(res, 'Get default view', err);
  }
});

module.exports = router;
