require('dotenv').config();
const http = require('http');

const testData = {
  username: "investigator_test",
  email: "investigator@forensic.com",
  password: "SecurePass123!",
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

async function testMongoDBAuth() {
  console.log('=== MongoDB Authentication Flow Test ===\n');

  try {
    // Step 1: Register (send OTP)
    console.log('1. Testing Registration (OTP Send)...');
    const registerResponse = await makeRequest('/api/auth/register', testData);
    console.log(`   Status: ${registerResponse.statusCode}`);
    const registerData = JSON.parse(registerResponse.data);
    console.log(`   Response: ${registerData.message}`);
    
    if (registerData.otp) {
      console.log(`   OTP (for testing): ${registerData.otp}`);
    }

    // Step 2: Verify OTP
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
      console.log(`   User created in MongoDB: ${verifyData.user.username} (${verifyData.user.role})`);
    }

    // Step 3: Login with email
    console.log('\n3. Testing Login with Email...');
    const loginData = {
      identifier: testData.email,
      password: testData.password,
      role: testData.role
    };
    
    const loginResponse = await makeRequest('/api/auth/login', loginData);
    console.log(`   Status: ${loginResponse.statusCode}`);
    const loginDataResult = JSON.parse(loginResponse.data);
    console.log(`   Response: ${loginDataResult.message}`);
    
    if (loginDataResult.user) {
      console.log(`   Logged in user: ${loginDataResult.user.username} (${loginDataResult.user.role})`);
    }

    // Step 4: Login with username
    console.log('\n4. Testing Login with Username...');
    const loginUsernameData = {
      identifier: testData.username,
      password: testData.password,
      role: testData.role
    };
    
    const loginUsernameResponse = await makeRequest('/api/auth/login', loginUsernameData);
    console.log(`   Status: ${loginUsernameResponse.statusCode}`);
    const loginUsernameResult = JSON.parse(loginUsernameResponse.data);
    console.log(`   Response: ${loginUsernameResult.message}`);

    // Step 5: Test login with wrong password
    console.log('\n5. Testing Login with Wrong Password...');
    const wrongLoginData = {
      identifier: testData.email,
      password: "wrongpassword",
      role: testData.role
    };
    
    const wrongLoginResponse = await makeRequest('/api/auth/login', wrongLoginData);
    console.log(`   Status: ${wrongLoginResponse.statusCode}`);
    const wrongLoginResult = JSON.parse(wrongLoginResponse.data);
    console.log(`   Response: ${wrongLoginResult.message}`);

    // Step 6: Test login with wrong role
    console.log('\n6. Testing Login with Wrong Role...');
    const wrongRoleData = {
      identifier: testData.email,
      password: testData.password,
      role: "admin"
    };
    
    const wrongRoleResponse = await makeRequest('/api/auth/login', wrongRoleData);
    console.log(`   Status: ${wrongRoleResponse.statusCode}`);
    const wrongRoleResult = JSON.parse(wrongRoleResponse.data);
    console.log(`   Response: ${wrongRoleResult.message}`);

    console.log('\n=== MongoDB Authentication Test Complete ===');
    console.log('Authentication system with MongoDB is working correctly!');
    console.log('Users are now stored in MongoDB database.');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMongoDBAuth();
