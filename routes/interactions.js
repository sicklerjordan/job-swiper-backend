const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interaction = require('../models/Interaction');
const User = require('../models/User'); // <-- Need the User model to fetch the candidate profile
const Match = require('../models/Match'); // <-- The Match model to store accepted candidates

// @route   POST /api/interactions
// @desc    Log a user's swipe (accept or reject) on a job AND create a Match record if accepted.
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { jobId, interaction } = req.body;
        const userId = req.user.id; // The ID of the candidate (the swiper)

        // 1. Validation
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
        await newInteraction.save();

        // 4. Match Creation Logic (ONLY if the swipe was 'accept')
        if (interaction === 'accept') {
            
            // 4.1. Get the candidate's profile (select only the fields the job poster needs)
            const candidate = await User.findById(userId).select('name email'); 
            
            if (!candidate) {
                // This shouldn't happen if auth passed, but good for safety
                return res.status(404).json({ msg: 'Candidate profile not found.' });
            }

            // 4.2. Create the Match record
            const newMatch = new Match({
                jobId: jobId,
                candidateId: userId,
                candidateProfile: {
                    // Copy required profile details into the embedded object
                    name: candidate.name,
                    email: candidate.email
                    // Add other profile fields here if they exist on the User model
                }
            });

            await newMatch.save();
        }
        
        // Final response
        res.status(201).json({ msg: 'Interaction and match logged successfully.' });

    } catch (err) {
        console.error(err.message);
        // Check for specific Mongoose error if Match creation failed (e.g., duplicate index)
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate key error during match creation.' });
        }
        res.status(500).send('Server Error logging interaction and match.');
    }
});

// @route   GET /api/interactions/accepted 
// @desc    (Optional) Get accepted interactions for the user's dashboard view
// @access  Private
router.get('/accepted', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
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