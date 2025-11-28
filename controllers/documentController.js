const Document = require('../models/Document');

// @desc    Create a document
// @route   POST /api/documents
const createDocument = async (req, res) => {
    try {
        const doc = await Document.create(req.body);
        res.status(201).json(doc);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

// @desc    Get all documents
// @route   GET /api/documents
const getAllDocuments = async (req, res) => {
    try {
        const docs = await Document.find({}).sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
const updateDocument = async (req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json(doc);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json({ message: 'Document removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createDocument, getAllDocuments, getDocumentById, updateDocument, deleteDocument };