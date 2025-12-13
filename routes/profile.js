const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Required for token check
const User = require('../models/User'); 

// @route   GET /api/profile/me
// @desc    Get current user's profile data (for the profile tab)
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id is set by the auth middleware
        const profile = await User.findById(req.user.id).select('-password -date');

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        // Returns { _id, name, email, bio, skills }
        res.json(profile); 
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).send('Server Error');
    }
});

// ... (You should also have the POST /api/profile route here, but focusing on GET)

module.exports = router;