const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    // Reference to the User who performed the swipe
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the Job that was swiped on
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    // The type of interaction ('accept' or 'reject')
    interaction: {
        type: String,
        enum: ['accept', 'reject'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Ensures a user can only interact with a specific job once
InteractionSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', InteractionSchema);