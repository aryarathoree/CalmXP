const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  console.log("Registration attempt:", { ...req.body, password: "[REDACTED]" });
  
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ msg: "Please provide all required fields" });
  }
  
  if (password.length < 6) {
    console.log("Validation failed: Password too short");
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Validation failed: Invalid email format");
    return res.status(400).json({ msg: "Please provide a valid email address" });
  }

  // Username validation
  if (username.length < 3) {
    console.log("Validation failed: Username too short");
    return res.status(400).json({ msg: "Username must be at least 3 characters" });
  }
  
  try {
    console.log("Checking for existing user...");
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        console.log("Registration failed: Email already exists");
        return res.status(400).json({ msg: "Email already exists" });
      }
      if (existingUser.username === username) {
        console.log("Registration failed: Username already exists");
        return res.status(400).json({ msg: "Username already exists" });
      }
    }

    console.log("Hashing password...");
    const hashed = await bcrypt.hash(password, 12);
    
    console.log("Creating new user...");
    const user = new User({ username, email, password: hashed });
    await user.save();
    
    console.log("User registered successfully:", { username, email });
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ msg: `${field} already exists` });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    
    res.status(500).json({ 
      msg: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("Login attempt for email:", req.body.email);
  
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    console.log("Login failed: Missing credentials");
    return res.status(400).json({ msg: "Please provide email and password" });
  }
  
  try {
    console.log("Looking up user...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("Verifying password...");
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Login failed: Invalid password");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("Generating token...");
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", user.username);
    res.json({ 
      token, 
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email,
        xp: user.xp,
        level: user.level
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET USER PROFILE (Protected route)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// VERIFY TOKEN (Protected route)
router.get("/verify", verifyToken, async (req, res) => {
  try {
    res.json({ 
      valid: true, 
      user: { 
        id: req.user._id,
        username: req.user.username, 
        email: req.user.email,
        xp: req.user.xp,
        level: req.user.level
      } 
    });
  } catch (err) {
    console.error("Verify token error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
