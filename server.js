require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple Route for testing
app.get('/', (req, res) => res.send('WPSTS Management API is running...'));

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/attendance', require('./routes/routineAttendanceRoutes'));
app.use('/api/works', require('./routes/workRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));