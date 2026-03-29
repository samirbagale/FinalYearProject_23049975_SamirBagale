const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: String,
        required: [true, 'Please add a mood type'],
        enum: [
            'happy',
            'sad',
            'anxious',
            'stressed',
            'neutral',
            'calm',
            'angry',
            'tired'
        ]
    },
    intensity: {
        type: Number,
        required: [true, 'Please add intensity'],
        min: 0,
        max: 10
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    activityTags: {
        type: [String],
        default: []
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index userId and timestamp for faster history queries
MoodEntrySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
