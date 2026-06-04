const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabaseClient');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Try Supabase token verification first (for frontend requests using Supabase auth)
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

            if (!authError && authUser) {
                // Token verified by Supabase - get profile
                const { data: user, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (error || !user) {
                    return res.status(401).json({ message: 'Not authorized, user not found' });
                }

                req.user = user;
                return next();
            }

            // Fallback: try custom JWT (for backend-generated tokens)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data: user, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const super_admin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a super admin' });
    }
};

const canManageWorks = (req, res, next) => {
    if (req.user && ['manager', 'admin', 'super_admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized to manage works' });
    }
};

module.exports = { protect, admin, super_admin, canManageWorks };