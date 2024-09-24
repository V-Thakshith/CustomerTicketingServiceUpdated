import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Custom styles for the landing page

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 100) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    };

    const goToLogin = () => {
        navigate('/login');
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
                    <p>Your trusted platform for all support needs</p>
                    <div className="button-section">
                        <button onClick={goToLogin} className="landing-button">Get Started</button>
                    </div>
                </div>
            </div>
 
            {/* About Us Section */}
            <div id="about-us" className="info-section">
                <h2>About Us</h2>
                <p>
                Founded in 2024, TelecomCo has become a prominent player in the telecommunications industry, known for our commitment to innovation and customer satisfaction. We have successfully launched numerous products that streamline communication and enhance support for businesses. Our dedication to excellence has earned us several awards for outstanding service. As we continue to evolve, we remain focused on expanding our offerings and reinforcing our position as a trusted telecom partner.
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
