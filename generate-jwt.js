const jwt = require('jsonwebtoken');

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_here';

// Create a payload with user information and expiry time
const payload = {
  userId: '12345',
  username: 'example_user',
  roles: ['user'],
  // Set token to expire in 1 hour (3600 seconds)
  exp: Math.floor(Date.now() / 1000) + 3600
};

// Generate the JWT
const token = jwt.sign(payload, JWT_SECRET);

console.log('Your JWT token:');
console.log(token);