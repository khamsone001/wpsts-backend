const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, registerUser, loginUser, approveUser, setUserPassword, changeUserPassword } = require('../controllers/userController.js');
const { protect, super_admin } = require('../middleware/authMiddleware.js');

router.route('/')
    .get(protect, getUsers);

router.post('/register', registerUser);
router.post('/login', loginUser);

// Specific routes must come before generic routes with parameters
router.put('/change-password', protect, changeUserPassword); // New route for user to change their own password

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, super_admin, deleteUser);

router.put('/:id/approve', protect, super_admin, approveUser);
router.put('/:id/set-password', protect, super_admin, setUserPassword);

module.exports = router;
