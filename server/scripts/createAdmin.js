const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Load .env from server/ directory. This is why we need path.

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindcare';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');

        const adminUser = {
            username: 'admin',
            email: 'admin@mindcare.com',
            password: 'adminpassword123',
            role: 'admin'
        };

        // Check if admin already exists
        let user = await User.findOne({ email: adminUser.email });

        if (user) {
            console.log('Admin user already exists.');
            // Update role just in case
            user.role = 'admin';
            await user.save();
            console.log('User role updated to admin');
        } else {
            user = await User.create(adminUser);
            console.log('Admin user created successfully');
        }

        console.log('Use these credentials to login:');
        console.log('Email:', adminUser.email);
        console.log('Password:', adminUser.password);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        mongoose.connection.close();
    }
};

createAdmin();
