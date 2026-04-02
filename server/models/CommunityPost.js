const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add some content'],
        maxlength: [2000, 'Post cannot be more than 2000 characters']
    },
    topic: {
        type: String,
        enum: ['anxiety', 'depression', 'stress', 'relationships', 'grief', 'trauma', 'self-care', 'motivation', 'sleep', 'general'],
        default: 'general'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    isReported: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

CommunityPostSchema.index({ topic: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
