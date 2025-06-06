import Navbar from '../components/navbar';
import Footer from '../components/footer';
import './style.css';
import React, { useState } from 'react';
import { signin } from '../services/authService'; // Import the signin function
import { Link } from 'react-router-dom'; // Import Link for navigation

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null); // To store error messages
  const [loading, setLoading] = useState(false); // To show loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError('Both fields are required.');
      return false;
    }

    // Email validation (basic check)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    setError(null); // Clear error if validation passes
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await signin(formData);
      console.log('Signin successful:', response.data);
      // Save JWT token to localStorage or sessionStorage
      localStorage.setItem('token', response.data.token);
      // Redirect to dashboard or homepage
    } catch (err) {
      setError('Signin failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
    <div>
    <Navbar/>
</div>
    <div className="signin-container">
      <div className="signin-form-container">
        <h2 className="signin-heading">Login</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-input-group">
            <label className="signin-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="signin-input"
              required
            />
          </div>
          <div className="signin-input-group">
            <label className="signin-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="signin-input"
              required
            />
          </div>
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Signin'}
          </button>
          {error && <p className="signin-error">{error}</p>}
        </form>
        <p className="register-message">
          Not a user?{' '}
          <Link to="/signup" className="register-link">
            Register now
          </Link>
        </p>
      </div>
    </div>
     <div>
     <Footer/>
 </div>
 </>
  );
};

export default Signin;
