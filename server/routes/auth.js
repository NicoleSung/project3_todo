// const express = require('express');
// const AWS = require('aws-sdk');
// const jwt = require('jsonwebtoken');
// const jwksRsa = require('jwks-rsa');
// const rateLimit = require('express-rate-limit');

// const router = express.Router();

// // Cognito details
// const REGION = 'us-east-1';
// const USER_POOL_ID = 'us-east-1_QQ0vo4TRv';
// const CLIENT_ID = '2j7j8tflnfc41ns06v2eds46fl';

// AWS.config.update({ region: REGION });
// const cognito = new AWS.CognitoIdentityServiceProvider();

// // Rate limit login attempts
// const loginLimiter = rateLimit({
//   windowMs: 3 * 60 * 1000, 
//   max: 5,
//   message: { error: 'Too many login attempts. Try again later.' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // — REGISTER —
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required.' });
//   }

//   try {
//     const params = {
//       ClientId: CLIENT_ID,
//       Username: username,
//       Password: password,
//     };

//     await cognito.signUp(params).promise();
//     console.log(`User registered in Cognito: ${username}`);
//     return res.status(201).json({ message: 'User registered successfully.' });
//   } catch (err) {
//     console.error('[Register]', err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // — LOGIN —
// router.post('/login', loginLimiter, async (req, res) => {
//   const { username, password } = req.body;
  
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required.' });
//   }

//   const params = {
//     AuthFlow: 'USER_PASSWORD_AUTH',
//     ClientId: CLIENT_ID,
//     AuthParameters: {
//       USERNAME: username,
//       PASSWORD: password,
//     },
//   };

//   try {
//     const authResult = await cognito.initiateAuth(params).promise();
//     console.log(`User logged in: ${username}`);
    
//     // Send tokens back to frontend
//     return res.json({
//       idToken: authResult.AuthenticationResult.IdToken,
//       accessToken: authResult.AuthenticationResult.AccessToken,
//       refreshToken: authResult.AuthenticationResult.RefreshToken
//     });
//   } catch (err) {
//     console.error('[Login]', err);
//     return res.status(401).json({ error: 'Login failed.' });
//   }
// });

// // — WHO AM I? —
// router.get('/me', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ authenticated: false, error: 'No token provided.' });
//   }

//   try {
//     const decoded = jwt.decode(token, { complete: true });
//     if (!decoded) throw new Error('Invalid token');

//     const kid = decoded.header.kid;

//     // Get public keys from Cognito
//     const jwks = jwksRsa({
//       jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
//     });

//     const getKey = (header, callback) => {
//       jwks.getSigningKey(header.kid, (err, key) => {
//         const signingKey = key.getPublicKey();
//         callback(null, signingKey);
//       });
//     };

//     jwt.verify(token, getKey, {
//       audience: CLIENT_ID,
//       issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
//       algorithms: ['RS256'],
//     }, (err, payload) => {
//       if (err) {
//         console.error('JWT verify error:', err);
//         return res.status(401).json({ authenticated: false });
//       }
//       res.json({ authenticated: true, user: payload });
//     });
//   } catch (err) {
//     console.error('[WhoAmI]', err);
//     return res.status(401).json({ authenticated: false });
//   }
// });

// // — LOGOUT —
// router.post('/logout', (req, res) => {
//   return res.json({ message: 'Logout on client side by clearing tokens.' });
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
router.get('/me', async (req, res) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      authenticated: false, 
      error: 'Authorization header missing or malformed' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      authenticated: false, 
      error: 'No token provided' 
    });
  }

  try {
    // First decode to check basic structure before verification
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Invalid token format' 
      });
    }

    // Set up JWKS client for key retrieval
    const jwksClient = jwksRsa({
      jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5
    });

    // Function to get the signing key
    const getKey = (header, callback) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          console.error('Failed to retrieve signing key:', err);
          return callback(err);
        }
        
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    };

    // Verify token with appropriate options
    jwt.verify(
      token,
      getKey,
      {
        // For ID tokens, verify audience
        ...(decoded.payload.token_use === 'id' && { audience: CLIENT_ID }),
        // For access tokens, skip audience check (they use 'client_id' differently)
        issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
        algorithms: ['RS256']
      },
      (err, payload) => {
        if (err) {
          console.error('Token verification failed:', err.name, err.message);
          
          // Return specific error based on verification failure
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
              authenticated: false, 
              error: 'Token expired' 
            });
          } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
              authenticated: false, 
              error: 'Invalid token' 
            });
          } else {
            return res.status(401).json({ 
              authenticated: false, 
              error: 'Token verification failed' 
            });
          }
        }
        
        // Token is valid, return user info
        return res.json({ 
          authenticated: true, 
          user: {
            sub: payload.sub,
            email: payload.email,
            username: payload['cognito:username'],
            // Don't include sensitive claims
          }
        });
      }
    );
  } catch (err) {
    console.error('Unexpected error during authentication:', err);
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Authentication service error' 
    });
  }
});



// — LOGOUT —
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logout on client side by clearing tokens.' });
});

module.exports = router;
