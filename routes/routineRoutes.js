const express = require('express');
const router = express.Router();
const {
    getRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine
} = require('../controllers/routineController');
const { protect, super_admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getRoutines);
router.get('/:id', getRoutineById);

// Protected routes (Super Admin only)
router.post('/', protect, super_admin, createRoutine);
router.put('/:id', protect, super_admin, updateRoutine);
router.delete('/:id', protect, super_admin, deleteRoutine);

module.exports = router;
