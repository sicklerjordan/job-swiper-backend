const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interaction = require('../models/Interaction');

// @route   POST /api/interactions
// @desc    Log a user's swipe (accept or reject) on a job
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { jobId, interaction } = req.body;
        const userId = req.user.id; // From the auth middleware

        // 1. Validation (Optional but recommended)
        if (!['accept', 'reject'].includes(interaction)) {
            return res.status(400).json({ msg: 'Invalid interaction type.' });
        }

        // 2. Check if the user has already interacted with this job
        let existingInteraction = await Interaction.findOne({ userId, jobId });

        if (existingInteraction) {
            return res.status(400).json({ msg: 'Interaction already recorded for this job.' });
        }

        // 3. Create and Save New Interaction
        const newInteraction = new Interaction({
            userId,
            jobId,
            interaction,
            timestamp: new Date()
        });

        const result = await newInteraction.save();
        res.status(201).json(result); // Use 201 for resource created

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error logging interaction.');
    }
});

// @route   GET /api/interactions/accepted (for the user's "Applied Jobs" list)
// @desc    Get all jobs the user has accepted
// @access  Private
router.get('/accepted', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // This is primarily done in the jobs.js route, but can be a dedicated route as well.
        const acceptedInteractions = await Interaction.find({
            userId: userId,
            interaction: 'accept'
        }).select('jobId');

        res.json(acceptedInteractions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching accepted interactions.');
    }
});


module.exports = router;