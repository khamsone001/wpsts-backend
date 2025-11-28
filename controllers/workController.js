const Work = require('../models/Work');

// @desc    Create a work
// @route   POST /api/works
const createWork = async (req, res) => {
    try {
        const work = await Work.create(req.body);
        res.status(201).json(work);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

// @desc    Get all works
// @route   GET /api/works
const getAllWorks = async (req, res) => {
    try {
        const works = await Work.find({}).sort({ createdAt: -1 });
        res.json(works);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single work by ID
// @route   GET /api/works/:id
const getWorkById = async (req, res) => {
    try {
        const work = await Work.findById(req.params.id);
        if (!work) return res.status(404).json({ message: 'Work not found' });
        res.json(work);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a work
// @route   PUT /api/works/:id
const updateWork = async (req, res) => {
    try {
        const work = await Work.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!work) return res.status(404).json({ message: 'Work not found' });
        res.json(work);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

// @desc    Delete a work
// @route   DELETE /api/works/:id
const deleteWork = async (req, res) => {
    try {
        const work = await Work.findByIdAndDelete(req.params.id);
        if (!work) return res.status(404).json({ message: 'Work not found' });
        res.json({ message: 'Work removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createWork, getAllWorks, getWorkById, updateWork, deleteWork };