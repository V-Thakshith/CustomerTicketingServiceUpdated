const mongoose = require('mongoose');
const User = require('./User');

// Customer-specific fields can be added here
const customerSchema = new mongoose.Schema({
  subscription: { type: String },  // Example field specific to Customer
});

const Customer = User.discriminator('customer', customerSchema);

module.exports = Customer;
