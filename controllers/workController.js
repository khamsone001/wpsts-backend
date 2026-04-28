const supabase = require('../config/supabaseClient');

const createWork = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('works')
            .insert([req.body])
            .select()
            .single();
        
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

const getAllWorks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('works')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getWorkById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('works')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Work not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateWork = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('works')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Work not found' });
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

const deleteWork = async (req, res) => {
    try {
        const { error } = await supabase
            .from('works')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ message: 'Work removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createWork, getAllWorks, getWorkById, updateWork, deleteWork };