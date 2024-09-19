const User = require('../models/User');
const Ticket = require('../models/Ticket');
/**
 * Get details of the currently authenticated user.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} - JSON response with user details
 */
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the authenticated user
    const user = await User.findById(userId).select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getTicketsByAgentToday = async (req, res) => {
  const { agentId } = req.params;
  
  // Get start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Fetch assigned tickets (created today)
    const assignedTicketsToday = await Ticket.find({
      assignedTo: agentId,
      status: 'Open', // Still open
      createdAt: { $gte: startOfDay, $lte: endOfDay } // Assigned today
    });

    // Fetch resolved tickets (updated today)
    const resolvedTicketsToday = await Ticket.find({
      assignedTo: agentId,
      status: 'Resolved', // Resolved status
      updatedAt: { $gte: startOfDay, $lte: endOfDay } // Resolved today
    });

    // Fetch in-progress tickets (updated today)
    const inProgressTicketsToday = await Ticket.find({
      assignedTo: agentId,
      status: 'In Progress', // In progress
      updatedAt: { $gte: startOfDay, $lte: endOfDay } // In progress today
    });

    res.status(200).json({
      assignedTicketsToday: assignedTicketsToday.length,
      resolvedTicketsToday: resolvedTicketsToday.length,
      inProgressTicketsToday: inProgressTicketsToday.length,
      assignedDetails: assignedTicketsToday,
      resolvedDetails: resolvedTicketsToday,
      inProgressDetails: inProgressTicketsToday
    });
  } catch (error) {
    console.error('Error fetching tickets by agent for today:', error);
    res.status(500).json({ message: 'Server error while fetching tickets for today.' });
  }
};

module.exports = {
  getUserDetails,
  getTicketsByAgentToday
};
