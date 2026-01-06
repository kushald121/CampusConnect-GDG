const axios = require('axios');

async function testUserProfile() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful');
    
    // Test getting current user profile
    const profileResponse = await axios.get('http://localhost:3000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('User profile:', profileResponse.data);
    const userId = profileResponse.data.id;
    
    // Test getting user activity
    const activityResponse = await axios.get(`http://localhost:3000/api/users/${userId}/activity`);
    
    console.log('User activity:', activityResponse.data);
    
  } catch (error) {
    console.error('User profile test error:', error.response ? error.response.data : error.message);
  }
}

testUserProfile();