const axios = require('axios');

async function decodeToken() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Token:', token);
    
    // Decode the token
    const parts = token.split('.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    console.log('Header:', header);
    console.log('Payload:', payload);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

decodeToken();