import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Create a schema for the User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,   
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {  // Add role field
    type: String,
    default: 'user',  // Default value is 'user', but you can set it to 'admin' for admin users
  },
}, { timestamps: true });

// Hash password before saving it to the database
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next(); // Only hash the password if it's new or modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);  // Pass any error to the next middleware (or error handler)
  }
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

const User = mongoose.model("User", userSchema);

export default User;
