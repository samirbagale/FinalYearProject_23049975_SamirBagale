const MoodEntry = require('../models/MoodEntry');

// @desc      Get all mood entries for logged in user
// @route     GET /api/moods
// @access    Private
exports.getMoods = async (req, res, next) => {
    try {
        const moods = await MoodEntry.find({ user: req.user.id })
            .sort({ timestamp: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: moods.length,
            data: moods
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc      Create new mood entry
// @route     POST /api/moods
// @access    Private
exports.createMood = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        const mood = await MoodEntry.create(req.body);

        res.status(201).json({
            success: true,
            data: mood
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc      Delete mood entry
// @route     DELETE /api/moods/:id
// @access    Private
exports.deleteMood = async (req, res, next) => {
    try {
        const mood = await MoodEntry.findById(req.params.id);

        if (!mood) {
            return res.status(404).json({ success: false, error: 'Mood entry not found' });
        }

        // Make sure user owns the mood entry
        if (mood.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this entry' });
        }

        await mood.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
