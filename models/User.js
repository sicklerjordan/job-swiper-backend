// job-app-backend/models/User.js

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
    // --- ADD THESE FIELDS IF YOU WANT THEM SENT TO THE POSTER ---
    // Example fields for a profile that is sent upon 'accept'
    // resume: { type: String, default: null }, 
    // skills: [{ type: String }],
    // -----------------------------------------------------------
    date: {
        type: Date,
        default: Date.now
    }
});