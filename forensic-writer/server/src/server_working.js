const path = require('path');
const dotenv = require('dotenv');

// Load env from the root of forensic-writer (one level up from server/src)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Try to connect to DB but don't fail if it doesn't work
let connectDB;
try {
    connectDB = require('./config/db');
} catch (error) {
    console.log('MongoDB connection module not available, continuing without database');
}

const app = require('./app');

const startServer = async () => {
    try {
        // Try to connect to DB if available, but don't fail
        if (connectDB) {
            try {
                await connectDB();
                console.log('MongoDB connected successfully');
            } catch (dbError) {
                console.log('MongoDB connection failed, continuing without database:', dbError.message);
            }
        }
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server failed to start:', error.message);
        process.exit(1);
    }
};

startServer();
