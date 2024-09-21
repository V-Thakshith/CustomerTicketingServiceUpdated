import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';
import api from '../api';
import TicketModal from './TicketModal';
import RegisterAgentPopup from './RegisterAgentPopup';
import ManagerTicketChart from './ManagerTicketChart';
import { UserContext } from '../UserContext';  // Import the UserContext
 
const ManagerDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [ticketCounts, setTicketCounts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);
  const [ticketAssignments, setTicketAssignments] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false); // New loading state
  const navigate = useNavigate();
 
  // Access user data from context
  const { user } = useContext(UserContext);
 
  useEffect(() => {
    setLoading(true);
    fetchAgentsAndTickets();
  }, []);
 
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Resolved');
 
  const fetchAgentsAndTickets = async () => {
    try {
      const [agentsResponse, ticketCountsResponse, ticketsResponse] = await Promise.all([
        api.get('/users/allAgentsDetails'),
        api.get('/tickets/ticketCounts'),
        api.get('/tickets/tickets')
      ]);
 
      setAgents(agentsResponse.data);
      setTicketCounts(ticketCountsResponse.data);
      setTickets(ticketsResponse.data);
 
      const initialAssignments = ticketsResponse.data.reduce((acc, ticket) => {
        acc[ticket._id] = ticket.assignedTo ? ticket.assignedTo._id : '';
        return acc;
      }, {});
      setTicketAssignments(initialAssignments);
    } catch (error) {
      setError('Error fetching data.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
 
  const getAssignedTicketCountForAgent = (agentId) => {
    const agentTicket = agents.find(agent => agent._id === agentId);
    return agentTicket.ticketOpen + agentTicket.ticketInProgress;
  };

  const getResolvedTicketCountForAgent = (agentId) => {
    const agentTicket = agents.find(agent => agent._id === agentId);
    return agentTicket.ticketResolved;
  };
 
  const handleReassignTicket = async (ticketId) => {
    const newAgentId = ticketAssignments[ticketId];
    
    // Optimistically update the ticket assignment locally
    const updatedTickets = tickets.map(ticket =>
      ticket._id === ticketId ? { ...ticket, assignedTo: { _id: newAgentId, name: agents.find(a => a._id === newAgentId)?.name || '' } } : ticket
    );
    setTickets(updatedTickets);
    
    setIsLoadingAction(true);  // Set loading state

    try {
      await api.put(`/tickets/tickets/${ticketId}/reassign`, { newAgentId });
      fetchAgentsAndTickets();  // Optionally refetch data for accuracy
    } catch (error) {
      console.error('Error reassigning ticket:', error);
      setError('Reassignment failed.');
    } finally {
      setIsLoadingAction(false);  // Reset loading state
    }
  };
 
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
 
  const handleCloseModal = () => {
    fetchAgentsAndTickets();
    setShowModal(false);
    setSelectedTicket(null);
  };
 
  const handleTicketAction = async (updatedTicket) => {
    // Optimistically update the ticket status locally
    const updatedTickets = tickets.map(ticket =>
      ticket._id === updatedTicket._id ? updatedTicket : ticket
    );
    setTickets(updatedTickets);

    setIsLoadingAction(true);  // Set loading state
    
    try {
      //await api.put(`/tickets/tickets/${updatedTicket._id}`, updatedTicket);
      fetchAgentsAndTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError('Ticket update failed.');
    } finally {
      setIsLoadingAction(false);  // Reset loading state
    }
  };
 
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };
 
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
 
  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-sticky">
          <ul className="nav-list">
            <li className="nav-item">
              <a className="nav-link" href="#agents">Agents</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#tickets">Tickets</a>
            </li>
            <li className='nav-item'>
              <a href="#register" onClick={() => setShowPopup(true)}>Register Agent</a>
            </li>
          </ul>
        </div>
      </nav>
 
      <main className="main-content">
        <header className="header">
          <h2>Welcome {user?.name || 'Manager'}</h2> {/* Display the user name */}
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </header>
 
        {/* Display list of agents and their ticket counts */}
        <div id="agents" className="card">
          <div className="card-header">
            <h5>Agents</h5>
          </div>
          <br></br>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Assigned Tickets</th>
                  <th>Resolved Tickets</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent._id}>
                    <td>{agent.name}</td>
                    <td>{getAssignedTicketCountForAgent(agent._id)}</td>
                    <td>{getResolvedTicketCountForAgent(agent._id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Display only non-resolved tickets with reassignment options */}
        <div id="tickets" className="card">
          <div className="card-header">
            <h5>Tickets</h5>
          </div>
          <br></br>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Reassign</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter(ticket => ticket.status !== 'Resolved') // Filter out resolved tickets
                  .map(ticket => (
                    <tr key={ticket._id}>
                      <td>{ticket._id}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.status}</td>
                      <td>{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</td>
                      <td>
                        <select
                          value={ticketAssignments[ticket._id] || ''}
                          onChange={(e) => setTicketAssignments(prevAssignments => ({
                            ...prevAssignments,
                            [ticket._id]: e.target.value
                          }))}>
                          <option value="">Select Agent</option>
                          {agents.map(agent => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => handleReassignTicket(ticket._id)} disabled={isLoadingAction}>
                          {isLoadingAction ? 'Reassigning...' : 'Reassign'}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => handleViewTicket(ticket)}>View</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
       
        <div id="reports" className="card">
          <div className="card-header">
            <h5>Resolved Tickets</h5>
          </div>
          <br />
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket Number</th>
                  <th>Customer Name</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Date Resolved</th>
                </tr>
              </thead>
              <tbody>
                {resolvedTickets.length > 0 ? (
                  resolvedTickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td>{ticket._id}</td>
                      <td>{ticket.customer?.name || 'Unknown Customer'}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.category}</td>
                      <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No tickets resolved yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
 
        <div className="charts">
          <ManagerTicketChart ticketCounts={ticketCounts} resolvedTickets={resolvedTickets} />
        </div>
      </main>
 
      {/* Modal for ticket details */}
      {showModal && (
        <TicketModal
          ticket={selectedTicket}
          handleCloseModal={handleCloseModal}
          onAction={handleTicketAction}
        />
      )}
 
      {/* Popup for registering an agent */}
      {showPopup && <RegisterAgentPopup handleClose={() => setShowPopup(false)} />}
    </div>
  );
};
 
export default ManagerDashboard;
