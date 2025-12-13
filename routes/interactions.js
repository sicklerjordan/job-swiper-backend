const express = require('express');
const router = express = require('router');
const auth = require('../middleware/auth');
const Interaction = require('../models/Interaction');
const Match = require('../models/Match');
const User = require('../models/User'); 

// @route   POST /api/interactions
// @desc    Handle job swiping interaction (accept or reject)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { jobId, interaction } = req.body;
    const userId = req.user.id; // User ID from the auth token

    // 1. Basic validation
    if (!jobId || !interaction || (interaction !== 'accept' && interaction !== 'reject')) {
        return res.status(400).json({ msg: 'Invalid interaction data.' });
    }

    try {
        // 2. Check if the interaction already exists to prevent duplicates
        let existingInteraction = await Interaction.findOne({ userId, jobId });

        if (existingInteraction) {
            return res.status(400).json({ msg: 'Interaction already recorded.' });
        }

        // 3. Record the new interaction
        const newInteraction = new Interaction({
            userId,
            jobId,
            interaction
        });

        await newInteraction.save();

        // 4. Handle Match creation if interaction is 'accept'
        if (interaction === 'accept') {
            
            // 4.1. Get the current user's (candidate) profile data to store in the Match
            const candidate = await User.findById(userId).select('name email bio skills'); 
            
            if (!candidate) {
                return res.status(404).json({ msg: 'Candidate profile not found.' });
            }

            // 4.2. Create the Match record
            // Note: Since the job is considered a 'match' as soon as the candidate accepts, 
            // we create the Match record now. 
            const newMatch = new Match({
                candidateId: userId,
                jobId: jobId,
                // Store candidate data directly in the match record for persistence
                candidateProfile: {
                    name: candidate.name,
                    email: candidate.email,
                    bio: candidate.bio,
                    skills: candidate.skills
                }
            });

            await newMatch.save();
            return res.json({ msg: 'Interaction recorded and Match created!', match: newMatch });
        }
        
        // Response for a reject interaction
        res.json({ msg: 'Interaction recorded (Rejected).' });

    } catch (err) {
        console.error('Error handling interaction:', err.message);
        res.status(500).send('Server Error during interaction processing');
    }
});


// CRITICAL: Must export the router
module.exports = router;