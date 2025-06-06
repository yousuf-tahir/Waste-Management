import { Link } from "react-router-dom"; 
import React from "react";
import './styles.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
      <img src={require('../assets/logo.webp')} alt="BIN BUDDY Logo" />
      <span className="company-name">
  <a href="http://localhost:3000" className="binBuddy-link">
    <span className="bin">Bin</span>
    <span className="buddy">Buddy</span>
  </a>
</span>
      </div>
      <ul className="nav-links">
        <li><a href="#schedule">Schedule</a></li>
        <li><a href="#news">News</a></li>
        <li><a href="http://localhost:3000/signin">Login</a></li>
        <li><a href="http://localhost:3000/AboutUs">About Us</a></li>
        <Link to="http://localhost:3000/complainForm">
        <li><button className="start-service">File Complain</button></li>
        </Link>
      </ul>
    </nav>
  );
};

export default Navbar;
