const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { recipientId, content, replyTo } = req.body;

        if (!recipientId || !content) {
            return res.status(400).json({ success: false, error: 'Recipient and content are required' });
        }

        const message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content,
            replyTo: replyTo || null
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get list of conversations (users the logged in user has messaged with)
// @route   GET /api/messages/list/conversations
// @access  Private
router.get('/list/conversations', protect, async (req, res) => {
    try {
        const currentUserId = req.user._id.toString();
        
        // Find unique users the current user has interacted with
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { recipient: req.user._id }]
        }).sort({ createdAt: -1 });

        const userIds = new Set();
        const latestMessages = {};

        messages.forEach(m => {
            const senderId = m.sender.toString();
            const recipientId = m.recipient.toString();
            
            // Determine the "other" person's ID (the person who is not me)
            const otherId = senderId === currentUserId ? recipientId : senderId;
            
            // ONLY add if it's a DIFFERENT person and not already added
            if (otherId !== currentUserId && !userIds.has(otherId)) {
                userIds.add(otherId);
                latestMessages[otherId] = m;
            }
        });

        const conversationUsers = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('username email role');

        const result = conversationUsers.map(u => ({
            user: u,
            latestMessage: latestMessages[u._id.toString()]
        }));

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Get messages between logged in user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private
router.get('/:otherUserId', protect, async (req, res) => {
    try {
        console.log(`[Messages] Fetching history for Me:${req.user.username} (${req.user.id}) with Other:${req.params.otherUserId}`);
        
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: req.params.otherUserId },
                { sender: req.params.otherUserId, recipient: req.user.id }
            ]
        })
        .populate('replyTo', 'content sender')
        .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, error: 'Message not found' });
        
        // Only allow sender to delete? Or both? In a chat, usually it's "delete for me" or "delete for all".
        // Let's just allow deletion.
        await message.deleteOne();
        
        res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Clear chat with a person
// @route   DELETE /api/messages/clear/:otherUserId
// @access  Private
router.delete('/clear/:otherUserId', protect, async (req, res) => {
    try {
        await Message.deleteMany({
            $or: [
                { sender: req.user.id, recipient: req.params.otherUserId },
                { sender: req.params.otherUserId, recipient: req.user.id }
            ]
        });
        res.status(200).json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
