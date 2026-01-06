// Test script to verify marketplace updates after admin approval
const axios = require('axios');

// Test fetching approved items
async function testFetchApprovedItems() {
  try {
    const response = await axios.get('http://localhost:3000/api/items');
    console.log('Approved items fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching approved items:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Test the full flow: upload item, approve item, and fetch approved items
async function testFullFlow() {
  try {
    // Step 1: Upload an item (as a student)
    const uploadResponse = await axios.post('http://localhost:3000/api/items', {
      title: 'Test Item',
      description: 'This is a test item for marketplace update verification.',
      category: 'Books & Notes',
      condition: 'Good',
      price: '100',
      image_path: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=400&fit=crop',
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc2NzYyODk3MiwiZXhwIjoxNzY3NjMyNTcyLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BjYW1wdXNjb25uZWN0LWMwYzQ1LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAY2FtcHVzY29ubmVjdC1jMGM0NS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6ImFuc2hpa3NpZ2hfY29tcF8yMDI0QGx0Y2UuaW4ifQ.NFjp5jpzCxIc-jimiIVgUrZLRL631JXpxkbO-sc8QXUsGkyuWcHtws_apykWJVXh0N96bK4llwJ4G96SzMdwa5_f-_Xp2trp6lq0aYtzO8KTEzbZUfPZQWbGOOsc9reNNMISYhRVEvi-5j9lvWctqjtKeNgIiA5Z4ExvEZPhrveRPXBL-WoNuNphjmTbil3M7hxvbwZqh7VEvOUO2CLouP3OXqFt3xU5SMXaQKy13QBZ9K-a2EDR_-88A13Zm0mllJ4hdDn44jbljkqDtAXSUa2jkT8ECWiczJvITm4uQUb-gKyUzFGJh3yOR17kjxO1ksHUXnbYB6M2dK0cPJ_ZtA',
      },
    });
    
    console.log('Item uploaded successfully:', uploadResponse.data);
    const itemId = uploadResponse.data.id;
    
    // Step 2: Approve the item (as an admin)
    const approveResponse = await axios.post(`http://localhost:3000/api/admin/items/${itemId}/approve`, {
      adminRemark: 'Approved for marketplace',
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc2NzYyODk3MiwiZXhwIjoxNzY3NjMyNTcyLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BjYW1wdXNjb25uZWN0LWMwYzQ1LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiYWRtaW5fY29tcF8yMDI0QGx0Y2UuaW4iLCJ1aWQiOiJhZG1pbl9jb21wXzIwMjRAbHRjZS5pbiJ9.NFjp5jpzCxIc-jimiIVgUrZLRL631JXpxkbO-sc8QXUsGkyuWcHtws_apykWJVXh0N96bK4llwJ4G96SzMdwa5_f-_Xp2trp6lq0aYtzO8KTEzbZUfPZQWbGOOsc9reNNMISYhRVEvi-5j9lvWctqjtKeNgIiA5Z4ExvEZPhrveRPXBL-WoNuNphjmTbil3M7hxvbwZqh7VEvOUO2CLouP3OXqFt3xU5SMXaQKy13QBZ9K-a2EDR_-88A13Zm0mllJ4hdDn44jbljkqDtAXSUa2jkT8ECWiczJvITm4uQUb-gKyUzFGJh3yOR17kjxO1ksHUXnbYB6M2dK0cPJ_ZtA',
      },
    });
    
    console.log('Item approved successfully:', approveResponse.data);
    
    // Step 3: Fetch approved items to verify the update
    const approvedItems = await testFetchApprovedItems();
    console.log('Marketplace updated with approved items:', approvedItems);
    
    return approvedItems;
  } catch (error) {
    console.error('Error in full flow test:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Run the test
testFullFlow();