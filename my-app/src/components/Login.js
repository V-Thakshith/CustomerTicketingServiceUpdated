import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { UserContext } from "../UserContext";
import api from '../api';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const { setUser } = useContext(UserContext);
    setUser(null);
    sessionStorage.clear();

    const [signupData, setSignupData] = useState({
        fullName: '',
        signupEmail: '',
        signupPassword: '',
        confirmPassword: '',
        gender: '',
        dob: '',
        country: '',
        role: 'customer'
    });

    const navigate = useNavigate();

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleCustomerLogin = async (e) => {
        e.preventDefault();
        try {
            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            const { data } = await api.post('/auth/login', { email, password });

            console.log(data.user, data.token);
            sessionStorage.setItem('token', data.token);
            setUser(data.user);

            if (data.user.role === 'customer') {
                navigate('/dashboard');
            } else {
                alert("Login role mismatch or invalid credentials.");
            }
        } catch (e) {
            console.log(e);
            alert("Customer Login Failed");
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
       
        // Name validation: At least 3 letters
        if (signupData.fullName.length < 3) {
            alert('Full name must be at least 3 characters long.');
            return;
        }
 
        // Date validation: Age should be at least 18 years
        const today = new Date();
        const birthDate = new Date(signupData.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
 
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
 
        if (age < 18) {
            alert('You must be at least 18 years old to register.');
            return;
        }
 
        try {
            const validatePassword = (pwd) => {
                if (pwd.length < 8) return 'Password must be at least 8 characters long';
                if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
                if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
                if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
                return '';
            };
 
            if (!validateEmail(signupData.signupEmail)) {
                alert('Please enter a valid email address.');
                return;
            }
 
            const passwordError = validatePassword(signupData.signupPassword);
            if (passwordError) {
                alert(passwordError);
                return;
            }
 
            if (signupData.signupPassword !== signupData.confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
 
            console.log('Pre Sign Up Data:', signupData);
            const { data } = await api.post('/auth/register', signupData);
            console.log('Sign Up Data:', signupData, data);
 
            alert('Sign-up successful!');
            setShowPopup(false); // Close the pop-up after sign-up
        } catch (e) {
            console.log(e);
            alert("Something went wrong");
        }
    };

    const handleEmployeeRedirect = () => {
        // Redirect to employee login page
        navigate('/employeeLogin');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupData({
            ...signupData,
            [name]: value
        });
    };

    return (
        <div className="login-container">
            <header className="headeremp">
                <h1>Teleassist</h1>
                <nav className="navbaremp">
                    <ul>
                        <li>
                            <button className="nav-buttonemp" onClick={handleEmployeeRedirect}>Employee Login</button>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="company-details">
                <h1>Welcome to Teleassist</h1>
                <p>Manage all your Teleassist services with ease.</p>
            </div>

            <div className="login-boxes">
                {/* Left box: Customer Login and Signup */}
                <div className="box left-box">
                    <h2>Customer Login</h2>
                    <form onSubmit={handleCustomerLogin}>
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
                        <button type="submit" className="login-button">Login</button>
                    </form>
                    <div className="sign-up-link">
                        <a href="#signup" onClick={() => setShowPopup(true)}>Sign Up</a>
                    </div>
                </div>
            </div>

            {/* Pop-up for sign up */}
            {showPopup && (
                <>
                    <div className="overlay" onClick={() => setShowPopup(false)}></div>
                    <div className="popup">
                        <button type="button" className="close-x-button" onClick={() => setShowPopup(false)}>X</button>
                        <h2>Sign Up for TelecomCo</h2>
                        <form onSubmit={handleSignUp}>
                            <div className="input-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={signupData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="signupEmail">Email Address</label>
                                <input
                                    type="email"
                                    id="signupEmail"
                                    name="signupEmail"
                                    value={signupData.signupEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="signupPassword">Password</label>
                                <input
                                    type="password"
                                    id="signupPassword"
                                    name="signupPassword"
                                    value={signupData.signupPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={signupData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={signupData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="dob">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={signupData.dob}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="country">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={signupData.country}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
 
                            <button type="submit" className="register-button">Register</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Login;
