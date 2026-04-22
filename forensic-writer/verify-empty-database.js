// Verify all users are deleted from database
const { MongoClient } = require('mongodb');

async function verifyEmptyDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB for verification...');
    await client.connect();
    
    const db = client.db('forensic_writer');
    const usersCollection = db.collection('users');
    
    // Count users in database
    const userCount = await usersCollection.countDocuments();
    
    // Get all users (should be empty)
    const users = await usersCollection.find({}).toArray();
    
    console.log(`=== DATABASE VERIFICATION ===`);
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('✅ SUCCESS: Database is empty');
    } else {
      console.log('⚠️  WARNING: Database still contains users:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. Username: ${User.username}, Email: ${User.email}, Role: ${User.role}`);
      });
    }
    
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ ERROR verifying database:', error);
  }
}

// Run verification
verifyEmptyDatabase();
