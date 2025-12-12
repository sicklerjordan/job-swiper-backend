const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/interactions/swipe
// @desc    Record a swipe action (left/right/top)
// @access  Private
router.post('/swipe', authMiddleware, async (req, res) => {
    const { jobId, direction } = req.body;
    const userId = req.user.id;

    if (!jobId || !['left', 'right', 'top'].includes(direction)) {
        return res.status(400).json({ msg: 'Invalid interaction data' });
    }

    try {
        // 1. Check if this interaction already exists (to prevent duplicates)
        let interaction = await Interaction.findOne({ userId, jobId });

        if (interaction) {
            // Update the existing interaction if it somehow got recorded twice
            interaction.direction = direction;
            await interaction.save();
            return res.json({ msg: 'Interaction updated', match: false });
        }

        // 2. Create the new interaction record
        interaction = new Interaction({
            userId,
            jobId,
            direction
        });

        await interaction.save();

        let isMatch = false;

        if (direction === 'right' || direction === 'top') {
            // For a job app, a 'match' is confirmed when the user likes the job. 
            // The recruiter (job poster) is notified separately.
            // For this architecture, we treat a 'right' swipe as a confirmed interest.
            isMatch = true; 
        }

        res.json({ 
            msg: `Swipe recorded: ${direction}`,
            match: isMatch 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error recording swipe');
    }
});

// @route   GET /api/interactions/matches
// @desc    Get all jobs the user has swiped right on
// @access  Private
router.get('/matches', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all 'right' and 'top' swipes
        const matches = await Interaction.find({
            userId,
            direction: { $in: ['right', 'top'] }
        })
        // Populate the full Job data from the Job model using the jobId reference
        .populate('jobId'); 

        // Return only the job information
        res.json(matches.map(m => m.jobId)); 

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching matches');
    }
});

module.exports = router;