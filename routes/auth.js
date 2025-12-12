const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth'); // For the GET /me route

// @route   POST /api/auth/register
// @desc    Register user (and automatically log them in)
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), msg: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            // 1. Check if user already exists
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // 2. Create new User instance
            user = new User({
                name,
                email,
                password,
                // New profile fields will default to empty strings/arrays as defined in User.js
            });

            // 3. Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // 4. Save user to database
            await user.save();

            // 5. Create JWT Payload
            const payload = {
                user: {
                    id: user.id
                }
            };

            // 6. Sign and return token
            jwt.sign(
                payload,
                process.env.JWT_SECRET, // Use your JWT secret key from the .env file
                { expiresIn: '5 days' }, 
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, msg: 'User registered successfully' });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error during registration');
        }
    }
);


// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), msg: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            // 1. Check if user does NOT exist
            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // 2. Compare password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // 3. Create JWT Payload
            const payload = {
                user: {
                    id: user.id
                }
            };

            // 4. Sign and return token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, msg: 'Login successful' });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error during login');
        }
    }
);


// @route   GET /api/auth/me
// @desc    Get logged in user profile (used for token validation/refresh)
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id is set by the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching user data.');
    }
});


module.exports = router;