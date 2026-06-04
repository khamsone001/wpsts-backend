require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
// Dynamic CORS configuration for mobile apps
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from mobile apps and known origins
        const allowedOrigins = [
            'https://wpsts-backend002.vercel.app',
            'https://wpsts-backend-007.onrender.com',
            'https://wpsts04-production.up.railway.app',
        ];
        
        // Allow requests without origin (like mobile apps using fetch)
        if (!origin) return callback(null, true);
        
        // Allow all Expo Go and mobile app origins (exp://, expo://)
        if (origin.startsWith('exp://') || origin.startsWith('expo://')) {
            return callback(null, true);
        }
        
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS rejected:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health Check & Diagnostic Route
app.get('/api/health', async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        res.json({
            status: 'UP',
            environment: process.env.VERCEL ? 'Vercel' : (process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Other/Local'),
            database: {
                status: error ? 'Error' : 'Connected',
                connected: !error
            },
            env_check: {
                SUPABASE_URL: !!process.env.SUPABASE_URL,
                JWT_SECRET: !!process.env.JWT_SECRET
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            status: 'UP',
            database: { status: 'Error', connected: false },
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/', async (req, res) => {
    if (!process.env.SUPABASE_URL) {
        return res.status(500).json({
            error: 'ENVIRONMENT_VARIABLE_MISSING',
            message: 'SUPABASE_URL is not set in the environment variables.',
            platform: process.env.VERCEL ? 'Vercel' : 'Other'
        });
    }

    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        res.json({
            message: 'WPSTS Management API (Production) is running...',
            database: error ? 'Error' : 'Connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            message: 'WPSTS Management API (Production) is running...',
            database: 'Error',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
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
        // Verify Supabase connection
        const { supabase } = require('./config/supabaseClient');
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            console.warn('⚠️ Supabase Connection Warning:', error.message);
            console.warn('⚠️ Server will start without DB verification');
        } else {
            console.log('✅ Supabase Connected successfully');
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 Server UP on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to verify Supabase:', error.message);
        console.warn('⚠️ Starting server anyway...');
        app.listen(PORT, () => {
            console.log(`🚀 Server UP on port ${PORT} (DB check skipped)`);
        });
    }
};

// Initialize
if (process.env.VERCEL) {
    console.log('Vercel mode: Serverless function');
} else {
    startServer();
}
