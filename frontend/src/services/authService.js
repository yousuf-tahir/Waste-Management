// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Replace with your backend URL

// Signup function
export const signup = (userData) => {
  return axios.post(`${API_URL}/signup`, userData);
};

// Signin function
export const signin = (userData) => {
  return axios.post(`${API_URL}/signin`, userData);
};
