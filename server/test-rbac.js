const axios = require('axios');

// Test RBAC endpoints
async function testRBAC() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token);
    
    // Test authenticated endpoint
    const authResponse = await axios.get('http://localhost:3000/api/auth-test', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Auth test successful:', authResponse.data);
    
    // Test student endpoint
    const studentResponse = await axios.get('http://localhost:3000/api/student-test', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Student test successful:', studentResponse.data);
    
    // Test admin endpoint (should fail for non-admin)
    try {
      const adminResponse = await axios.get('http://localhost:3000/api/admin-test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin test successful:', adminResponse.data);
    } catch (error) {
      console.log('Admin test failed (expected):', error.response ? error.response.data : error.message);
    }
    
  } catch (error) {
    console.error('RBAC test error:', error.response ? error.response.data : error.message);
  }
}

testRBAC();