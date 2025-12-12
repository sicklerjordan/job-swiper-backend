const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    // The ID of the job that was accepted
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    // The ID of the user who accepted (the candidate)
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The full profile details of the candidate at the time of acceptance
    candidateProfile: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        // Add other fields you want the job poster to see
        // e.g., resumeUrl: { type: String }
    },
    dateMatched: {
        type: Date,
        default: Date.now
    }
});

// A job can only be matched with a single candidate once
MatchSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);