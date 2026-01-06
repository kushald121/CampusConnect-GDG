const axios = require('axios');

async function testNotifications() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful');
    
    // First, create a doubt to trigger a notification when someone replies
    const doubtResponse = await axios.post('http://localhost:3000/api/doubts', {
      title: 'Test Doubt for Notifications',
      content: 'This is a test doubt to trigger notifications',
      topic: 'Testing',
      isAnonymous: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Doubt created:', doubtResponse.data);
    const doubtId = doubtResponse.data.id;
    
    // Now reply to the doubt (this should create a notification)
    const replyResponse = await axios.post(
      `http://localhost:3000/api/doubts/${doubtId}/reply`,
      { content: 'This is a test reply to trigger notification' },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Reply created:', replyResponse.data);
    
    // Test getting notifications
    const notificationsResponse = await axios.get('http://localhost:3000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('User notifications:', notificationsResponse.data);
    
    if (notificationsResponse.data.length > 0) {
      const notificationId = notificationsResponse.data[0].id;
      
      // Test marking notification as read
      const markReadResponse = await axios.post('http://localhost:3000/api/notifications/mark-read', {
        notificationId: notificationId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Mark read response:', markReadResponse.data);
      
      // Verify notification is marked as read
      const updatedNotifications = await axios.get('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Updated notifications:', updatedNotifications.data);
    }
    
  } catch (error) {
    console.error('Notifications test error:', error.response ? error.response.data : error.message);
  }
}

testNotifications();