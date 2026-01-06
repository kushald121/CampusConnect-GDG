const axios = require('axios');

async function testDoubts() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful');
    
    // Test creating a doubt
    const createResponse = await axios.post('http://localhost:3000/api/doubts', {
      title: 'Test Doubt',
      content: 'This is a test doubt about programming',
      topic: 'Programming',
      isAnonymous: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Doubt created:', createResponse.data);
    const doubtId = createResponse.data.id;
    
    // Test getting all doubts
    const doubtsResponse = await axios.get('http://localhost:3000/api/doubts');
    console.log('All doubts:', doubtsResponse.data);
    
    // Test replying to the doubt
    const replyResponse = await axios.post(
      `http://localhost:3000/api/doubts/${doubtId}/reply`,
      { content: 'This is a test reply to the doubt' },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Reply created:', replyResponse.data);
    
    // Test getting a single doubt with replies
    const singleDoubtResponse = await axios.get(`http://localhost:3000/api/doubts/${doubtId}`);
    console.log('Single doubt with replies:', singleDoubtResponse.data);
    
  } catch (error) {
    console.error('Doubts test error:', error.response ? error.response.data : error.message);
  }
}

testDoubts();