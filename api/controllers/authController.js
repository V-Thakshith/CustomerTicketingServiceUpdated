const User = require('../models/User');
const Manager = require('../models/Manager');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');

// Register Customer
exports.registerCustomer = async (req, res) => {
  const { fullName, signupEmail, signupPassword, dob, country, gender } = req.body;

  try {
    // Validate required fields
    if (!fullName || !signupEmail || !signupPassword || !dob || !country || !gender) {
      return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: signupEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(signupPassword, 10);

    // Create the new user
    const customer = new User({ 
      name: fullName, 
      email: signupEmail, 
      password: hashedPassword, 
      gender, 
      dob, 
      country 
    });

    // Save the user in the database
    const newUser = await customer.save();
    console.log(newUser)
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET
    );

    // Send response
    res.status(201).json({ token, user: newUser });

  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Register Agent
exports.registerAgent = async (req, res) => {
  const { fullName,signupEmail, signupPassword,dob,country,gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(signupPassword, 10);
    const agent = new Agent({ name:fullName, email:signupEmail, password: hashedPassword, gender, dob, country });
    await agent.save();
    res.status(201).json({ msg: 'Agent registered successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

// Register Manager
exports.registerManager = async (req, res) => {
  const { fullName,signupEmail, signupPassword,dob,country,gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(signupPassword, 10);
    const manager = new Manager({ name:fullName, email:signupEmail, password: hashedPassword, gender, dob, country });
    await manager.save();
    res.status(201).json({ msg: 'Manager registered successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password)

    // Find user
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    console.log(token,user)
    res.json({token,user})
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

exports.logout=async(req,res)=>{
  res.json(true)
}
