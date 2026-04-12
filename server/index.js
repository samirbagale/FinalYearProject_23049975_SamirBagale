require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Default Route
app.get('/', (req, res) => {
    res.send('Mind Care API is running successfully! 🚀');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/gratitude', require('./routes/gratitudeRoutes'));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindcare';

mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- Schemas & Models (Leaving Chat/Msg here for now as requested, but ideally move them too) ---
// Note: User model is now in models/User.js and used by authRoutes

const chatroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    topic: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
    chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom', required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage', default: null },
    createdAt: { type: Date, default: Date.now },
});

const Chatroom = mongoose.model('Chatroom', chatroomSchema);
const CommunityMessage = mongoose.model('CommunityMessage', messageSchema);

// --- Seeding Default Rooms ---
const seedChatrooms = async () => {
    try {
        const count = await Chatroom.countDocuments();
        if (count === 0) {
            const defaultRooms = [
                { name: 'Anxiety Support', topic: 'anxiety', description: 'A safe space to discuss anxiety and share coping strategies' },
                { name: 'Depression Support', topic: 'depression', description: 'Support group for those dealing with depression' },
                { name: 'Stress Management', topic: 'stress', description: 'Share tips and experiences about managing stress' },
                { name: 'Relationships', topic: 'relationships', description: 'Discuss relationship challenges and support' },
                { name: 'Self-Care Corner', topic: 'self-care', description: 'Share self-care ideas and encouragement' },
                { name: 'Grief & Loss', topic: 'grief', description: 'A compassionate space to process grief and find community.' },
                { name: 'Sleep Issues', topic: 'sleep', description: 'Talk about insomnia and healthy sleeping habits.' },
                { name: 'General Wellness', topic: 'wellness', description: 'General discussions on holistic health and well-being.' }
            ];
            await Chatroom.insertMany(defaultRooms);
            console.log('Default chatrooms seeded');
        }
    } catch (error) {
        console.error('Error seeding chatrooms:', error);
    }
};
seedChatrooms();

// --- API Routes for Chat (Community) ---
app.get('/api/community/stats', async (req, res) => {
    try {
        const User = require('./models/User');
        const totalUsers = await User.countDocuments();
        let onlineMembers = 0;
        const rooms = await Chatroom.find();
        rooms.forEach(room => {
            onlineMembers += io.sockets.adapter.rooms.get(room._id.toString())?.size || 0;
        });
        res.json({
            success: true,
            totalMembers: totalUsers,
            onlineMembers: onlineMembers,
            totalRooms: rooms.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch community stats' });
    }
});

app.get('/api/chatrooms', async (req, res) => {
    try {
        const rooms = await Chatroom.find().sort({ name: 1 });
        const roomsWithCount = rooms.map(room => {
            const roomSize = io.sockets.adapter.rooms.get(room._id.toString())?.size || 0;
            return { ...room.toObject(), memberCount: roomSize };
        });
        res.json(roomsWithCount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chatrooms' });
    }
});

const { protect: protectAny, authorize: authAny } = require('./middleware/auth');
app.post('/api/chatrooms', protectAny, authAny('admin'), async (req, res) => {
    try {
        const room = await Chatroom.create(req.body);
        res.json({ success: true, data: room });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.put('/api/chatrooms/:id', protectAny, authAny('admin'), async (req, res) => {
    try {
        const room = await Chatroom.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json({ success: true, data: room });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/chatrooms/:id', protectAny, authAny('admin'), async (req, res) => {
    try {
        await Chatroom.findByIdAndDelete(req.params.id);
        await CommunityMessage.deleteMany({ chatroomId: req.params.id });
        res.json({ success: true, data: {} });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/reports', protectAny, authAny('admin'), async (req, res) => {
    try {
        const Report = require('./models/Report');
        const reports = await Report.find().populate('reporter post comment').sort({createdAt: -1});
        res.json({ success: true, data: reports });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/reports', protectAny, async (req, res) => {
    try {
        const Report = require('./models/Report');
        req.body.reporter = req.user.id;
        const rep = await Report.create(req.body);
        res.json({ success: true, data: rep });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/chatrooms/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await CommunityMessage.find({ chatroomId: id })
            .populate('replyTo')
            .sort({ createdAt: 1 })
            .limit(100);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        // console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
    });

    socket.on('send_message', async (data) => {
        try {
            const { chatroomId, userId, username, message, replyTo } = data;
            const newMessage = new CommunityMessage({ chatroomId, userId, username, message, replyTo: replyTo || null });
            await newMessage.save();
            
            const populated = await CommunityMessage.findById(newMessage._id).populate('replyTo');
            io.to(chatroomId).emit('receive_message', populated);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    socket.on('delete_message', async (data) => {
        try {
            const { messageId, roomId } = data;
            await CommunityMessage.findByIdAndDelete(messageId);
            io.to(roomId).emit('message_deleted', messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    });

    socket.on("admin_delete_message", async ({ messageId, roomId }) => {
        try {
            await CommunityMessage.findByIdAndDelete(messageId);
            io.to(roomId).emit("message_deleted", messageId);
        } catch (e) { console.error(e); }
    });

    socket.on("admin_ban_user", async ({ userId, roomId }) => {
        try {
            const UserObj = mongoose.model('User');
            if (userId && userId !== 'anonymous') {
                await UserObj.findByIdAndUpdate(userId, { isRestricted: true });
            }
            io.to(roomId).emit("user_banned", userId);
        } catch (e) { console.error(e); }
    });

    // --- WebRTC Signaling with Room Tracking ---

    // Track active rooms: Map<roomId, { users: { socketId, username }[], createdAt: Date }>
    // We'll store it outside the connection scope in a real app, but for this single-file server, 
    // we need to be careful about where 'activeVideoRooms' is defined. 
    // Since 'io.on' is a closure, we should define the Map outside or attach it to 'io'.
    // For simplicity here, I will assume activeVideoRooms is defined at the top level or I will attach it to io.
    if (!io.activeVideoRooms) {
        io.activeVideoRooms = new Map();
    }

    const broadcastVideoRooms = () => {
        const rooms = Array.from(io.activeVideoRooms.entries());
        io.emit('video-rooms-update', rooms);
    };

    socket.on('video-get-rooms', () => {
        const rooms = Array.from(io.activeVideoRooms.entries());
        socket.emit('video-rooms-update', rooms);
    });

    socket.on("video-join-room", ({ roomId, username }) => {
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (clients && clients.size >= 2) {
            socket.emit("room-full");
            return;
        }

        socket.join(roomId);

        // Track room
        if (!io.activeVideoRooms.has(roomId)) {
            io.activeVideoRooms.set(roomId, { users: [], createdAt: new Date() });
        }
        const room = io.activeVideoRooms.get(roomId);
        room.users.push({ socketId: socket.id, username: username || 'Anonymous' });

        broadcastVideoRooms();
 
        socket.to(roomId).emit("user-joined", { id: socket.id, name: username });
    });

    socket.on("offer", ({ offer, to }) => {
        io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
        io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
        io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Cleanup video rooms
        if (io.activeVideoRooms) {
            let changed = false;
            io.activeVideoRooms.forEach((room, roomId) => {
                const index = room.users.findIndex(u => u.socketId === socket.id);
                if (index !== -1) {
                    room.users.splice(index, 1);
                    changed = true;
                    // If room empty, remove it
                    if (room.users.length === 0) {
                        io.activeVideoRooms.delete(roomId);
                    }
                }
            });

            if (changed) {
                broadcastVideoRooms();
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
