// Test script for unauthorized authentication
const axios = require('axios');

// Test login with unauthorized email
async function testUnauthorizedLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      email: 'unauthorized@example.com',
      password: 'Password@123',
    });
    console.log('Unauthorized login successful:', response.data);
  } catch (error) {
    console.error('Unauthorized login error:', error.response ? error.response.data : error.message);
  }
}

// Test signup with unauthorized email
async function testUnauthorizedSignup() {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      email: 'unauthorized@example.com',
      password: 'Password@123',
    });
    console.log('Unauthorized signup successful:', response.data);
  } catch (error) {
    console.error('Unauthorized signup error:', error.response ? error.response.data : error.message);
  }
}

// Run tests
testUnauthorizedLogin();
testUnauthorizedSignup();