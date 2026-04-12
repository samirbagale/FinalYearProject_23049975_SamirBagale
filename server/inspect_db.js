const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mindcare');
        console.log('Connected to MongoDB');

        const messages = await Message.find().populate('sender recipient');
        console.log(`Found ${messages.length} messages:`);
        messages.forEach(m => {
            console.log(`From: ${m.sender?.username || 'Unknown'} (${m.sender?._id || 'None'}) To: ${m.recipient?.username || 'Unknown'} (${m.recipient?._id || 'None'}) | Content: ${m.content}`);
        });

        const users = await User.find();
        console.log('\nUsers:');
        users.forEach(u => {
            console.log(`Name: ${u.username} | Role: ${u.role} | ID: ${u._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
