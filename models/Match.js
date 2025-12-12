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
    // The profile details of the candidate stored upon 'accept'
    candidateProfile: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        // --- FIELDS REMAINING ---
        bio: { type: String },
        skills: { type: [String] }
        // REMOVED: resumeUrl
        // --- END FIELDS ---
    },
    dateMatched: {
        type: Date,
        default: Date.now
    }
});

// Ensures a user can only interact with a specific job once
MatchSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);