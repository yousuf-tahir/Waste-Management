import React from "react";
import "./styles.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Customer Support</h3>
          <ul>
            <li><button className="footer-link">Contact Us</button></li>
            <li><button className="footer-link">FAQ</button></li>
            <li><button className="footer-link">Report Waste</button></li>
            <li><button className="footer-link">Help Center</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Services</h3>
          <ul>
            <li><button className="footer-link">Waste Pickup</button></li>
            <li><button className="footer-link">Recycling Service</button></li>
            <li><button className="footer-link">Community Cleanups</button></li>
            <li><button className="footer-link">Sustainable Solutions</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><button className="footer-link">About Us</button></li>
            <li><button className="footer-link">Our Goals</button></li>
            <li><button className="footer-link">Careers</button></li>
            <li><button className="footer-link">News</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>More Info</h3>
          <ul>
            <li><button className="footer-link">Privacy Policy</button></li>
            <li><button className="footer-link">Terms of Use</button></li>
            <li><button className="footer-link">Sustainability</button></li>
            <li><button className="footer-link">Environmental Initiatives</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Bin Buddy &copy; 2025. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
