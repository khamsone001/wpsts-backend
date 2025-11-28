const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    startDate: { type: String }, // Storing as string to match existing format "DD/MM/YYYY"
    startTime: { type: String }, // Storing as string to match existing format "HH:mm"
    selectedUsers: {
        type: Array,
        default: [],
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Work', WorkSchema);