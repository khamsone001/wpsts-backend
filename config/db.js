const supabase = require('./supabaseClient');

const connectDB = async () => {
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
            console.error('❌ Supabase Connection Error:', error.message);
            return false;
        }
        
        console.log('✅ Supabase Connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        return false;
    }
};

module.exports = connectDB;