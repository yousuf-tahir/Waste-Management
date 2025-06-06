import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();


import authRoutes from './routes/authRoutes.js';


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));



//api ki endpoint  
app.use('/api/auth', authRoutes);
// Example Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
