const axios = require('axios');

async function testAdminApproval() {
  try {
    // First, login as a student to create an item
    const studentLoginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const studentToken = studentLoginResponse.data.token;
    console.log('Student login successful');
    
    // Create an item as a student
    const createResponse = await axios.post('http://localhost:3000/api/items', {
      title: 'Test Item for Approval',
      description: 'This is a test item for admin approval',
      category: 'Electronics',
      condition: 'New',
      price: 199.99,
      image_path: '/uploads/test-image.jpg'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    console.log('Item created:', createResponse.data);
    const itemId = createResponse.data.id;
    
    // Now, login as an admin (using a different email that contains 'admin')
    // Note: In a real scenario, you would have proper admin users in your database
    // For testing, we'll use the RBAC middleware that checks for 'admin' in the email
    const adminLoginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'admin_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log('Admin login successful');
    
    // Test getting pending items
    const pendingResponse = await axios.get('http://localhost:3000/api/admin/items/pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('Pending items:', pendingResponse.data);
    
    // Test approving the item
    const approveResponse = await axios.post(
      `http://localhost:3000/api/admin/items/${itemId}/approve`,
      { adminRemark: 'Item looks good' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('Item approved:', approveResponse.data);
    
    // Verify the item is now approved
    const itemResponse = await axios.get(`http://localhost:3000/api/items/${itemId}`);
    console.log('Item status after approval:', itemResponse.data.status);
    
    // Verify the item appears in approved items list
    const approvedItemsResponse = await axios.get('http://localhost:3000/api/items');
    console.log('Approved items list:', approvedItemsResponse.data);
    
  } catch (error) {
    console.error('Admin approval test error:', error.response ? error.response.data : error.message);
  }
}

testAdminApproval();