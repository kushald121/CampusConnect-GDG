const axios = require('axios');

async function testValidation() {
  try {
    console.log('Testing validation and error handling...');
    
    // Test 1: Invalid email format
    console.log('\n1. Testing invalid email format:');
    try {
      await axios.post('http://localhost:3000/api/login', {
        email: 'invalid-email',
        password: 'Password@123'
      });
    } catch (error) {
      console.log('Expected validation error:', error.response.data);
    }
    
    // Test 2: Password too short
    console.log('\n2. Testing password too short:');
    try {
      await axios.post('http://localhost:3000/api/login', {
        email: 'test@example.com',
        password: 'short'
      });
    } catch (error) {
      console.log('Expected validation error:', error.response.data);
    }
    
    // Test 3: Valid login
    console.log('\n3. Testing valid login:');
    const validResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123'
    });
    console.log('Valid login successful:', validResponse.data);
    
    // Test 4: Test error handling with invalid endpoint
    console.log('\n4. Testing error handling with invalid endpoint:');
    try {
      await axios.get('http://localhost:3000/api/nonexistent');
    } catch (error) {
      console.log('Expected error for nonexistent endpoint:', error.response ? error.response.status : error.message);
    }
    
    console.log('\nValidation and error handling tests completed!');
    
  } catch (error) {
    console.error('Validation test error:', error.response ? error.response.data : error.message);
  }
}

testValidation();