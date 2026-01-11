require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple Route for testing with DB Status
app.get('/', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const statusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting',
    };
    res.json({
        message: 'WPSTS Management API is running...',
        database: statusMap[dbState] || 'Unknown',
        timestamp: new Date().toISOString()
    });
});

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/attendance', require('./routes/routineAttendanceRoutes'));
app.use('/api/works', require('./routes/workRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/routines', require('./routes/routineRoutes'));

const PORT = process.env.PORT || 5000;

// Error handling for uncaught exceptions (MUST be before server start)
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment check:');
            console.log('- MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
            console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
            console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();