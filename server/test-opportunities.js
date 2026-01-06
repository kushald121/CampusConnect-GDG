const axios = require('axios');

async function testOpportunities() {
  try {
    // First, login as admin to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'admin_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Test creating an opportunity
    const createResponse = await axios.post('http://localhost:3000/api/opportunities', {
      title: 'Hackathon 2026',
      type: 'competition',
      mode: 'online',
      deadline: '2026-12-31',
      teamSize: 4,
      skills: ['JavaScript', 'Node.js', 'React']
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Opportunity created:', createResponse.data);
    const opportunityId = createResponse.data.id;
    
    // Test getting all opportunities
    const opportunitiesResponse = await axios.get('http://localhost:3000/api/opportunities');
    console.log('All opportunities:', opportunitiesResponse.data);
    
    // Test filtering opportunities by type
    const filteredByTypeResponse = await axios.get('http://localhost:3000/api/opportunities', {
      params: { type: 'competition' }
    });
    console.log('Filtered by type (competition):', filteredByTypeResponse.data);
    
    // Test filtering opportunities by mode
    const filteredByModeResponse = await axios.get('http://localhost:3000/api/opportunities', {
      params: { mode: 'online' }
    });
    console.log('Filtered by mode (online):', filteredByModeResponse.data);
    
  } catch (error) {
    console.error('Opportunities test error:', error.response ? error.response.data : error.message);
  }
}

testOpportunities();