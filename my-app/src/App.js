import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AgentDashboard from './components/AgentDashboard';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import { UserContextProvider } from './UserContext';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import EmployeeLogin from './components/EmployeeLogin';

const App = () => {
    return (
        <Router>
            <UserContextProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} /> {/* Load Landing Page by default */}
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboardAgent" element={<AgentDashboard />} />
                    <Route path="/managerDashboard" element={<ManagerDashboard />} />
                    <Route path="/employeeLogin" element={<EmployeeLogin/>}/>
                </Routes>
            </UserContextProvider>
        </Router>
    );
};

export default App;
