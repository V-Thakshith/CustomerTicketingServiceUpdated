const Agent = require('../models/Agent');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
 
// Send notification to customer
const notifyCustomer = async (ticketId, message) => {
  try {
    const ticket = await Ticket.findById(ticketId).populate('assignedTo');
    if (!ticket) throw new Error('Ticket not found');
   
    const customer = await User.findById(ticket.customer);
    if (!customer) throw new Error('Customer not found');
   
    // Send Email
    console.log(customer.email, message);
    if (customer.email) {
      await sendEmail(customer.email, 'Ticket Update', message);
    }
  } catch (error) {
    console.error('Error notifying customer:', error);
  }
};
 
// Update ticket status and notify customer
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status is provided
    if (!status) {
      return res.status(400).json({ msg: 'Status is required' });
    }

    // Find the ticket by ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Validate status transition
    const currentStatus = ticket.status;
    let validStatus = false;
    if (currentStatus === 'Open') {
      validStatus = status === 'In Progress' || status === 'Resolved';
    } else if (currentStatus === 'In Progress') {
      validStatus = status === 'Resolved';
    }

    if (!validStatus) {
      return res.status(400).json({ msg: 'Invalid status transition' });
    }

    // Update the ticket status and updatedAt field
    ticket.status = status;
    ticket.updatedAt = new Date(); // Manually update `updatedAt`
    const updatedTicket = await ticket.save();

    // Update the agent ticket counts
    const agent = await User.findById(ticket.assignedTo).exec();
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    const updateAgent = { $inc: { ticketCount: 0 } };
    if (currentStatus === "Open") updateAgent.$inc.ticketOpen = -1;
    if (currentStatus === "In Progress") updateAgent.$inc.ticketInProgress = -1;
    if (currentStatus === "Resolved") updateAgent.$inc.ticketResolved = -1;

    if (status === "Open") updateAgent.$inc.ticketOpen = 1;
    if (status === "In Progress") updateAgent.$inc.ticketInProgress = 1;
    if (status === "Resolved") updateAgent.$inc.ticketResolved = 1;

    await Agent.findByIdAndUpdate(ticket.assignedTo, updateAgent).exec();

    // Notify the customer with a detailed message
    let message;
    switch (status) {
      case 'In Progress':
        message = `Your ticket with ID ${id} is now in progress. You can contact your assigned agent, ${agent.name}, at ${agent.email} for further clarification.`;
        break;
      case 'Resolved':
        message = `Good news! Your ticket with ID ${id} has been resolved. Thank you for your patience. If you need further assistance, please contact our support team or raise a new ticket.`;
        break;
      case 'Open':
        message = `Your ticket with ID ${id} has been reopened. If you have additional information, please provide it to your assigned agent or contact our support team.`;
        break;
      default:
        message = `Your ticket with ID ${id} has been updated to ${status}.`;
    }

    await notifyCustomer(id, message);

    res.status(200).json({ msg: 'Ticket status updated', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};

 
exports.updateTicketStatusToResolved = async (req, res) => {
  try {
    const { id } = req.params;
    const status = 'Resolved';
 
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },  // Update status and `updatedAt`
      { new: true }
    );
    if (!updatedTicket) return res.status(404).json({ msg: 'Ticket not found' });
 
    const message = `Your ticket with ID ${id} has been updated to Resolved.`;
    await notifyCustomer(id, message);
 
    res.status(200).json({ msg: 'Ticket status updated to Resolved', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('customer assignedTo');  // Correct field names for population
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ msg: 'Error fetching tickets', error: error.message });
  }
};
 
// Reassigning tickets from manager
exports.reassignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAgentId } = req.body;
 
    const ticket = await Ticket.findById(id);
    const oldAgentID = ticket.assignedTo;
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
 
    const [newAgent, oldAgent] = await Promise.all([
      Agent.findById(newAgentId).exec(),
      Agent.findById(oldAgentID).exec()
    ]);
    if (!newAgent || !oldAgent) throw new Error('One or both agents not found');
 
    // Update agent ticket counts
    const updateNewAgent = { $inc: { ticketCount: 1 } };
    const updateOldAgent = { $inc: { ticketCount: -1 } };
 
    const ticketStatus = ticket.status;
    if (ticketStatus === "Open") {
      updateNewAgent.$inc.ticketOpen = 1;
      updateOldAgent.$inc.ticketOpen = -1;
    } else if (ticketStatus === "In Progress") {
      updateNewAgent.$inc.ticketInProgress = 1;
      updateOldAgent.$inc.ticketInProgress = -1;
    } else if (ticketStatus === "Resolved") {
      updateNewAgent.$inc.ticketResolved = 1;
      updateOldAgent.$inc.ticketResolved = -1;
    }
 
    await Promise.all([
      Agent.findByIdAndUpdate(newAgentId, updateNewAgent).exec(),
      Agent.findByIdAndUpdate(oldAgentID, updateOldAgent).exec()
    ]);
 
    ticket.assignedTo = newAgentId;
    ticket.updatedAt = new Date();  // Manually update `updatedAt`
    const updatedTicket = await ticket.save();
 
    // Notify the customer
    const message = `Your ticket with ID ${id} has been reassigned to a new agent.`;
    await notifyCustomer(id, message);
 
    res.status(200).json({ msg: 'Ticket reassigned successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Error reassigning ticket:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
exports.assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
 
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
 
    // Check if the user is an agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'Agent') return res.status(400).json({ msg: 'Invalid agent' });
 
    ticket.assignedTo = agentId;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
exports.getAssignedTickets = async (req, res) => {
  try {
    const { agentId } = req.params;
 
    // Fetch tickets assigned to the agent and populate customer details
    const tickets = await Ticket.find({ assignedTo: agentId })
                               .populate('customer', 'name email') // Populate customer details
                               .exec();
 
    // Map the tickets to include customer details in the response
    const result = tickets.map(ticket => ({
      ...ticket._doc, // Include all ticket fields
      customerName: ticket.customer ? ticket.customer.name : 'N/A',
      customerEmail: ticket.customer ? ticket.customer.email : 'N/A'
    }));
 
    res.json(result);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, customerId, category } = req.body;

    // Handle attachments, if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => {
        return file.path ? file.path : file.location; 
      });
    }

    // Validate input: Check if required fields are missing
    if (!title || !description || !customerId) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Create the ticket with basic details
    const now = new Date();

    // Initialize the new ticket object
    const newTicket = new Ticket({
      title,
      description,
      status: 'Open',
      attachments,
      customer: customerId,
      createdAt: now,
      updatedAt: new Date(),  // Set `updatedAt` to current date
      category: category || 'General', // Default to 'General' if category is missing
    });

    // Find all agents
    const agents = await User.find({ role: 'agent' }).exec();
    if (agents.length === 0) {
      return res.status(404).json({ msg: 'No agents found' });
    }

    // Find unassigned agents
    const unassignedAgents = await User.find({
      role: 'agent',
      _id: { $nin: await Ticket.distinct('assignedTo') }, // Agents who aren't assigned any tickets
    }).exec();

    // Assign to an unassigned agent if one is found
    if (unassignedAgents.length > 0) {
      const assignedAgent = unassignedAgents[Math.floor(Math.random() * unassignedAgents.length)];
      newTicket.assignedTo = assignedAgent._id;
      await Agent.findByIdAndUpdate(assignedAgent._id, { $inc: { ticketCount: 1, ticketOpen: 1 } }).exec();
      const savedTicket = await newTicket.save();
      return res.status(201).json({ msg: 'Ticket created and assigned to an unassigned agent', ticket: savedTicket });
    }

    // Create an array to hold agents and their open + in-progress ticket counts
    const agentTicketCounts = await Promise.all(
      agents.map(async (agent) => {
        const inProgressCount = await Ticket.countDocuments({ assignedTo: agent._id, status: 'In Progress' });
        const openCount = await Ticket.countDocuments({ assignedTo: agent._id, status: 'Open' });
        return { agent, count: inProgressCount + openCount };
      })
    );

    // Sort agents by their combined ticket count
    const leastBusyAgents = agentTicketCounts.sort((a, b) => a.count - b.count);
    
    // If all agents are busy, assign randomly to any agent
    const leastBusyAgent = leastBusyAgents[0]?.agent;
    if (!leastBusyAgent) {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      newTicket.assignedTo = randomAgent._id;
      await Agent.findByIdAndUpdate(randomAgent._id, { $inc: { ticketCount: 1, ticketOpen: 1 } }).exec();
      const savedTicket = await newTicket.save();
      return res.status(201).json({ msg: 'Ticket created and assigned randomly to an agent', ticket: savedTicket });
    }

    // Assign the ticket to the least busy agent
    newTicket.assignedTo = leastBusyAgent._id;
    await Agent.findByIdAndUpdate(leastBusyAgent._id, { $inc: { ticketCount: 1, ticketOpen: 1 } }).exec();
    const savedTicket = await newTicket.save();

    // Respond with the created ticket
    res.status(201).json({ msg: 'Ticket created and assigned to least busy agent', ticket: savedTicket });

  } catch (error) {
    // Log error for debugging and respond with server error status
    console.error('Error creating ticket:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};

 
 
// Retrieve ticket by ID
exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
 
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
 
    res.status(200).json({ ticket });
  } catch (error) {
    console.error('Error retrieving ticket:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Get tickets assigned to an agent
exports.getTicketsAssignedToAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
 
    const tickets = await Ticket.find({ assignedTo: agentId });
    if (!tickets.length) return res.status(404).json({ msg: 'No tickets found for this agent' });
 
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error retrieving tickets assigned to agent:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Get tickets resolved by an agent
exports.getTicketsResolvedByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
 
    const tickets = await Ticket.find({ assignedTo: agentId, status: 'Resolved' });
    if (!tickets.length) return res.status(404).json({ msg: 'No resolved tickets found for this agent' });
 
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error retrieving resolved tickets by agent:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Get tickets resolved today by an agent
exports.getTicketsResolvedTodayByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
 
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
 
    const tickets = await Ticket.find({
      assignedTo: agentId,
      status: 'Resolved',
      updatedAt: { $gte: startOfToday }
    });
 
    if (!tickets.length) return res.status(404).json({ msg: 'No tickets resolved today by this agent' });
 
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error retrieving tickets resolved today by agent:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Get tickets assigned to an agent between two dates
exports.getTicketsAssignedByAgentBetween = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate } = req.query;
 
    const tickets = await Ticket.find({
      assignedTo: agentId,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
 
    if (!tickets.length) return res.status(404).json({ msg: 'No tickets found in the specified range' });
 
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error retrieving tickets assigned by agent between dates:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
// Get tickets resolved by an agent between two dates
exports.getTicketsResolvedByAgentBetween = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate } = req.query;
 
    const tickets = await Ticket.find({
      assignedTo: agentId,
      status: 'Resolved',
      updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
 
    if (!tickets.length) return res.status(404).json({ msg: 'No resolved tickets found in the specified range' });
 
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error retrieving resolved tickets by agent between dates:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
const getAgentDetails = async (agentId) => {
  try {
    const agent = await Agent.findById(agentId);
    return agent ? { name: agent.name, email: agent.email } : null;
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return null;
  }
};
 
exports.getTicketsByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
   
    // Fetch tickets for the customer
    const tickets = await Ticket.find({ customer: customerId }).populate('assignedTo');
   
    // Fetch and include agent details in each ticket
    const ticketsWithAgentDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const agentDetails = ticket.assignedTo ? await getAgentDetails(ticket.assignedTo) : null;
        return {
          ...ticket._doc,
          agent: agentDetails
        };
      })
    );
   
    console.log(ticketsWithAgentDetails);
    res.status(200).json(ticketsWithAgentDetails);
  } catch (error) {
    console.error('Error fetching tickets by customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
 
 
exports.getAgentTicketCounts = async (req, res) => {
  try {
    // Aggregate ticket counts by agent
    const ticketCounts = await Ticket.aggregate([
      { $group: { _id: "$assignedTo", ticketCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agentDetails' } },
      { $unwind: '$agentDetails' },
      { $project: {
        _id: 0,
        agentId: '$_id',
        ticketCount: 1,
        agentName: '$agentDetails.name',
        agentEmail: '$agentDetails.email'
      } }
    ]);
 
    res.json(ticketCounts);
  } catch (error) {
    console.error('Error fetching agent ticket counts:', error);
    res.status(500).json({ msg: 'Server error', error });
  }
};
 
exports.getAllTicketsCounts = async (req, res) => {
  try {
    // Assuming you have a Ticket model to interact with the database
    const totalTickets = await Ticket.countDocuments();
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
 
    res.json({
      totalTickets,
      resolvedTickets,
      inProgressTickets,
      openTickets,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ticket counts' });
  }
};
 
 
exports.getAllTicketsCountsToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Start of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // End of today
 
    // Count tickets based on today's date
    const totalTickets = await Ticket.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved', createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress', createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const openTickets = await Ticket.countDocuments({ status: 'Open', createdAt: { $gte: startOfDay, $lte: endOfDay } });
 
    res.json({
      totalTickets,
      resolvedTickets,
      inProgressTickets,
      openTickets,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ticket counts' });
  }
};
 
 
