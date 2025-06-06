
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Make sure to import the correct path to your User model

// Signup API (register a new user)
export const signup = async (req, res) => {
  try {
    // Get the user data from the request body
    const { username, email, password } = req.body;

    // Check if user data is provided
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide all user details",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);


    // Create and save the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Save the hashed password
    });
   
    await newUser.save();

    return res.status(200).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
//sign in api
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Create the JWT token with role included
    const token = jwt.sign(
      { id: user._id, role: user.role },  // Add the 'role' field to the JWT payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Signin successful',
      token,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
