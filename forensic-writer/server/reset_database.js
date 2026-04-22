// Complete Database Reset Script
// Clears all user data and creates default admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetDatabase() {
    try {
        console.log('=== FORENSIC WRITER DATABASE RESET ===\n');
        
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas:', process.env.MONGODB_URI);
        
        // Import all models
        const User = require('./src/models/User');
        const Message = require('./src/models/Message');
        const Notification = require('./src/models/Notification');
        const Case = require('./src/models/Case');
        const Evidence = require('./src/models/Evidence');
        const Report = require('./src/models/Report');
        const Conversation = require('./src/models/Conversation');
        const CaseAssignment = require('./src/models/CaseAssignment');
        const CaseComment = require('./src/models/CaseComment');
        const ReportVault = require('./src/models/ReportVault');
        const OTP = require('./src/models/OTP');
        
        // Collections to clear
        const collections = [
            { name: 'Messages', model: Message },
            { name: 'Notifications', model: Notification },
            { name: 'Cases', model: Case },
            { name: 'Evidence', model: Evidence },
            { name: 'Reports', model: Report },
            { name: 'Conversations', model: Conversation },
            { name: 'CaseAssignments', model: CaseAssignment },
            { name: 'CaseComments', model: CaseComment },
            { name: 'ReportVaults', model: ReportVault },
            { name: 'OTPs', model: OTP },
            { name: 'Users', model: User }
        ];
        
        console.log('Clearing all collections...\n');
        
        // Clear all collections
        for (const collection of collections) {
            try {
                const result = await collection.model.deleteMany({});
                console.log(`Deleted ${result.deletedCount} documents from ${collection.name}`);
            } catch (error) {
                console.log(`Error clearing ${collection.name}: ${error.message}`);
            }
        }
        
        console.log('\nCreating default admin user...\n');
        
        // Create default admin user
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const adminUser = new User({
            name: 'System Administrator',
            username: 'admin',
            email: 'admin@forensic.com',
            password: hashedPassword,
            role: 'system_admin',
            isVerified: true,
            avatar: 'boy1'
        });
        
        try {
            await adminUser.save();
            console.log('Default admin user created successfully:');
            console.log('Email: admin@forensic.com');
            console.log('Password: admin123');
            console.log('Role: system_admin');
        } catch (error) {
            console.log('Error creating admin user:', error.message);
            
            // If admin already exists, update it
            if (error.code === 11000) {
                console.log('Admin user already exists, updating password...');
                await User.findOneAndUpdate(
                    { email: 'admin@forensic.com' },
                    { 
                        password: hashedPassword,
                        role: 'system_admin',
                        isVerified: true
                    }
                );
                console.log('Admin user updated successfully');
            }
        }
        
        // Clear uploads directory (optional - comment out if you want to keep files)
        console.log('\nNote: Upload files in /uploads directory are preserved.');
        console.log('To clear uploaded files, manually delete the /uploads directory contents.\n');
        
        await mongoose.connection.close();
        console.log('=== DATABASE RESET COMPLETED ===');
        console.log('\nNext steps:');
        console.log('1. Start the server: npm run server');
        console.log('2. Start the client: npm run client');
        console.log('3. Login with admin@forensic.com / admin123');
        
    } catch (error) {
        console.error('Database reset failed:', error.message);
        process.exit(1);
    }
}

// Run the reset
resetDatabase().catch(console.error);
