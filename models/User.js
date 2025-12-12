const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // --- PROFILE FIELDS (These are the "resume" contents) ---
    bio: {
        type: String,
        default: 'Tell us a little about your professional background and goals!'
    },
    skills: {
        type: [String], // Array of strings (e.g., ['React', 'Node.js', 'MongoDB'])
        default: []
    },
    // REMOVED: resumeUrl
    // --- END PROFILE FIELDS ---
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);