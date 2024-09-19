import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeLogin.css';
import { UserContext } from '../UserContext'; // Import your user context
import api from '../api'; // Assuming you have an api instance configured

const EmployeeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isManager, setIsManager] = useState(false); // Checkbox state for manager login
    const { setUser } = useContext(UserContext); // Use context to manage user
    const navigate = useNavigate();

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Validate email format
            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Call the API for login
            const { data } = await api.post('/auth/login', { email, password });

            // Log the user data and token
            console.log(data.user, data.token);
            sessionStorage.setItem('token', data.token); // Store the token
            setUser(data.user); // Update user context

            // Navigate based on role
            if (isManager && data.user.role === 'manager') {
                navigate('/managerDashboard');
            } else if (!isManager && data.user.role === 'agent') {
                navigate('/dashboardAgent');
            } else if (!isManager && data.user.role === 'customer') {
                navigate('/dashboard');
            } else {
                alert("Auth Login Error: Incorrect role or credentials.");
            }
        } catch (error) {
            console.log(error);
            alert("Login Failed. Please check your credentials.");
        }
    };

    return (
        <div className="employee-login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Employee Login</h2>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group-inline">
                    <input
                        type="checkbox"
                        id="managerLogin"
                        checked={isManager}
                        onChange={() => setIsManager(!isManager)}
                    />
                    <label htmlFor="managerLogin">Sign in as Manager</label>
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default EmployeeLogin;
