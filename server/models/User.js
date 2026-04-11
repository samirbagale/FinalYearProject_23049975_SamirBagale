const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: 3
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'psychiatrist'],
        default: 'user'
    },
    isRestricted: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Don't return password by default
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    // Psychiatrist Profile Fields
    credentials: { type: String },
    experience: { type: Number }, // in years
    rating: { type: Number, default: 4.8 },
    sessions: { type: Number, default: 100 },
    languages: { type: String, default: 'English, Nepali' },
    specialties: [{ type: String }],
    bio: { type: String },
    quote: { type: String },
    approaches: [{ type: String }],
    education: [{ 
        degree: String,
        institute: String
    }],
    helps: [{ type: String }],
    stats: [{
        value: String,
        label: String
    }],
    profilePhoto: { type: String },
    gradient: { type: String, default: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
    createdAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
