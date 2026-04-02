const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc      Get all transactions
// @route     GET /api/admin/transactions
// @access    Private/Admin
exports.getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find().populate('user', 'username email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get admin dashboard stats
// @route     GET /api/admin/stats
// @access    Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();

        // Mock data for other stats since we might not have all models connected yet
        // In a real app, you would count documents from other collections
        const totalMoodEntries = 120; // Replace with MoodEntry.countDocuments()
        const activeSessions = 5;
        const totalReports = 0;

        res.status(200).json({
            success: true,
            data: {
                users: totalUsers,
                moodEntries: totalMoodEntries,
                sessions: activeSessions,
                reports: totalReports
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get all users
// @route     GET /api/admin/users
// @access    Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Delete user
// @route     DELETE /api/admin/users/:id
// @access    Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Prevent deleting yourself (optional but good practice)
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, error: 'You cannot delete yourself' });
        }

        await user.deleteOne();
 
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Toggle user restriction
// @route     PUT /api/admin/users/:id/restrict
// @access    Private/Admin
exports.restrictUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Prevent restricting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, error: 'You cannot restrict yourself' });
        }

        user.isRestricted = !user.isRestricted;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Update psychiatrist profile
// @route     PUT /api/admin/psychiatrists/:id
// @access    Private/Admin
exports.updatePsychiatrist = async (req, res, next) => {
    try {
        const psychiatrist = await User.findById(req.params.id);

        if (!psychiatrist || psychiatrist.role !== 'psychiatrist') {
            return res.status(404).json({ success: false, error: 'Psychiatrist not found' });
        }

        // Update fields
        const fieldsToUpdate = [
            'username', 'email', 'password', 'credentials', 'experience', 'bio', 
            'specialties', 'languages', 'quote', 'approaches', 
            'education', 'helps', 'stats', 'profilePhoto', 'gradient'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== '') {
                psychiatrist[field] = req.body[field];
            }
        });

        await psychiatrist.save();

        res.status(200).json({ success: true, data: psychiatrist });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc      Create psychiatrist
// @route     POST /api/admin/psychiatrists
// @access    Private/Admin
exports.createPsychiatrist = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email) {
            return res.status(400).json({ success: false, error: 'Full Name and Email are required' });
        }

        const psychiatrist = new User({
            username,
            email,
            password: password || 'Doc12345!', 
            role: 'psychiatrist'
        });

        const fieldsToUpdate = [
            'credentials', 'experience', 'bio', 
            'specialties', 'languages', 'quote', 'approaches', 
            'education', 'helps', 'stats', 'profilePhoto', 'gradient'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                psychiatrist[field] = req.body[field];
            }
        });

        await psychiatrist.save();
        res.status(201).json({ success: true, data: psychiatrist });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
