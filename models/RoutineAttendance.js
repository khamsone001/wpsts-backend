const mongoose = require('mongoose');

const RoutineAttendanceSchema = new mongoose.Schema({
    // e.g., "A_2024-08"
    monthKey: {
        type: String,
        required: true,
        unique: true,
    },
    routine: { type: String, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    // Stores records from each admin. Key is admin's UID.
    adminRecords: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    // Stores the final, merged records after resolving conflicts.
    mergedRecords: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model('RoutineAttendance', RoutineAttendanceSchema);