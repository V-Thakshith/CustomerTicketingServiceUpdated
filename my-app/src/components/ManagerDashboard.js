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
 
  const getTicketCountForAgent = (agentId) => {
    const agentTicket = ticketCounts.find(ticket => ticket.agentId === agentId);
    return agentTicket ? agentTicket.ticketCount : 0;
  };
 
  const handleReassignTicket = async (ticketId) => {
    try {
      const newAgentId = ticketAssignments[ticketId];
      await api.put(`/tickets/tickets/${ticketId}/reassign`, { newAgentId });
      fetchAgentsAndTickets();
    } catch (error) {
      console.error('Error reassigning ticket:', error);
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
    try {
      await api.put(`/tickets/tickets/${updatedTicket._id}`, updatedTicket);
      fetchAgentsAndTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
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
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent._id}>
                    <td>{agent.name}</td>
                    <td>{getTicketCountForAgent(agent._id)}</td>
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
                        <button onClick={() => handleReassignTicket(ticket._id)}>Reassign</button>
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
        <td>{new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5">No resolved tickets</td>
    </tr>
  )}
</tbody>

                </table>
              </div>
            </div>
       
 
        {showModal && (
          <TicketModal
            ticket={selectedTicket}
            onClose={handleCloseModal}
            onAction={handleTicketAction}
          />
        )}
 
        {showPopup && (
          <RegisterAgentPopup onClose={() => setShowPopup(false)} />
        )}
 
        <div id="reports" className="card">
          <div className="card-header">
            <h5>Reports</h5>
          </div>
          <div className="card-body">
            <ManagerTicketChart />
          </div>
        </div>
      </main>
    </div>
  );
};
 
export default ManagerDashboard;
 
 