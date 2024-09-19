import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import AgentDashboard from './components/AgentDashboard';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import { UserContextProvider } from './UserContext';

const App = () => {
    return (
        <Router>
            <UserContextProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboardAgent" element={<AgentDashboard />} />
                    <Route path="/managerDashboard" element={<ManagerDashboard />} /> {/* Manager Dashboard Route */}
                </Routes>
            </UserContextProvider>
        </Router>
    );
};

export default App;
