// Test script for authentication endpoints
const axios = require('axios');

// Test login endpoint
async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
  }
}

// Test signup endpoint
async function testSignup() {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      email: 'shivanshgupta_comp_2024@ltce.in',
      password: 'Password@123',
    });
    console.log('Signup successful:', response.data);
  } catch (error) {
    console.error('Signup error:', error.response ? error.response.data : error.message);
  }
}

// Run tests
testLogin();
testSignup();