const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase credentials not found in environment variables');
}

// Client สำหรับ general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

// Admin client สำหรับ create user (ต้องใช้ service_role key)
const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
    : null;

module.exports = { supabase, supabaseAdmin };