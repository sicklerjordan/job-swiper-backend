const mongoose = require('mongoose'); // <-- THIS IS THE MISSING LINE

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
    // Add other fields you may have used here (e.g., resume, skills, etc.)
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);