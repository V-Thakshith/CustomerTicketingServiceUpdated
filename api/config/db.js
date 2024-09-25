const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');
 
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
 
    const hashedPassword = await bcrypt.hash("password123", 10);
 
    const DefaultManager = new Manager({
      name: "Bhuvan Reddy Sagar",
      email: "vadluribhuvansagar.reddy@gmail.com",
      password: hashedPassword,
      gender: "Male",
      dob: "2002-06-15",
      country: "India"
    });
 
    const DefaultAgent = new Agent({
      name: "Salaj Saxena",
      email: "salaj.saxena@gmail.com",
      password: hashedPassword,
      gender: "Male",
      dob: "2002-06-15",
      country: "India"
    });
 
    const DefaultCustomer = new Customer({
      name: "Vaishnavi B",
      email: "vaishnavib.goudar@gmail.com",
      password: hashedPassword,
      gender: "Female",
      dob: "2001-06-16",
      country: "India"
    });
 
    // Save Manager and handle duplicate key errors
    try {
      await DefaultManager.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('Manager with this email already exists');
      } else {
        console.error('Error creating Manager:', err);
      }
    }
 
    // Save Agent and handle duplicate key errors
    let defaultAgent;
    try {
      defaultAgent = await DefaultAgent.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('Agent with this email already exists');
        // Fetch the existing agent if it already exists
        defaultAgent = await Agent.findOne({ email: "salaj.saxena@gmail.com" });
      } else {
        console.error('Error creating Agent:', err);
      }
    }
 
    // Save Customer and handle duplicate key errors
    let defaultCustomer;
    try {
      defaultCustomer = await DefaultCustomer.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('Customer with this email already exists');
        // Fetch the existing customer if it already exists
        defaultCustomer = await Customer.findOne({ email: "vaishnavib.goudar@gmail.com" });
      } else {
        console.error('Error creating Customer:', err);
      }
    }
 
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
 
module.exports = connectDB;