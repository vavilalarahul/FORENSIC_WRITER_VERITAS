const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('\n=== DATABASE CHECK ===');
    
    // Count total users
    const totalUsers = await collection.countDocuments();
    console.log('Total users in database:', totalUsers);
    
    if (totalUsers === 0) {
      console.log('No users found in database. You need to register a user first.');
      await mongoose.disconnect();
      return;
    }
    
    // Get all users
    const users = await collection.find({}).toArray();
    console.log('\n=== USERS LIST ===');
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Is Verified: ${user.isVerified}`);
      console.log(`  Has Password: ${!!user.password}`);
      console.log(`  Password starts with $2b$: ${user.password ? user.password.startsWith('$2b$') : 'N/A'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('---');
    });
    
    // Test password comparison for first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n=== TESTING PASSWORD COMPARISON FOR: ${testUser.email} ===`);
      
      const bcrypt = require('bcryptjs');
      const testPassword = 'TestPassword123!';
      
      console.log('Test password:', testPassword);
      console.log('Stored hash:', testUser.password);
      
      const match = await bcrypt.compare(testPassword, testUser.password);
      console.log('Password comparison result:', match);
      
      if (!match) {
        console.log('\n*** PASSWORD COMPARISON FAILED ***');
        console.log('This is the root cause of login failure.');
        console.log('The stored password hash is corrupted or invalid.');
      } else {
        console.log('\n*** PASSWORD COMPARISON SUCCESSFUL ***');
        console.log('The password comparison logic is working.');
      }
    }
    
    await mongoose.disconnect();
    console.log('\nDatabase check completed');
    
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkDatabase();
