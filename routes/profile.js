const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile/me
// @desc    Get current user's profile data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // Find the user by ID and select all necessary profile fields
        const profile = await User.findById(req.user.id).select('-password -date');

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching profile.');
    }
});

// @route   POST /api/profile
// @desc    Update user profile (bio and skills)
// @access  Private
router.post('/', auth, async (req, res) => {
    // Destructure only the remaining profile fields from request body
    const { bio, skills } = req.body;

    // Build the profile fields object
    const profileFields = {};
    if (bio) profileFields.bio = bio;
    
    // Skills processing logic remains the same
    if (skills) {
        profileFields.skills = Array.isArray(skills) 
            ? skills 
            : skills.split(',').map(skill => skill.trim());
    }
    
    try {
        let user = await User.findById(req.user.id);

        if (user) {
            // Update the existing user document with new profile data
            user = await User.findOneAndUpdate(
                { _id: req.user.id },
                { $set: profileFields },
                { new: true } 
            ).select('-password');
            
            return res.json(user);
        }
        
        res.status(400).json({ msg: 'User not found for update.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error updating profile.');
    }
});

module.exports = router;