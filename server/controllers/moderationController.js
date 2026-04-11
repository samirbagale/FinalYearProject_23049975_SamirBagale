const Report = require('../models/Report');

// @desc    Create a new report
// @route   POST /api/moderation/report
// @access  Private
exports.createReport = async (req, res) => {
    try {
        const { targetId, targetType, reason } = req.body;

        const reportData = {
            reporter: req.user.id,
            reason,
            post: targetType === 'post' ? targetId : undefined,
            comment: targetType === 'comment' ? targetId : undefined,
        };

        const report = await Report.create(reportData);

        res.status(201).json({ success: true, message: 'Content reported successfully', data: report });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/moderation/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
    try {
        // Check for admin role (assuming user.role exists, or just protect route via middleware)
        // For now, simple fetch
        const reports = await Report.find()
            .populate('reporter', 'username')
            .populate('post', 'content')
            .populate('comment', 'content')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
