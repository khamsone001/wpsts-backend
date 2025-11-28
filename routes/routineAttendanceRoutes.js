const express = require('express');
const router = express.Router();
const {
    getAttendanceForMonth,
    updateAttendance, 
    getAttendanceReport,
} = require('../controllers/routineAttendanceController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.get('/:routine/:year/:month', protect, getAttendanceForMonth);
router.post('/', protect, admin, updateAttendance);
router.get('/report', protect, getAttendanceReport);

module.exports = router;