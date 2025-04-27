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

// Create a JWKS client to fetch signing keys from Cognito
const jwksClient = jwksRsa({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// Function to get the signing key from JWKS based on the JWT header
const getKey = (header, callback) => {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
};


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

    // friendly helper for password policy failures
    if (err.code === 'InvalidPasswordException') {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.'
      });
    }

    // fallback to raw error for other cases
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
// router.get('/me', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ authenticated: false, error: 'No token provided.' });
//   }

//   try {
//     const decoded = jwt.decode(token, { complete: true });
//     if (!decoded) throw new Error('Invalid token');

//     const jwks = jwksRsa({
//       jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
//     });

//     const getKey = (header, callback) =>
//       jwks.getSigningKey(header.kid, (err, key) => callback(null, key.getPublicKey()));

//     jwt.verify(
//       token,
//       getKey,
//       {
//         audience: CLIENT_ID,
//         issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
//         algorithms: ['RS256'],
//       },
//       (err, payload) => {
//         if (err) {
//           console.error('JWT verify error:', err);
//           return res.status(401).json({ authenticated: false });
//         }
//         res.json({ authenticated: true, user: payload });
//       }
//     );
//   } catch (err) {
//     console.error('[WhoAmI]', err);
//     return res.status(401).json({ authenticated: false });
//   }
// });


// — WHO AM I? —
router.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false, error: 'No token' });
  }
  const token = auth.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Bad format');
  } catch {
    return res.status(401).json({ authenticated: false, error: 'Malformed token' });
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: decoded.payload.token_use === 'id' ? CLIENT_ID : undefined,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
      algorithms: ['RS256'],
    },
    (err, payload) => {
      if (err) {
        console.error('Verify failed:', err);
        return res.status(401).json({ authenticated: false, error: err.message });
      }
      res.json({
        authenticated: true,
        user: {
          sub: payload.sub,
          email: payload.email,
          username: payload['cognito:username'],
        },
      });
    }
  );
});


// — LOGOUT —
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logout on client side by clearing tokens.' });
});

module.exports = router;
