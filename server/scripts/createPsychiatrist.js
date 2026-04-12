const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' }); // Adjust path as script is in server/scripts

const createPsychiatrist = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindcare');
        console.log('MongoDB connected');

        const email = 'doctor@mindcare.com';
        const password = 'docpassword123';
        const username = 'Doctor';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Psychiatrist already exists');
            user.role = 'psychiatrist'; // Ensure role is correct
            await user.save();
            console.log(`Psychiatrist ID: ${user._id}`);
        } else {
            user = await User.create({
                username,
                email,
                password,
                role: 'psychiatrist'
            });
            console.log('Psychiatrist created');
            console.log(`Psychiatrist ID: ${user._id}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createPsychiatrist();
