const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    direction: { type: String, enum: ['left', 'right', 'top'], required: true }, 
    isMatchConfirmed: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Interaction', InteractionSchema);