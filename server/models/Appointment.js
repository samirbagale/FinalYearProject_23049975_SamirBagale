const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    psychiatrist: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    time: {
        type: String,
        required: [true, 'Please add a time']
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    roomId: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for efficient querying
AppointmentSchema.index({ psychiatrist: 1, date: 1 });
AppointmentSchema.index({ patient: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
