const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Customer registration
router.post('/register', authController.registerCustomer);

// Agent registration (restricted to manager)
router.post('/registerAgent', authMiddleware, authController.registerAgent);

// Manager registration (restricted to manager)
//router.post('/registerManager', authMiddleware, roleMiddleware(['manager']), authController.registerManager);

// Login route (same for all roles)
router.post('/login', authController.loginUser);

module.exports = router;
