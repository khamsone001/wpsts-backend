const express = require('express');
const router = express.Router();
const {
    createWork,
    getAllWorks,
    getWorkById,
    updateWork,
    deleteWork
} = require('../controllers/workController.js');
const { protect, canManageWorks } = require('../middleware/authMiddleware.js');

router.route('/')
    .post(protect, canManageWorks, createWork) // Use canManageWorks
    .get(protect, getAllWorks);

router.route('/:id')
    .get(protect, getWorkById)
    .put(protect, canManageWorks, updateWork) // Use canManageWorks
    .delete(protect, canManageWorks, deleteWork); // Use canManageWorks

module.exports = router;