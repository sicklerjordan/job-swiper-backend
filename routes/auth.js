const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // Mongoose Model for User data

// @route   GET /api/profile/me
// @desc    Get current user's profile data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // Find the user by ID (req.user.id is set by the auth middleware)
        // Select all fields EXCEPT password and date.
        const profile = await User.findById(req.user.id).select('-password -date');

        if (!profile) {
            console.error(`Profile not found for user ID: ${req.user.id}`);
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        // Log the specific error to the console for debugging
        console.error('Error fetching profile in /api/profile/me:', err.message);
        res.status(500).send('Server Error fetching profile.');
    }
});

// @route   POST /api/profile
// @desc    Update user profile (bio and skills)
// @access  Private
router.post('/', auth, async (req, res) => {
    // Destructure profile fields from request body
    const { bio, skills } = req.body;

    // Build the profile fields object
    const profileFields = {};
    if (bio) profileFields.bio = bio;
    
    // Process skills: convert comma-separated string to array
    if (skills) {
        profileFields.skills = Array.isArray(skills) 
            ? skills 
            : skills.split(',').map(skill => skill.trim()).filter(s => s);
    }
    
    try {
        // 1. Check if user exists
        let user = await User.findById(req.user.id);

        if (user) {
            // 2. Update the existing user document with new profile data
            user = await User.findOneAndUpdate(
                { _id: req.user.id },
                { $set: profileFields },
                { new: true } // Return the updated document
            ).select('-password');
            
            return res.json(user);
        }
        
        // This case should not be hit if auth works, but serves as a safeguard
        res.status(400).json({ msg: 'User not found for update.' });

    } catch (err) {
        console.error('Error updating profile in /api/profile:', err.message);
        res.status(500).send('Server Error updating profile.');
    }
});

// CRITICAL: Export the router instance so Express (server.js) can use it
module.exports = router;