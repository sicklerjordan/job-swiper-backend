const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Stored as a hash
    name: { type: String, required: true },
    headline: String,
    profilePicture: String,
    location: String,
    skills: [String],
});

module.exports = mongoose.model('User', UserSchema);