const mongoose = require('mongoose');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Ticket = require('../models/Ticket');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const DefaultManager = new Manager({
      name: "Bhuvan Reddy Sagar",
      email: "vadluribhuvansagar.reddy@team.telstra.com",
      password: "password123",
      gender: "Male",
      dob: "2002-06-15",
      country: "India"
    });

    const DefaultAgent = new Agent({
      name: "Salaj Saxena",
      email: "salaj.saxena@team.telstra.com",
      password: "password123",
      gender: "Male",
      dob: "2002-06-15",
      country: "India"
    });

    const DefaultCustomer = new Customer({
      name: "Vaishnavi B",
      email: "vaishnavib.goudar@team.telstra.com",
      password: "password123",
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
    let defaultAgent
    let defaultCustomer
    try {
      defaultAgent=await DefaultAgent.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('Agent with this email already exists');
      } else {
        console.error('Error creating Agent:', err);
      }
    }

    // Save Customer and handle duplicate key errors
    try {
      defaultCustomer=await DefaultCustomer.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('Customer with this email already exists');
      } else {
        console.error('Error creating Customer:', err);
      }
    }

    const DefaultTicket = new Ticket({
      title:"Issue with the Internet",
      description:"Cant connect to the Internet from morning, I have restarted many times",
      status: 'Open',
      attachments:'',
      customer: defaultCustomer._id,
      createdAt: new Date(),
      updatedAt: new Date(),  // Set `updatedAt` to current date
      category: 'Technical', // Default to 'General' if category is missing
      assignedTo: defaultAgent._id
    });

    try {
      defaultTicket=await DefaultTicket.save();
    } catch (err) {
      if (err.code === 11000) {
        console.log('DefaultTicket with this id already exists');
      } else {
        console.error('Error creating DefaultTicket:', err);
      }
    }

    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
