const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 1499
    },
    currency: {
        type: String,
        default: 'NPR'
    },
    gateway: {
        type: String,
        required: true,
        enum: ['esewa', 'khalti', 'ime', 'connectips', 'card', 'simulated']
    },
    mobileNumber: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    refId: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
