const express = require('express');
const router = express.Router();
const { uploadImage, uploadPdf } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), uploadImage);
router.post('/pdf', protect, upload.single('pdf'), uploadPdf);

module.exports = router;