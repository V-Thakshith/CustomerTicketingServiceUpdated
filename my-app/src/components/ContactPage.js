import React from 'react';
import './ContactPage.css'; // Import the CSS file
 
const ContactPage = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Here’s how you can reach us:</p>
     
      <h2>Company Information</h2>
      <p><strong>Company Name:</strong> Teleassist</p>
      <p><strong>Email:</strong> teleassist@gmail.com</p>
      <p><strong>Phone:</strong> 9980765670</p>
     
      <h2>Working Hours</h2>
      <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
      <p>Saturday: 10:00 AM - 2:00 PM</p>
      <p>Sunday: Closed</p>
 
      <h2>Headquarters Location</h2>
      <p><strong>Address:</strong>gandhi nagar, city tech park, Bangalore, India</p>
 
      <h2>Follow Us</h2>
      <p>Stay updated by following us on our social media:</p>
      <ul>
        <li><a href="https://twitter.com/example">Twitter</a></li>
        <li><a href="https://facebook.com/example">Facebook</a></li>
        <li><a href="https://instagram.com/example">Instagram</a></li>
      </ul>
    </div>
  );
};
 
export default ContactPage;