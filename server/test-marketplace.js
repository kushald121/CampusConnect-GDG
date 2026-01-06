const axios = require('axios');

async function testMarketplace() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token);
    
    // Test creating an item
    const createResponse = await axios.post('http://localhost:3000/api/items', {
      title: 'Test Item',
      description: 'This is a test item',
      category: 'Electronics',
      condition: 'New',
      price: 99.99,
      image_path: '/uploads/test-image.jpg'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Item created:', createResponse.data);
    const itemId = createResponse.data.id;
    
    // Test getting user's own items
    const myItemsResponse = await axios.get('http://localhost:3000/api/items/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('My items:', myItemsResponse.data);
    
    // Test getting all approved items (should be empty since our item is pending)
    const approvedItemsResponse = await axios.get('http://localhost:3000/api/items');
    console.log('Approved items:', approvedItemsResponse.data);
    
    // Test getting a single item
    const singleItemResponse = await axios.get(`http://localhost:3000/api/items/${itemId}`);
    console.log('Single item:', singleItemResponse.data);
    
    // Test deleting the item
    const deleteResponse = await axios.delete(`http://localhost:3000/api/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Item deleted:', deleteResponse.data);
    
  } catch (error) {
    console.error('Marketplace test error:', error.response ? error.response.data : error.message);
  }
}

testMarketplace();