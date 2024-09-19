// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user associated with the token
    req.user = await User.findById(decoded.id);

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
