const mongoose = require('mongoose');
// CRITICAL: Ensure you have set the MONGO_URI environment variable 
// in your Render dashboard under Environment, or in a local .env file.
const mongoURI = process.env.MONGO_URI; 

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Deprecated options removed for clean Mongoose 6+ compatibility
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1); 
    }
};

module.exports = connectDB;