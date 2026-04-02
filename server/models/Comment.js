const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: [1000, 'Comment too long']
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    likesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

CommentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
