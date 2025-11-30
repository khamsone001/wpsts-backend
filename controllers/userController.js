const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// @desc    Get all users
// @route   GET /api/users
// @access  Public (for now)
const getUsers = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find({});

        // Sort by class (M first, then N), then by workAge descending
        users.sort((a, b) => {
            const classA = a.personalInfo?.class || '';
            const classB = b.personalInfo?.class || '';
            const workAgeA = a.history?.workAge || 0;
            const workAgeB = b.history?.workAge || 0;

            // If classes are different, M comes before N
            if (classA !== classB) {
                if (classA === 'M') return -1;
                if (classB === 'M') return 1;
            }

            // If same class, sort by workAge descending
            return workAgeB - workAgeA;
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (for now)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (to be implemented)
const updateUser = async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Permission Check:
        // 1. A super_admin can update anyone.
        // 2. A regular user can only update their own profile.
        if (req.user.role !== 'super_admin' && req.user._id.toString() !== userToUpdate._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true,
        }).select('-password'); // Exclude password from the response

        res.json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin only)
const deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Rule 1: A user cannot delete themselves.
        if (req.user._id.toString() === userToDelete._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }

        // Rule 2 & 3: Hierarchical deletion for super_admins
        if (userToDelete.role === 'super_admin') {
            // Find the very first super_admin (Genesis Admin)
            const genesisAdmin = await User.findOne({ role: 'super_admin' }).sort({ createdAt: 'asc' });

            if (!genesisAdmin) {
                return res.status(500).json({ message: 'System error: Cannot identify the primary super admin.' });
            }

            // If the user trying to delete is NOT the genesis admin, they cannot delete another super admin.
            if (req.user._id.toString() !== genesisAdmin._id.toString()) {
                return res.status(403).json({ message: 'Only the first super admin can delete other super admins.' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password, personalInfo, history, photoURL } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if this is the first user, if so, make them a super_admin
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'super_admin' : 'user';
        const isApproved = userCount === 0; // First user is approved by default

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            isApproved,
            personalInfo,
            history,
            photoURL,
            // Add logic for role if needed, e.g., first user is super_admin
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            ...user.toObject()
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { identifier, password } = req.body; // Changed email to identifier

    try {
        let user;

        // Check if identifier looks like an email
        const isEmail = identifier.includes('@');

        if (isEmail) {
            user = await User.findOne({ email: identifier });
        } else {
            // Assume it's "FirstName LastName" or "FirstName MiddleName LastName"
            // Trim and split by whitespace, filter out empty strings
            const parts = identifier.trim().split(/\s+/).filter(part => part.length > 0);

            if (parts.length >= 1) {
                // Helper function to escape special regex characters
                const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                let firstName, lastName;

                if (parts.length >= 3) {
                    // 3 or more words: first 2 words = firstName, rest = lastName
                    // Example: "แสง อาทิตย์ บุญยงค์" -> firstName: "แสง อาทิตย์", lastName: "บุญยงค์"
                    firstName = escapeRegex(parts.slice(0, 2).join(' '));
                    lastName = escapeRegex(parts.slice(2).join(' '));
                } else if (parts.length === 2) {
                    // 2 words: normal case
                    // Example: "สมพร จันทวงศ์" -> firstName: "สมพร", lastName: "จันทวงศ์"
                    firstName = escapeRegex(parts[0]);
                    lastName = escapeRegex(parts[1]);
                } else {
                    // 1 word: only firstName
                    firstName = escapeRegex(parts[0]);
                    lastName = '';
                }

                // Search case-insensitive
                if (lastName) {
                    user = await User.findOne({
                        'personalInfo.firstName': { $regex: new RegExp(`^${firstName}$`, 'i') },
                        'personalInfo.lastName': { $regex: new RegExp(`^${lastName}$`, 'i') }
                    });
                } else {
                    // Only first name provided
                    user = await User.findOne({
                        'personalInfo.firstName': { $regex: new RegExp(`^${firstName}$`, 'i') }
                    });
                }
            }
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                // Send back the full user profile
                ...user.toObject()
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ message: 'User has been approved.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const setUserPassword = async (req, res) => {
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Get user from protect middleware

    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Please provide current password and a new password of at least 6 characters.' });
    }

    try {
        const user = await User.findById(userId);

        // Add a check to ensure user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, registerUser, loginUser, approveUser, setUserPassword, changeUserPassword };
