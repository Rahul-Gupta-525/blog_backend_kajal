const bcrypt = require('bcrypt');
const User = require('../models/users');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  try {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully", 
        name:name,
        email:email
     });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid data provided" });
    }
    res.status(500).json({ message: "internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "password is incorrect" });
    }
    console.log(user)
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: process.env.EXPIRY });
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {

    res.status(500).json({ message: "An error occurred during login" });
  }
};


