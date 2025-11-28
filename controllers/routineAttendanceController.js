const RoutineAttendance = require('../models/RoutineAttendance');
const User = require('../models/User.js');

/**
 * Merges attendance records from multiple admins into a single, definitive record.
 * The rule is: if there's any "absent" mark for a day, the final status is "absent".
 * The most recent note for an "absent" status is kept.
 */
const mergeAdminRecords = (adminRecords) => {
    const merged = {};
    if (!adminRecords) return merged;

    // Iterate over each admin's records
    Object.values(adminRecords).forEach(userRecords => {
        // Iterate over each user marked by the admin
        Object.entries(userRecords).forEach(([userId, dayRecords]) => {
            if (!merged[userId]) {
                merged[userId] = {};
            }
            // Iterate over each day marked for the user
            Object.entries(dayRecords).forEach(([day, attendanceData]) => {
                const existingData = merged[userId][day];

                // If the day hasn't been marked yet, just add it.
                if (!existingData) {
                    merged[userId][day] = attendanceData;
                    return;
                }

                // If the new mark is 'absent', it overrides 'present'.
                if (attendanceData.status === 'absent') {
                    // If the existing mark is also 'absent', keep the one with the newer timestamp.
                    if (existingData.status === 'absent') {
                        if (attendanceData.timestamp > existingData.timestamp) {
                            merged[userId][day] = attendanceData;
                        }
                    } else {
                        // If existing was 'present', 'absent' wins.
                        merged[userId][day] = attendanceData;
                    }
                }
                // If the new mark is 'present' and the existing is 'absent', do nothing.
            });
        });
    });
    return merged;
};


// @desc    Get attendance data for a specific routine and month
// @route   GET /api/attendance/:routine/:year/:month
const getAttendanceForMonth = async (req, res) => {
    try {
        const { routine, year, month } = req.params;
        const monthKey = `${routine}_${year}-${String(month).padStart(2, '0')}`;

        const attendanceDoc = await RoutineAttendance.findOne({ monthKey });

        if (attendanceDoc) {
            res.json(attendanceDoc);
        } else {
            // Return empty structure if no record exists for that month yet
            res.json({ adminRecords: {}, mergedRecords: {} });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update attendance data
// @route   POST /api/attendance
const updateAttendance = async (req, res) => {
    try {
        const { routine, year, month, adminId, userId, day, status, note } = req.body;
        const monthKey = `${routine}_${year}-${String(month).padStart(2, '0')}`;

        let attendanceDoc = await RoutineAttendance.findOne({ monthKey });

        if (!attendanceDoc) {
            attendanceDoc = new RoutineAttendance({ monthKey, routine, year, month });
        }

        // Update the specific admin's record
        const adminRecordPath = `adminRecords.${adminId}.${userId}.${day}`;
        attendanceDoc.set(adminRecordPath, {
            status,
            note: status === 'absent' ? note : '',
            timestamp: Date.now(),
        });

        // Re-calculate the merged records
        const newMergedRecords = mergeAdminRecords(attendanceDoc.adminRecords);
        attendanceDoc.mergedRecords = newMergedRecords;

        const savedDoc = await attendanceDoc.save();
        res.json(savedDoc);

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

// @desc    Get attendance report data for a date range
// @route   GET /api/attendance/report?startDate=...&endDate=...
const getAttendanceReport = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide startDate and endDate' });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // 1. Get all users (non-managers)
        const users = await User.find({ role: { $ne: 'manager' } }).sort({ 'history.workAge': -1 });

        // 2. Find all attendance documents within the date range
        const attendanceDocs = await RoutineAttendance.find({
            year: { $gte: start.getFullYear(), $lte: end.getFullYear() }
        });

        const allAttendance = {};
        attendanceDocs.forEach(doc => {
            const docDate = new Date(doc.year, doc.month - 1);
            if (docDate >= new Date(start.getFullYear(), start.getMonth()) && docDate <= end) {
                const routine = doc.routine;
                if (!allAttendance[routine]) {
                    allAttendance[routine] = {};
                }
                if (doc.mergedRecords) {
                    Object.entries(doc.mergedRecords).forEach(([userId, userDays]) => {
                        if (!allAttendance[routine][userId]) {
                            allAttendance[routine][userId] = {};
                        }
                        Object.assign(allAttendance[routine][userId], userDays);
                    });
                }
            }
        });

        // 3. Process data for each user
        const processedData = users.map(user => {
            const userReport = {
                uid: user._id.toString(),
                name: user.personalInfo?.name || user.email,
                totalAbsences: 0,
                routineBreakdown: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 },
                absenceDetails: []
            };

            Object.entries(allAttendance).forEach(([routine, routineData]) => {
                const userData = routineData[user._id.toString()] || {};
                Object.entries(userData).forEach(([day, dayData]) => {
                    if (dayData.status === 'absent') {
                        userReport.totalAbsences++;
                        userReport.routineBreakdown[routine]++;
                        userReport.absenceDetails.push({ routine, day: parseInt(day), note: dayData.note || '-' });
                    }
                });
            });
            return userReport;
        });

        res.json({ users, report: processedData });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAttendanceForMonth, updateAttendance, getAttendanceReport };