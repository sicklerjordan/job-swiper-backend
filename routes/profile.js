const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // <-- CRITICAL: Must be imported

// @route   GET /api/profile/me
// @desc    Get current user's profile data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // Find the user by ID (req.user.id is set by the auth middleware)
        // Select all fields EXCEPT password and date.
        const profile = await User.findById(req.user.id).select('-password -date');

        if (!profile) {
            // Log an error if the token is valid but the user ID doesn't exist
            console.error(`Profile not found for user ID: ${req.user.id}`);
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        // Log the specific error to the console for debugging
        console.error('Error fetching profile in /api/profile/me:', err.message);
        
        // If the error is related to Mongoose or the token, it will be caught here.
        res.status(500).send('Server Error fetching profile.');
    }
});

// @route   POST /api/profile
// @desc    Update user profile (bio and skills)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { bio, skills } = req.body;

    const profileFields = {};
    if (bio) profileFields.bio = bio;
    
    if (skills) {
        profileFields.skills = Array.isArray(skills) 
            ? skills 
            : skills.split(',').map(skill => skill.trim()).filter(s => s);
    }
    
    try {
        let user = await User.findById(req.user.id);

        if (user) {
            user = await User.findOneAndUpdate(
                { _id: req.user.id },
                { $set: profileFields },
                { new: true } 
            ).select('-password');
            
            return res.json(user);
        }
        
        res.status(400).json({ msg: 'User not found for update.' });

    } catch (err) {
        console.error('Error updating profile in /api/profile:', err.message);
        res.status(500).send('Server Error updating profile.');
    }
});

module.exports = router;