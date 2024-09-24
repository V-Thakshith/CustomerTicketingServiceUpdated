import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
 
const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
 
    const goToLogin = () => {
        navigate('/login');
    };
 
    const handleScroll = () => {
        if (window.scrollY > 100) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    };
 
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
 
    return (
        <div className={`landing-container ${scrolled ? 'scrolled' : ''}`}>
            <div className="landing-flex">
                <img
                    src="/images/supprt_ticketng-System.png"
                    alt="Customer Support"
                    className="landing-image"
                />
                <div className="landing-content">
                    <h1 className="main-heading">Welcome to Teleassist</h1>
                    <p className="para1">Your trusted platform for all support needs</p>
                    <div className="button-section">
                        <button onClick={goToLogin} className="landing-button">Get Started</button>
                    </div>
                </div>
            </div>
 
            {/* About Us Section */}
            <div id="about-us" className="info-section">
                <h2>About Us</h2>
                <p>
                    Teleassist is a cutting-edge platform designed to streamline your customer support experience.
                    With a focus on efficiency and simplicity, we aim to help companies manage tickets, resolve issues,
                    and deliver excellent customer service with ease.
                </p>
            </div>
 
            {/* Contact Us Section */}
            <div id="contact-us" className="info-section">
                <h2>Contact Us</h2>
                <p>
                    Have questions or need support? Reach out to us at:
                </p>
                <p>Email: support@teleassist.com</p>
                <p>Phone: +123-456-7890</p>
            </div>
        </div>
    );
};
 
export default LandingPage;