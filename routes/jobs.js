const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');
const Match = require('../models/Match'); // <-- Ensure this model exists and is imported

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

        // NOTE: If you need to debug and see all jobs, change 'filter' to '{}'
        let jobs = await Job.find(filter).sort({ createdAt: -1 }); // Sort by newest first

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


// @route   GET /api/jobs/matches/:jobId
// @desc    Get a list of candidates (Matches) who swiped right on a specific job
// @access  Private (Only accessible by the original job poster)
router.get('/matches/:jobId', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { jobId } = req.params;

        // 1. Verify the current user is the original poster of the job
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // IMPORTANT SECURITY CHECK: Ensure the user requesting the data owns the job
        if (job.posterId.toString() !== userId) {
            return res.status(401).json({ msg: 'Not authorized to view matches for this job' });
        }

        // 2. Fetch all candidates (Match records) for this specific jobId
        const candidates = await Match.find({ jobId: jobId });
        
        // The candidates array contains the candidateProfile embedded in the Match model.
        res.json(candidates);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching job matches.');
    }
});


module.exports = router;