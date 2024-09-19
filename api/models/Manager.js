const mongoose = require('mongoose');
const User = require('./User');

// Manager-specific fields can be added here
const managerSchema = new mongoose.Schema({
  department: { type: String },  // Example field specific to Manager
});

const Manager = User.discriminator('manager', managerSchema);

module.exports = Manager;

