const Routine = require('../models/Routine');

// @desc    Get all routines or filter by type
// @route   GET /api/routines?type=main|sub
// @access  Public
const getRoutines = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};

        const routines = await Routine.find(filter).sort({ order: 1 });
        res.json(routines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single routine by ID
// @route   GET /api/routines/:id
// @access  Public
const getRoutineById = async (req, res) => {
    try {
        const routine = await Routine.findOne({ id: req.params.id.toUpperCase() });

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        res.json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new routine
// @route   POST /api/routines
// @access  Private (Super Admin only)
const createRoutine = async (req, res) => {
    try {
        const { id, name, description, type, order } = req.body;

        // Validate required fields
        if (!id || !name || !type) {
            return res.status(400).json({ message: 'ID, name, and type are required' });
        }

        // Check if routine with this ID already exists
        const existingRoutine = await Routine.findOne({ id: id.toUpperCase() });
        if (existingRoutine) {
            return res.status(400).json({ message: 'Routine with this ID already exists' });
        }

        const routine = await Routine.create({
            id: id.toUpperCase(),
            name,
            description: description || '',
            type,
            order: order || 0
        });

        res.status(201).json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
// @access  Private (Super Admin only)
const updateRoutine = async (req, res) => {
    try {
        const { name, description, type, order } = req.body;

        const routine = await Routine.findOne({ id: req.params.id.toUpperCase() });

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        // Update fields
        if (name) routine.name = name;
        if (description !== undefined) routine.description = description;
        if (type) routine.type = type;
        if (order !== undefined) routine.order = order;

        await routine.save();

        res.json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private (Super Admin only)
const deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine.findOne({ id: req.params.id.toUpperCase() });

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        await Routine.deleteOne({ id: req.params.id.toUpperCase() });

        res.json({ message: 'Routine deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine
};
