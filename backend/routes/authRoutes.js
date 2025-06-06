import express from 'express';
import { signin, signup } from '../controllers/authcontroller.js';
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Define the routes
router.post('/signin', signin); // POST /api/auth/signin
router.post('/signup', signup); // POST /api/auth/signup

// Verify JWT token route
router.get('/verify', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Token is valid.' });
});




export default router;
