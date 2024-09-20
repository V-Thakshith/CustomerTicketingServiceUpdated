import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Custom styles for the landing page

const LandingPage = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login');
    };

    const goToAboutUs = () => {
        alert('About Us section coming soon!');
    };

    const goToContact = () => {
        navigate('/contact');
    };

    return (
        <div className="landing-container">
            <img src="/images/supprt_ticketng-System.png" alt="Customer Support" className="landing-image" />
            <div className="landing-content">
                <div className="text-section">
                    <h1 className="main-heading">Welcome to Teleassist</h1>
                    <p>Your trusted platform for all support needs</p>
                    <div className="button-section">
                        <button onClick={goToLogin} className="landing-button">Login</button>
                        <button onClick={goToAboutUs} className="landing-button">About Us</button>
                        <button onClick={goToContact} className="landing-button">Contact Us</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
