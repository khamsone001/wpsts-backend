const express = require('express');
const router = express.Router();
const {
    createWork,
    getAllWorks,
    getWorkById,
    updateWork,
    deleteWork
} = require('../controllers/workController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, admin, createWork).get(protect, getAllWorks);
router.route('/:id').get(protect, getWorkById).put(protect, admin, updateWork).delete(protect, admin, deleteWork);

module.exports = router;