import React, { useState } from 'react';
// import api from '../api'; // Ensure this points to your API setup
import './RegisterAgentPopup.css'; // Import CSS for styling
import api from'../apiForManager';
 
const RegisterAgentPopup = ({ handleClose }) => {
  const [agentData, setAgentData] = useState({
    fullName: '', // Use fullName as expected by the API
    signupEmail: '', // Use signupEmail
    signupPassword: '', // Use signupPassword
    confirmPassword: '', // Confirm password is local to the form, not sent to the API
     role: 'agent',
    gender: '',
    dob: '',
    country: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
 
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
 
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return '';
  };
 
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
 
    // Name validation: At least 3 characters
    if (agentData.fullName.length < 3) {
      setErrorMessage('Name must be at least 3 characters long.');
      return;
    }
 
    if (!validateEmail(agentData.signupEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
 
    const passwordError = validatePassword(agentData.signupPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
 
    if (agentData.signupPassword !== agentData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
 
    // Date validation: Age should be at least 18 years
    const today = new Date();
    const birthDate = new Date(agentData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
 
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
 
    if (age < 18) {
      setErrorMessage('You must be at least 18 years old to register.');
      return;
    }
 
    try {
      const { data } = await api.post('/auth/registerAgent', agentData); // Post data to the correct endpoint
      alert('Agent registered successfully!');
      handleClose(); // Close the popup
    } catch (error) {
      console.error('Error registering agent:', error);
    }
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgentData({
      ...agentData,
      [name]: value
    });
  };
 
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={handleClose}>X</button>
        <h2>Register Agent</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName" // Updated to fullName
              value={agentData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupEmail">Email</label>
            <input
              type="email"
              id="signupEmail"
              name="signupEmail" // Updated to signupEmail
              value={agentData.signupEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              name="signupPassword" // Updated to signupPassword
              value={agentData.signupPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={agentData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={agentData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={agentData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={agentData.country}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};
 
export default RegisterAgentPopup;
 
 
