// Investigate unauthorized dashboard user access
const { MongoClient } = require('mongodb');

async function investigateUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔍 Investigating user database...');
    await client.connect();
    
    const db = client.db('forensic_writer');
    const usersCollection = db.collection('users');
    
    // Check if any users exist
    const userCount = await usersCollection.countDocuments();
    
    if (userCount > 0) {
      console.log(`⚠️  WARNING: Found ${userCount} users in database!`);
      
      // Get all users to investigate
      const users = await usersCollection.find({}).toArray();
      
      console.log('=== USERS FOUND IN DATABASE ===');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. Username: "${user.username}", Email: "${user.email}", Role: "${user.role}", Created: ${user.createdAt}`);
      });
      
      // Look for the specific user mentioned
      const targetUser = users.find(u => 
        u.email === 'useruser@gmail.com' || 
        u.username === 'useruser'
      );
      
      if (targetUser) {
        console.log('\n🎯 TARGET USER FOUND:');
        console.log(`  Username: ${targetUser.username}`);
        console.log(`  Email: ${targetUser.email}`);
        console.log(`  Role: ${targetUser.role}`);
        console.log(`  Created: ${targetUser.createdAt}`);
        console.log(`  ID: ${targetUser._id}`);
      } else {
        console.log('\n❌ TARGET USER NOT FOUND');
        console.log('  No user with email "useruser@gmail.com" or username "useruser" found');
      }
      
    } else {
      console.log('✅ Database is empty - no users found');
    }
    
  } catch (error) {
    console.error('❌ ERROR investigating database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run investigation
investigateUser();
