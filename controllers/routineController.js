const supabase = require('../config/supabaseClient');

const getRoutines = async (req, res) => {
    try {
        const { type } = req.query;
        let query = supabase.from('routines').select('*').order('order', { ascending: true });
        
        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getRoutineById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('routines')
            .select('*')
            .eq('id', req.params.id.toUpperCase())
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createRoutine = async (req, res) => {
    try {
        const { id, name, description, type, order } = req.body;

        if (!id || !name || !type) {
            return res.status(400).json({ message: 'ID, name, and type are required' });
        }

        const { data: existingRoutine } = await supabase
            .from('routines')
            .select('id')
            .eq('id', id.toUpperCase())
            .single();

        if (existingRoutine) {
            return res.status(400).json({ message: 'Routine with this ID already exists' });
        }

        const { data, error } = await supabase
            .from('routines')
            .insert([{
                id: id.toUpperCase(),
                name,
                description: description || '',
                type,
                order: order || 0
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateRoutine = async (req, res) => {
    try {
        const { name, description, type, order } = req.body;

        const { data: routine, error: findError } = await supabase
            .from('routines')
            .select('*')
            .eq('id', req.params.id.toUpperCase())
            .single();

        if (findError || !routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type) updateData.type = type;
        if (order !== undefined) updateData.order = order;

        const { data, error } = await supabase
            .from('routines')
            .update(updateData)
            .eq('id', req.params.id.toUpperCase())
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteRoutine = async (req, res) => {
    try {
        const { data: routine, error: findError } = await supabase
            .from('routines')
            .select('*')
            .eq('id', req.params.id.toUpperCase())
            .single();

        if (findError || !routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', req.params.id.toUpperCase());

        if (error) throw error;
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