const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Requires JWT token)
router.post('/', auth, async (req, res) => {
    try {
        const { title, company, location, salary, description } = req.body;

        const newJob = new Job({
            posterId: req.user.id, // User ID comes from the JWT token via auth middleware
            title,
            company,
            location,
            salary,
            description
        });

        const job = await newJob.save();
        res.json(job);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error creating job.');
    }
});


// @route   GET /api/jobs/feed
// @desc    Get a feed of jobs to swipe on (excluding own jobs and already interacted jobs)
// @access  Private
router.get('/feed', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all Job IDs the current user has already interacted with
        const interactedJobs = await Interaction.find({ userId: userId }).select('jobId');

        // Extract just the IDs into an array
        const interactedJobIds = interactedJobs.map(interaction => interaction.jobId);

        // 2. Build the MongoDB query filter
        const filter = {
            // Exclude jobs posted by the current user
            posterId: { $ne: userId }, 
            
            // Exclude jobs the user has already interacted with (in the array of IDs)
            _id: { $nin: interactedJobIds } 
        };

        // 3. Fetch the jobs based on the filter
        let jobs = await Job.find(filter).sort({ createdAt: -1 }); // Sort by newest first

        // NOTE: For testing purposes, if you want to see ALL jobs (including your own),
        // temporarily change the filter line above to: let jobs = await Job.find({});

        res.json(jobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching job feed.');
    }
});


// @route   GET /api/jobs/accepted
// @desc    Get a list of jobs the user has accepted/applied for
// @access  Private
router.get('/accepted', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all 'accept' interactions by the user
        const acceptedInteractions = await Interaction.find({
            userId: userId,
            interaction: 'accept'
        }).select('jobId');

        // Extract the job IDs
        const acceptedJobIds = acceptedInteractions.map(i => i.jobId);

        // Find the actual Job documents matching those IDs
        const acceptedJobs = await Job.find({ 
            _id: { $in: acceptedJobIds } 
        });

        res.json(acceptedJobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching accepted jobs.');
    }
});


module.exports = router;