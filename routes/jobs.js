const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/jobs
// @desc    Post a new job listing
// @access  Private (Requires JWT token)
router.post('/', authMiddleware, async (req, res) => {
    const { title, company, location, salary, description } = req.body;
    
    try {
        // req.user.id is attached by the authMiddleware
        const newJob = new Job({
            title,
            company,
            location,
            salary,
            description,
            posterId: req.user.id, 
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during job posting');
    }
});

// @route   GET /api/jobs/feed
// @desc    Get job listings that the user has NOT yet swiped on
// @access  Private
router.get('/feed', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all Job IDs the user has already interacted with
        const interactions = await Interaction.find({ userId: userId }).select('jobId');
        const interactedJobIds = interactions.map(interaction => interaction.jobId);
        
        // 2. Find jobs that are NOT in the interactedJobIds list
        // And ensure the user is not seeing their own posted jobs
        const jobs = await Job.find({
            _id: { $nin: interactedJobIds }, // Jobs not in the swiped list
            posterId: { $ne: userId } // Jobs not posted by the current user
        })
        .limit(20) // Limit the deck size for performance
        .sort({ createdAt: -1 }); // Show newest jobs first

        res.json(jobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching job feed');
    }
});

module.exports = router;