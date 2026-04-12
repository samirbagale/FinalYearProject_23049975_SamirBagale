const mongoose = require('mongoose');
const User = require('../models/User');

const seedExtraDoctors = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mindcare');
        console.log('MongoDB connected');

        const doctors = [
            {
                _id: new mongoose.Types.ObjectId('67c199859f77f9859a0f1234'),
                username: 'Priya Sharma',
                email: 'priya@mindcare.com',
                password: 'password123',
                role: 'psychiatrist'
            },
            {
                _id: new mongoose.Types.ObjectId('67c199859f77f9859a0f1235'),
                username: 'Arjun Mehta',
                email: 'arjun@mindcare.com',
                password: 'password123',
                role: 'psychiatrist'
            }
        ];

        for (const doc of doctors) {
            const exists = await User.findOne({ email: doc.email });
            if (!exists) {
                await User.create(doc);
                console.log(`Created doctor: ${doc.username}`);
            } else {
                console.log(`Doctor ${doc.username} already exists`);
            }
        }

        console.log('Extra doctors seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedExtraDoctors();
