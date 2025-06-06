import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import './styles.css';

const Banner = () => {
  const navigate = useNavigate();

  const handleLocationClick = () => {
    navigate('/live-location');
  };

  return (
    <div className="banner">
      <div className="banner-text">
        <p className="sub-heading">Pakistan Disposal Services of Islamabad</p> 
        <h1>PAKISTAN DISPOSAL <br /> GARBAGE PICKUP</h1>
        <p>Residential trash pickup and business waste management services, along with dumpster rentals, in northern Pakistan. Based in Islamabad, we are proud to serve Rawalpindi, Lahore, Peshawar, Abbottabad, Faisalabad, and surrounding areas.</p>
        <div className="banner-buttons">
          <Link to="./complainForm">
            <button className="start-service">File Complain</button>
          </Link>
          <button className="request-quote" onClick={handleLocationClick}>Give Location</button>
        </div>
        <p className="contact-info">
          <span className="phone-number">📞 051-333-11144</span>
        </p>
      </div>
      <div className="banner-image">
        <img src={require("../assets/worker.jpg")} alt="Worker" className="circle-image" />
      </div>
    </div>
  );
};

export default Banner;
