const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['main', 'sub'],
        default: 'main'
    },
    order: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
routineSchema.index({ type: 1, order: 1 });

module.exports = mongoose.model('Routine', routineSchema);
