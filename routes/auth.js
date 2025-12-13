const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register user and return token
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Create new User instance (bio/skills default to empty)
            user = new User({ name, email, password });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save(); // Save to database

            // Generate JWT Token
            const payload = { user: { id: user.id } };
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token }); // Send token back to frontend
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// ... (You should also have the /login and /me routes here, but focusing on register)
router.get('/me', (req, res) => res.send('Auth /me route needs implementation')); // Minimal placeholder

module.exports = router;