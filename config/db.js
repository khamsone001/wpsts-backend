const mongoose = require('mongoose');

const connectDB = async () => {
    // If already connected, do nothing (Serverless optimization)
    if (mongoose.connection.readyState === 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds instead of hanging forever
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database Connection Error:', err.message);
        // Don't exit process in serverless; let the next request retry
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

module.exports = connectDB;