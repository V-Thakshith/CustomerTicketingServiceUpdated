const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserDetails } = require('../controllers/userController');
const { getAllAgentsDetails } = require('../controllers/managerController');
const { removeAgent } = require('../controllers/managerController');
const { getAllTicketsCounts } = require('../controllers/ticketController');
const { getAllTicketsCountsToday } = require('../controllers/ticketController');
const { getTicketsByAgentToday } = require('../controllers/agentController');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/me', authMiddleware, getUserDetails);
router.get('/allAgentsDetails', authMiddleware, getAllAgentsDetails);
router.delete('/removeAgent/:agentId', authMiddleware, roleMiddleware(['manager']), removeAgent);
router.get('/ticketsByAgentToday/:agentId', authMiddleware, getTicketsByAgentToday);
router.get('/getAllTicketsCounts', authMiddleware, getAllTicketsCounts);
router.get('/getAllTicketsCountsToday', authMiddleware, getAllTicketsCountsToday);

module.exports = router;
