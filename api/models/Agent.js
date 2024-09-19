const mongoose = require('mongoose');
const User = require('./User');

// Agent-specific fields can be added here
const agentSchema = new mongoose.Schema({
  ticketCount: { type: Number, default: 0 },  // Tracks number of tickets handled
  ticketResolved: { type: Number, default: 0 },
  ticketInProgress: { type: Number, default: 0 },
  ticketOpen: { type: Number, default: 0 },
});

const Agent = User.discriminator('agent', agentSchema);

module.exports = Agent;
