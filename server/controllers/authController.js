const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWT
const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_dont_use_prod', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Create user
        const user = await User.create({
            username,
            email,
            password
        });

        const token = getSignedJwtToken(user._id);

        res.status(200).json({ success: true, token, user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
    try {
        const { emailOrUsername, password } = req.body;

        // Validate email & password
        if (!emailOrUsername || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email/username and password' });
        }

        // Check for user by email OR username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        }).select('+password');

        if (!user) {
            console.log(`Login failed: User not found for input: ${emailOrUsername}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log(`Login failed: Incorrect password for user: ${user.username}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if user is restricted
        if (user.isRestricted) {
            console.log(`Login failed: Account restricted for user: ${user.username}`);
            return res.status(403).json({ success: false, error: 'account has been restricted' });
        }

        const token = getSignedJwtToken(user._id);

        // Return explicit user object so role is always included
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            createdAt: user.createdAt
        };

        console.log(`Login success: ${user.username} | role: ${user.role}`);

        res.status(200).json({ success: true, token, user: userResponse });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc      Get all psychiatrists
// @route     GET /api/auth/psychiatrists
// @access    Public
exports.getPsychiatrists = async (req, res, next) => {
    try {
        const psychiatrists = await User.find({ role: 'psychiatrist' }).select('-password');
        res.status(200).json({ success: true, data: psychiatrists });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};