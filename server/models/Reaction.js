const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
    user: {
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
    type: {
        type: String,
        enum: ['like'],
        default: 'like'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate likes
ReactionSchema.index({ user: 1, post: 1 }, { unique: true, partialFilterExpression: { post: { $exists: true } } });
ReactionSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $exists: true } } });

module.exports = mongoose.model('Reaction', ReactionSchema);
