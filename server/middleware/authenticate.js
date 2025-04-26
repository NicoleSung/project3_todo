const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const REGION = 'us-east-1'; // your AWS region
const USER_POOL_ID = 'us-east-1_QQ0vo4TRv';
const CLIENT_ID = '3g6mpmbhvs83kue3cqq1q04nuc';

const authenticate = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
  }),
  audience: CLIENT_ID,
  issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
  algorithms: ['RS256'],
  credentialsRequired: true, // Reject if token not provided
});

module.exports = authenticate;
