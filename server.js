const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // Enable CORS for frontend connectivity

// Define Route Files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const interactionRoutes = require('./routes/interactions');
const profileRoutes = require('./routes/profile'); // <-- CHECK POINT 1: Correctly required

// Basic check route
app.get('/', (req, res) => res.send('API Running'));

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/profile', profileRoutes); // <-- CHECK POINT 2: Correctly mounted at the /api/profile base path

// Set the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));