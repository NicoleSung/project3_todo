// const express = require('express');
// const bcrypt = require('bcrypt');
// const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');
// const rateLimit = require('express-rate-limit');

// const router = express.Router();
// const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
// const USERS_TABLE = 'Users';

// // In-memory set to limit active sessions
// const activeUsers = new Set();

// // Rate‐limit login attempts
// const loginLimiter = rateLimit({
//   windowMs: 3 * 60 * 1000,  // 3 minutes
//   max: 5,
//   message: { error: 'Too many login attempts. Try again in 3 minutes.' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Helper for 500 logging
// function handleError(res, context, err) {
//   console.error(`[${context}]`, err);
//   return res.status(500).json({ error: `${context} failed`, details: err.message });
// }

// // — REGISTER —
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required.' });
//   }

//   try {
//     // Check if username already exists
//     const scan = await dynamo.scan({
//       TableName: USERS_TABLE,
//       FilterExpression: '#u = :user',
//       ExpressionAttributeNames: { '#u': 'username' },
//       ExpressionAttributeValues: { ':user': username },
//       Limit: 1
//     }).promise();

//     if (scan.Items.length > 0) {
//       return res.status(409).json({ error: 'User already exists' });
//     }

//     // Hash & store
//     const hashed = await bcrypt.hash(password, 10);
//     const id = uuidv4();
//     const userItem = {
//       id,
//       username,
//       user_key: hashed,
//       default_view: 'day',
//       notifications_enabled: true
//     };

//     await dynamo.put({
//       TableName: USERS_TABLE,
//       Item: userItem
//     }).promise();

//     console.log(`User created: ${username}`);
//     return res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     return handleError(res, 'Register', err);
//   }
// });

// // — LOGIN —
// router.post('/login', loginLimiter, async (req, res) => {
//   const { username, password } = req.body;

//   if (activeUsers.size >= 20) {
//     return res.status(429).json({ error: 'Too many active users. Please try again later.' });
//   }

//   try {
//     // Find the user by username
//     const scan = await dynamo.scan({
//       TableName: USERS_TABLE,
//       FilterExpression: '#u = :user',
//       ExpressionAttributeNames: { '#u': 'username' },
//       ExpressionAttributeValues: { ':user': username },
//       Limit: 1
//     }).promise();

//     if (scan.Items.length === 0) {
//       return res.status(401).json({ error: 'Incorrect username.' });
//     }
//     const user = scan.Items[0];

//     // Verify password
//     const valid = await bcrypt.compare(password, user.user_key);
//     if (!valid) {
//       return res.status(401).json({ error: 'Incorrect password.' });
//     }

//     // Success → set session
//     req.session.userId = user.id;
//     activeUsers.add(user.id);
//     return res.json({ message: 'Login successful.' });
//   } catch (err) {
//     return handleError(res, 'Login', err);
//   }
// });

// // — WHO AM I? —
// router.get('/me', (req, res) => {
//   if (req.session.userId) {
//     return res.json({ authenticated: true, userId: req.session.userId });
//   }
//   return res.status(401).json({ authenticated: false });
// });

// // — LOGOUT —
// router.post('/logout', (req, res) => {
//   if (req.session.userId) {
//     activeUsers.delete(req.session.userId);
//   }
//   req.session.destroy(err => {
//     if (err) console.error('Session destroy error:', err);
//     res.json({ message: 'Logged out successfully.' });
//   });
// });

// module.exports = router;

const express = require('express');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Cognito details
const REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_QQ0vo4TRv';
const CLIENT_ID = '2j7j8tflnfc41ns06v2eds46fl';

AWS.config.update({ region: REGION });
const cognito = new AWS.CognitoIdentityServiceProvider();

// Rate limit login attempts
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, 
  max: 5,
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// — REGISTER —
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
    };

    await cognito.signUp(params).promise();
    console.log(`User registered in Cognito: ${username}`);
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('[Register]', err);
    return res.status(500).json({ error: err.message });
  }
});

// — LOGIN —
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const authResult = await cognito.initiateAuth(params).promise();
    console.log(`User logged in: ${username}`);
    
    // Send tokens back to frontend
    return res.json({
      idToken: authResult.AuthenticationResult.IdToken,
      accessToken: authResult.AuthenticationResult.AccessToken,
      refreshToken: authResult.AuthenticationResult.RefreshToken
    });
  } catch (err) {
    console.error('[Login]', err);
    return res.status(401).json({ error: 'Login failed.' });
  }
});

// — WHO AM I? —
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'No token provided.' });
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token');

    const kid = decoded.header.kid;

    // Get public keys from Cognito
    const jwks = jwksRsa({
      jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
    });

    const getKey = (header, callback) => {
      jwks.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    };

    jwt.verify(token, getKey, {
      audience: CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
      algorithms: ['RS256'],
    }, (err, payload) => {
      if (err) {
        console.error('JWT verify error:', err);
        return res.status(401).json({ authenticated: false });
      }
      res.json({ authenticated: true, user: payload });
    });
  } catch (err) {
    console.error('[WhoAmI]', err);
    return res.status(401).json({ authenticated: false });
  }
});

// — LOGOUT —
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logout on client side by clearing tokens.' });
});

module.exports = router;
