const User = require('../models/User');

/**
 * Middleware to check user roles.
 * @param {Array} roles - An array of roles that are allowed to access the route.
 */
const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    try {
      // Extract user from request
      const user = req.user;

      // Ensure user is authenticated
      if (!user) return res.status(401).json({ msg: 'Unauthorized' });

      // Check if the user has one of the allowed roles
      const hasRole = roles.includes(user.role);
      if (!hasRole) return res.status(403).json({ msg: 'Forbidden' });

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error });
    }
  };
};

module.exports = roleMiddleware;
