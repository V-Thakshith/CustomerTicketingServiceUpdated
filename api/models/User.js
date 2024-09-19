const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  country: { type: String, required: true },
  role: { type: String, required: true, enum: ['customer', 'agent', 'manager'], default: 'customer' },
}, { discriminatorKey: 'role', timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
