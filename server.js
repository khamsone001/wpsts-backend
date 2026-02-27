require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ensure DB is connected before every request (critical for Vercel serverless)
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Health Check & Diagnostic Route
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const statusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

    res.json({
        status: 'UP',
        environment: process.env.VERCEL ? 'Vercel' : (process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Other/Local'),
        database: {
            status: statusMap[dbState] || 'Unknown',
            connected: dbState === 1
        },
        env_check: {
            MONGO_URI: !!process.env.MONGO_URI,
            JWT_SECRET: !!process.env.JWT_SECRET
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    const mongoose = require('mongoose');
    if (!process.env.MONGO_URI) {
        return res.status(500).json({
            error: 'ENVIRONMENT_VARIABLE_MISSING',
            message: 'MONGO_URI is not set in the environment variables.',
            platform: process.env.VERCEL ? 'Vercel' : 'Other'
        });
    }

    const dbState = mongoose.connection.readyState;
    const statusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    res.json({
        message: 'WPSTS Management API (Production) is running...',
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
        // Wait for DB before accepting requests (critical for Render)
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server UP on port ${PORT} | DB Connected`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
};

// Initialize
if (process.env.VERCEL) {
    // Vercel serverless: connectDB is handled per-request by middleware above
    console.log('Vercel mode: DB connection handled per-request');
} else {
    startServer();
}
