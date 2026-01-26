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

// Export for Vercel
module.exports = app;

// Start server function
const startServer = async () => {
    try {
        await connectDB();

        // Only listen if not running as a Vercel serverless function
        if (process.env.VERCEL) {
            console.log('Running as Vercel Serverless Function');
        } else {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log('Environment check (Long-running mode):');
                console.log('- MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
            });
        }
    } catch (error) {
        console.error('Failed to initialize server:', error);
        if (!process.env.VERCEL) process.exit(1);
    }
};

// Initialize
if (process.env.VERCEL) {
    connectDB();
} else {
    startServer();
}
