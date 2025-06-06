import './style.css';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import React, { useState } from 'react';
import { signup } from '../services/authService'; // Import the signup function
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null); // To store error messages
  const [loading, setLoading] = useState(false); // To show loading state
  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return false;
    }

    // Email validation (basic check)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Password validation (minimum 8 characters, at least one number and one special character)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include a number and a special character.');
      return false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
      const response = await signup(formData);
      console.log('Signup successful:', response.data);
      // Redirect to the Signin page after successful signup
      navigate('/signin');
    } catch (err) {
      setError('Signup failed. Please try again.');
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
    <div className="signup-container">
      <div className="signup-form-container">
        <h2 className="signup-heading">Create an Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-input-group">
            <label className="signup-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="signup-input"
              required
            />
          </div>
          <div className="signup-input-group">
            <label className="signup-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="signup-input"
              required
            />
          </div>
          <div className="signup-input-group">
            <label className="signup-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="signup-input"
              required
            />
          </div>
          <div className="signup-input-group">
            <label className="signup-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="signup-input"
              required
            />
          </div>
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Signing up...' : 'Signup'}
          </button>
          {error && <p className="signup-error">{error}</p>}
        </form>
         <p className="register-message">
                  Already a user?{' '}
                  <Link to="/signin" className="register-link">
                   Login Now
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

export default Signup;
