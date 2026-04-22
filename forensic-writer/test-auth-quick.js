require('dotenv').config();
const http = require('http');

const testData = {
  username: "test_user_new",
  email: "testuser@forensic.com",
  password: "TestPass123!",
  role: "investigator"
};

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testAuth() {
  console.log('=== Quick Authentication Test ===\n');

  try {
    // Test 1: Register
    console.log('1. Testing Registration...');
    const registerResponse = await makeRequest('/api/auth/register', testData);
    console.log(`   Status: ${registerResponse.statusCode}`);
    const registerData = JSON.parse(registerResponse.data);
    console.log(`   Response: ${registerData.message}`);
    
    if (registerData.otp) {
      console.log(`   OTP: ${registerData.otp}`);

      // Test 2: Verify OTP
      console.log('\n2. Testing OTP Verification...');
      const otpData = {
        email: testData.email,
        otp: registerData.otp
      };
      
      const verifyResponse = await makeRequest('/api/auth/verify-otp', otpData);
      console.log(`   Status: ${verifyResponse.statusCode}`);
      const verifyData = JSON.parse(verifyResponse.data);
      console.log(`   Response: ${verifyData.message}`);
      
      if (verifyData.user) {
        console.log(`   User saved: ${verifyData.user.username}`);
      }
    }

    console.log('\n=== Test Complete ===');
    console.log('Authentication system tested!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();
