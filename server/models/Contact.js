const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Contact', contactSchema);
