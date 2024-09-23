import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is imported
import './Dashboard.css';
import api from '../api'; // Ensure this is correctly configured for your API
import { UserContext } from "../UserContext";
 
const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: '',
        photo: []
    }); // Updated formData
    const { user, ready } = useContext(UserContext);
    const navigate = useNavigate();
 
    // Define fetchTickets function here
    const fetchTickets = async () => {
        if (!ready) return;
 
        if (!user) {
            navigate('/');
            return;
        }
 
        setLoading(true);
        setError(null);
 
        try {
            const response = await api.get(`/tickets/customer/${user._id}`);
            setTickets(response.data);
        } catch (error) {
            setError('Error fetching tickets.');
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => {
        fetchTickets();
    }, [ready, user, navigate]);
 
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value || '');
    };
 
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value || '');
    };
 
    const filteredTickets = tickets.filter(ticket => {
        const ticketTitle = ticket.title || '';
        const ticketStatus = ticket.status || '';
       
        return (
            (statusFilter === '' || ticketStatus === statusFilter) &&
            ticketTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
 
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
 
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (!formData.category) {
            alert('Please select a category.');
            return;
        }
 
        const uploadData = new FormData();
        uploadData.append('title', formData.subject);
        uploadData.append('description', formData.description);
        uploadData.append('customerId', user._id);
        uploadData.append('category', formData.category);
 
        // Append files to FormData
        for (let i = 0; i < formData.photo.length; i++) {
            uploadData.append('attachments', formData.photo[i]);
        }
        console.log(uploadData)
        setLoading(true);
        setError(null);
 
        try {
            await api.post('/tickets', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchTickets(); // Call fetchTickets here
            closePopup();
        } catch (error) {
            console.error('Error submitting ticket:', error);
            setError('Failed to create ticket.');
        } finally {
            setLoading(false);
        }
    };
 
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
 
    const handleFileChange = (e) => {
        const files = e.target.files;
        const fileArray = Array.from(files);
        setFormData({ ...formData, photo: fileArray });
    };
 
    const openPopup = () => {
        setIsPopupOpen(true);
    };
 
    const closePopup = () => {
        setIsPopupOpen(false);
    };
 
    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };
 
    return (
        <div className="dashboard-container">
           
    <div className="sidebar1">
        <div className="logo">Teleassist</div>
        <nav className="nav-menu">
            <a href="#home">Home</a>
            <a href="#tickets">Tickets</a>
            <a href="#reports">Reports</a>
            <a href="#settings">Settings</a>
        </nav>
    </div>
 
    <main className="main-content1">
        <header className="header">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </header>
       
        <div className="top-bar">
            <input
                type="text"
                placeholder="Search..."
                className="search-bar"
                value={searchQuery}
                onChange={handleSearchChange}
            />
            <select className="status-filter" value={statusFilter} onChange={handleStatusChange}>
                <option value="">All Status</option>
                <option value="To-Do">To-Do</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Closed">Closed</option>
            </select>
            <button className="raise-ticket-button" onClick={openPopup}>
                Raise Ticket
            </button>
        </div>
        <div className="table-container">
                <table className="info-table">
                    <thead>
                        <tr>
                            <th>Ticket No.</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Agent Name</th>
                            <th>Agent Email</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map(ticket => (
                                <tr key={ticket.ticketNo}>
                                    <td>{ticket._id}</td>
                                    <td>{ticket.title}</td>
                                    <td>{ticket.status}</td>
                                    <td>{ticket.agent.name}</td>
                                    <td>{ticket.agent.email}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No tickets found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </main>
 
            {/* Pop-up for Raise Ticket */}
            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Raise a Ticket</h2>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            />

<label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="General">General</option>
                                <option value="Product">Product</option>
                            </select>
 
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            ></textarea>
 
                            
 
                            <label htmlFor="photo">Upload Photos</label>
                            <input
                                type="file"
                                id="photo"
                                name="photo"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
 
                            <div className="popup-actions">
                                <button type="submit">Submit</button>
                                <button type="button" onClick={closePopup}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
 
export default Dashboard;
 