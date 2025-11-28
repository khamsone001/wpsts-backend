const express = require('express');
const router = express.Router();
const {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} = require('../controllers/documentController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, admin, createDocument).get(protect, getAllDocuments);
router.route('/:id').get(protect, getDocumentById).put(protect, admin, updateDocument).delete(protect, admin, deleteDocument);

module.exports = router;