const mongoose = require('mongoose');

const GratitudeEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    q1: {
        type: String,
        required: [true, 'Please add a win'],
        maxlength: [500, 'Entry cannot be more than 500 characters']
    },
    q2: {
        type: String,
        required: [true, 'Please add a person'],
        maxlength: [500, 'Entry cannot be more than 500 characters']
    },
    q3: {
        type: String,
        required: [true, 'Please add a quality'],
        maxlength: [500, 'Entry cannot be more than 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GratitudeEntry', GratitudeEntrySchema);
