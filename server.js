// server.js
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
    res.send('Job App Backend is running!');
});

// --- IMPORT ROUTES ---
// Ensure these files exist in the ./routes folder
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const interactionRoutes = require('./routes/interactions');

// --- USE ROUTES (API Endpoints) ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interactions', interactionRoutes);

// --- DB CONNECTION & SERVER START ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch(err => console.error('DB Connection error:', err));