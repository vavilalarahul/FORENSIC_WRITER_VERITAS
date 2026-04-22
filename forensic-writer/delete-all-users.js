// MongoDB script to delete all users from forensic_writer database
const { MongoClient } = require('mongodb');

async function deleteAllUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('forensic_writer');
    const usersCollection = db.collection('users');
    
    console.log('Deleting all users from users collection...');
    
    // Delete all users
    const result = await usersCollection.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} users from database`);
    
    // Verify deletion
    const remainingUsers = await usersCollection.countDocuments();
    console.log(`Remaining users in database: ${remainingUsers}`);
    
    if (remainingUsers === 0) {
      console.log('✅ SUCCESS: All users deleted from database');
    } else {
      console.log('⚠️  WARNING: Some users may still remain');
    }
    
  } catch (error) {
    console.error('❌ ERROR deleting users:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the deletion
deleteAllUsers();
