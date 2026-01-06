const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      email: 'anshiksigh_comp_2024@ltce.in',
      password: 'Password@123',
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token);
    
    // Create a test image file
    const testImagePath = 'test-image.jpg';
    const testImageData = Buffer.from('fake-image-data', 'utf-8');
    fs.writeFileSync(testImagePath, testImageData);
    
    // Create form data
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));
    
    // Test image upload
    const uploadResponse = await axios.post('http://localhost:3000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Upload successful:', uploadResponse.data);
    
    // Clean up
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('Upload test error:', error.response ? error.response.data : error.message);
  }
}

testUpload();