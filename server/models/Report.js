const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'CommunityPost'
    },
    comment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    },
    reason: {
        type: String,
        enum: ['spam', 'abuse', 'harmful', 'inappropriate', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);
