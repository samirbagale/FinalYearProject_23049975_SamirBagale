const mongoose = require('mongoose');
const Message = require('./models/Message');

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mindcare');
        const samirId = '6988416db8c42afccae2c3d5';
        const aishaId = '698770d03312246b6db67351';
        
        const msgs = await Message.find({
            $or: [
                { sender: samirId, recipient: aishaId },
                { sender: aishaId, recipient: samirId }
            ]
        });
        
        console.log(`Found ${msgs.length} messages between Samir and Aisha:`);
        msgs.forEach(m => {
            console.log(`[${m.createdAt.toISOString()}] From ${m.sender} To ${m.recipient}: ${m.content}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
