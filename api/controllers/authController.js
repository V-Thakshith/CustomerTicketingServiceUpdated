const User = require('../models/User');
const Manager = require('../models/Manager');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');

// Register Customer
exports.registerCustomer = async (req, res) => {
  const { fullName,signupEmail, signupPassword,dob,country,gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(signupPassword, 10);
    const customer = new Customer({ name:fullName, email:signupEmail, password: hashedPassword, gender, dob, country });
    await customer.save();
    res.status(201).json({ msg: 'Customer registered successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
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
    res.cookie('token',token).json({token,user})
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

exports.logout=async(req,res)=>{
  res.json(true)
}
