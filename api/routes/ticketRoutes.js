const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../config/multer'); // Adjust path as needed

//adding /tickets to view tickets
router.get('/tickets', ticketController.getAllTickets);
router.put('/tickets/:id/status',authMiddleware,roleMiddleware(['agent', 'manager']), ticketController.updateTicketStatus);
router.put('/tickets/:id/statusresolve', authMiddleware, roleMiddleware(['agent', 'manager']), ticketController.updateTicketStatusToResolved);
router.put('/tickets/:id/reassign', authMiddleware, roleMiddleware(['manager']), ticketController.reassignTicket);
//
router.get('/ticketCounts', ticketController.getAgentTicketCounts)


router.post('/', upload.array('attachments', 10), ticketController.createTicket);
router.get('/:id', authMiddleware, ticketController.getTicket);
//router.put('/:id/status', authMiddleware, roleMiddleware(['agent', 'manager']), ticketController.updateTicketStatus);
router.post('/:id/assign', authMiddleware, roleMiddleware(['manager']), ticketController.assignTicket);
router.get('/assigned/:agentId', authMiddleware, roleMiddleware(['agent']), ticketController.getAssignedTickets);
router.get('/customer/:customerId', authMiddleware, ticketController.getTicketsByCustomer);

module.exports = router;
