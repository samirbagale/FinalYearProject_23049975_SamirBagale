const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Follow = require('../models/Follow');
const Report = require('../models/Report');

// --- POSTS ---

// @desc    Get all posts (with filters)
// @route   GET /api/forum/posts
// @access  Private
exports.getPosts = async (req, res) => {
    try {
        const { topic, sort, limit = 20, cursor } = req.query;
        let query = {};

        if (topic && topic !== 'all') {
            query.topic = topic;
        }

        let posts = await CommunityPost.find(query)
            .populate('user', 'username _id') // Get author details
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Hide anonymous users in response
        const sanitizedPosts = posts.map(post => {
            const p = post.toObject();
            // Handle case where user might be deleted (populate returns null)
            if (!p.user) {
                p.user = { username: 'Deleted User', _id: null };
                return p;
            }

            if (p.isAnonymous && p.user._id.toString() !== req.user.id) {
                p.user = { username: 'Anonymous', _id: null };
            }
            return p;
        });

        res.status(200).json({ success: true, count: sanitizedPosts.length, data: sanitizedPosts });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create a new post
// @route   POST /api/forum/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const post = await CommunityPost.create(req.body);
        await post.populate('user', 'username');

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/forum/posts/:id
// @access  Private
exports.getPost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id).populate('user', 'username');

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        if (post.isAnonymous && post.user._id.toString() !== req.user.id) {
            post.user = { username: 'Anonymous', _id: null };
        }

        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete post (Owner or Admin)
// @route   DELETE /api/forum/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Check ownership or admin role
        if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await post.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// --- COMMENTS ---

// @desc    Get comments for a post
// @route   GET /api/forum/posts/:postId/comments
// @access  Private
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'username')
            .sort({ createdAt: 1 });

        const sanitized = comments.map(c => {
            const com = c.toObject();
            if (com.isAnonymous && com.user._id.toString() !== req.user.id) {
                com.user = { username: 'Anonymous', _id: null };
            }
            return com;
        });

        res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Add comment
// @route   POST /api/forum/posts/:postId/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        req.body.post = req.params.postId;
        req.body.user = req.user.id;

        const comment = await Comment.create(req.body);

        // Update post comment count
        await CommunityPost.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

        await comment.populate('user', 'username');

        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete comment
// @route   DELETE /api/forum/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
    try {
        const Comment = require('../models/Comment');
        const CommunityPost = require('../models/CommunityPost');
        
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
        
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        
        await comment.deleteOne();
        await CommunityPost.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// --- SOCIAL: LIKES ---

// @desc    Like a post
// @route   POST /api/forum/posts/:postId/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;

        // Check if already liked
        const existing = await Reaction.findOne({ user: userId, post: postId });

        if (existing) {
            // Unlike
            await existing.deleteOne();
            await CommunityPost.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
            return res.status(200).json({ success: true, data: { liked: false } });
        } else {
            // Like
            await Reaction.create({ user: userId, post: postId, type: 'like' });
            await CommunityPost.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
            return res.status(200).json({ success: true, data: { liked: true } });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
