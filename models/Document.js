const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    heading: String,
    content: { type: String, required: true },
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Manual', 'Forms', 'Policy', 'Reports', 'Others'],
    },
    sections: [SectionSchema],
    createdBy: {
        type: String, // Can be changed to mongoose.Schema.Types.ObjectId and ref: 'User' later
    },
    type: {
        type: String,
        default: 'builtin',
    },
    size: { type: String } // For PDF files
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Document', DocumentSchema);