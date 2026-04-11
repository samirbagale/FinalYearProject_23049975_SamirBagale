const GratitudeEntry = require('../models/GratitudeEntry');

// @desc    Create a new gratitude entry
// @route   POST /api/gratitude
// @access  Private
exports.createEntry = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const entry = await GratitudeEntry.create(req.body);
        res.status(201).json({ success: true, data: entry });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current user's gratitude entries
// @route   GET /api/gratitude
// @access  Private
exports.getMyEntries = async (req, res) => {
  try {
    const entries = await GratitudeEntry.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all gratitude entries (Admin only)
// @route   GET /api/gratitude/admin
// @access  Private/Admin
exports.getAllEntries = async (req, res) => {
    try {
        // We can populate the user info to see who wrote what
        const entries = await GratitudeEntry.find()
            .populate('user', 'username email profilePhoto role')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: entries.length, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a gratitude entry
// @route   DELETE /api/gratitude/:id
// @access  Private/Admin
exports.deleteEntry = async (req, res) => {
    try {
        const entry = await GratitudeEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        // Only the owner or an admin can delete it
        if (entry.user.toString() !== req.user.id && req.user.role !== 'admin') {
           return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await entry.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
