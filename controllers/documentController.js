const supabase = require('../config/supabaseClient');

const createDocument = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .insert([req.body])
            .select()
            .single();
        
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

const getAllDocuments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Document not found' });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateDocument = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Document not found' });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.json({ message: 'Document removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createDocument, getAllDocuments, getDocumentById, updateDocument, deleteDocument };