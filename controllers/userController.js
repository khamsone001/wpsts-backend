const { supabase, supabaseAdmin } = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        users.sort((a, b) => {
            const classA = a.class || '';
            const classB = b.class || '';
            const workAgeA = a.work_age || 0;
            const workAgeB = b.work_age || 0;

            if (classA !== classB) {
                if (classA === 'M') return -1;
                if (classB === 'M') return 1;
            }

            return workAgeB - workAgeA;
        });

        res.json(users);
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('getUserById error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { data: userToUpdate, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (findError || !userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { data: updatedUser, error } = await supabase
            .from('profiles')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(updatedUser);

    } catch (error) {
        console.error('updateUser error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { data: userToDelete, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (findError || !userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User removed successfully' });

    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const registerUser = async (req, res) => {
    const { email, password, personalInfo, history, photoURL } = req.body;
    
    try {
        // Check if user already exists in profiles
        const { data: existingUser, error: existingError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        if (existingError && existingError.code !== 'PGRST116') {
            console.error('Check existing user error:', existingError);
            throw existingError;
        }

        // Count users to determine role
        const { data: allUsers } = await supabase
            .from('profiles')
            .select('id');
            
        const userCount = allUsers?.length || 0;
        const role = userCount === 0 ? 'super_admin' : 'user';
        const isApproved = userCount === 0;

        // Create user in Supabase Auth if admin client is available
        let authUserId = null;
        if (supabaseAdmin) {
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    first_name: personalInfo?.firstName,
                    last_name: personalInfo?.lastName
                }
            });
            
            if (authError) {
                console.error('Supabase Auth create user error:', authError);
                // Continue anyway - might be duplicate in auth
            } else if (authData?.user) {
                authUserId = authData.user.id;
            }
        }

        // Hash password for our profiles table
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            email,
            password: hashedPassword,
            role,
            approved: isApproved,
            photo_url: photoURL,
            firebase_uid: authUserId,
            first_name: personalInfo?.firstName,
            last_name: personalInfo?.lastName,
            name: personalInfo?.name,
            nickname: personalInfo?.nickname,
            age: personalInfo?.age,
            class: personalInfo?.class,
            address_house: personalInfo?.currentAddress?.house,
            address_city: personalInfo?.currentAddress?.city,
            address_district: personalInfo?.currentAddress?.district,
            work_age: history?.workAge,
            birth_date: history?.birthDate,
            birth_place_house: history?.placeOfBirth?.house,
            birth_place_city: history?.placeOfBirth?.city,
            birth_place_district: history?.placeOfBirth?.district,
            race: history?.race,
            nationality: history?.nationality,
            tribe: history?.tribe,
            education: history?.education,
            class_n_entry_date: history?.classN?.entryDate,
            class_n_location_house: history?.classN?.location?.house,
            class_n_location_city: history?.classN?.location?.city,
            class_n_location_district: history?.classN?.location?.district,
            class_n_issuer_name: history?.classN?.issuerName,
            class_n_id_card: history?.classN?.idCard,
            class_n_total_work_age: history?.classN?.totalWorkAge,
            class_m_entry_date: history?.classM?.entryDate,
            class_m_location_house: history?.classM?.location?.house,
            class_m_location_city: history?.classM?.location?.city,
            class_m_location_district: history?.classM?.location?.district,
            class_m_issuer_name: history?.classM?.issuerName,
            class_m_id_card: history?.classM?.idCard,
            class_m_total_work_age: history?.classM?.totalWorkAge,
            father_first_name: history?.father?.firstName,
            father_last_name: history?.father?.lastName,
            father_age: history?.father?.age,
            father_place_birth_house: history?.father?.placeOfBirth?.house,
            father_place_birth_city: history?.father?.placeOfBirth?.city,
            father_place_birth_district: history?.father?.placeOfBirth?.district,
            father_current_address_house: history?.father?.currentAddress?.house,
            father_current_address_city: history?.father?.currentAddress?.city,
            father_current_address_district: history?.father?.currentAddress?.district,
            mother_first_name: history?.mother?.firstName,
            mother_last_name: history?.mother?.lastName,
            mother_age: history?.mother?.age,
            mother_place_birth_house: history?.mother?.placeOfBirth?.house,
            mother_place_birth_city: history?.mother?.placeOfBirth?.city,
            mother_place_birth_district: history?.mother?.placeOfBirth?.district,
            mother_current_address_house: history?.mother?.currentAddress?.house,
            mother_current_address_city: history?.mother?.currentAddress?.city,
            mother_current_address_district: history?.mother?.currentAddress?.district,
            skill_level: history?.skillLevel || 0,
        };

        const { data: user, error } = await supabase
            .from('profiles')
            .insert([userData])
            .select()
            .single();

        if (error) {
            console.error('registerUser insert error:', error);
            throw error;
        }

        res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role,
            token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            ...user
        });

    } catch (error) {
        console.error('registerUser catch error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        let user;

        const isEmail = identifier.includes('@');

        if (isEmail) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', identifier)
                .single();
            
            user = data;
            if (error && error.code !== 'PGRST116') throw error;
        } else {
            const parts = identifier.trim().split(/\s+/).filter(part => part.length > 0);
            
            if (parts.length >= 1) {
                const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                let firstName, lastName;

                if (parts.length >= 3) {
                    firstName = escapeRegex(parts.slice(0, 2).join(' '));
                    lastName = escapeRegex(parts.slice(2).join(' '));
                } else if (parts.length === 2) {
                    firstName = escapeRegex(parts[0]);
                    lastName = escapeRegex(parts[1]);
                } else {
                    firstName = escapeRegex(parts[0]);
                    lastName = '';
                }

                if (lastName) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .ilike('first_name', `^${firstName}$`)
                        .ilike('last_name', `^${lastName}$`)
                        .single();
                    user = data;
                    if (error && error.code !== 'PGRST116') throw error;
                } else {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .ilike('first_name', `^${firstName}$`)
                        .single();
                    user = data;
                    if (error && error.code !== 'PGRST116') throw error;
                }
            }
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                role: user.role,
                token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                ...user
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('loginUser error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const approveUser = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .update({ approved: true })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'User has been approved.' });

    } catch (error) {
        console.error('approveUser error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const setUserPassword = async (req, res) => {
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password: hashedPassword })
            .eq('id', req.params.id);

        if (updateError) throw updateError;
        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('setUserPassword error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Please provide current password and a new password of at least 6 characters.' });
    }

    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password: hashedPassword })
            .eq('id', userId);

        if (updateError) throw updateError;
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, registerUser, loginUser, approveUser, setUserPassword, changeUserPassword };