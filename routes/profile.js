const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); 

// @route   GET /api/profile/me
// @desc    Get current user's profile data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id MUST be set by the auth middleware
        const profile = await User.findById(req.user.id).select('-password -date');

        if (!profile) {
            console.error(`Profile not found for user ID: ${req.user.id}`);
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile in /api/profile/me:', err.message);
        res.status(500).send('Server Error fetching profile.');
    }
});

// ... (rest of the profile.js file for POST /api/profile)