const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');
const Match = require('../models/Match'); // Assuming Match is used here

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, company, location, salary, description } = req.body;

        const newJob = new Job({
            posterId: req.user.id, 
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
// @desc    Get a feed of jobs to swipe on (EXCLUDING interacted and user's own jobs)
// @access  Private
router.get('/feed', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all Job IDs the current user has already interacted with
        const interactedJobs = await Interaction.find({ userId: userId }).select('jobId');
        const interactedJobIds = interactedJobs.map(interaction => interaction.jobId);

        // 2. Build the MongoDB query filter
        const filter = {
            // !!! TESTING BYPASS IS ACTIVE HERE !!!
            // We are deliberately commenting out the filter that prevents you from seeing your own job
            // posterId: { $ne: userId }, 
            
            // Exclude jobs the user has already interacted with
            _id: { $nin: interactedJobIds } 
        };

        let jobs = await Job.find(filter).sort({ createdAt: -1 });

        res.json(jobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching job feed.');
    }
});


// @route   GET /api/jobs/mypostings  <-- NEW ROUTE
// @desc    Get all jobs posted by the currently logged-in user (Job Poster)
// @access  Private
router.get('/mypostings', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all jobs where the posterId matches the current user's ID
        const myJobs = await Job.find({ posterId: userId }).sort({ createdAt: -1 });

        res.json(myJobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching user postings.');
    }
});


// @route   GET /api/jobs/accepted
// @desc    Get a list of jobs the user has accepted/applied for
// @access  Private
router.get('/accepted', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const acceptedInteractions = await Interaction.find({
            userId: userId,
            interaction: 'accept'
        }).select('jobId');

        const acceptedJobIds = acceptedInteractions.map(i => i.jobId);

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

        if (job.posterId.toString() !== userId) {
            return res.status(401).json({ msg: 'Not authorized to view matches for this job' });
        }

        // 2. Fetch all candidates (Match records) for this specific jobId
        const candidates = await Match.find({ jobId: jobId });
        
        res.json(candidates);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching job matches.');
    }
});


module.exports = router;