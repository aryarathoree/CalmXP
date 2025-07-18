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

    // Helper function to calculate level from XP
    const calculateLevel = (xp) => {
      // Level progression: Level 1 = 0-99 XP, Level 2 = 100-199 XP, etc.
      return Math.floor(xp / 100) + 1;
    };

    // Daily XP and Check-in Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    let dailyXpEarned = false;
    let isFirstCheckInToday = false;
    
    // Check if user hasn't checked in today
    if (!user.lastCheckIn || user.lastCheckIn < today) {
      console.log("Daily check-in: Adding +10 XP for user:", user.username);
      
      // Add daily XP
      const oldLevel = user.level;
      user.xp += 10;
      user.lastCheckIn = today;
      
      // Calculate new level
      const newLevel = calculateLevel(user.xp);
      user.level = newLevel;
      
      // Initialize checkIns array if it doesn't exist
      if (!user.checkIns) {
        user.checkIns = [];
      }
      
      // Add today's check-in
      user.checkIns.push(today);
      
      // Save the user with updated XP and check-in
      await user.save();
      
      dailyXpEarned = true;
      isFirstCheckInToday = true;
      console.log("Daily check-in completed. New XP total:", user.xp);
      if (newLevel > oldLevel) {
        console.log(`Level Up! User ${user.username} leveled up from ${oldLevel} to ${newLevel}`);
      }
    } else {
      console.log("User already checked in today:", user.username);
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
      },
      dailyCheckIn: {
        earned: dailyXpEarned,
        xpGained: dailyXpEarned ? 10 : 0,
        isFirstToday: isFirstCheckInToday
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

// GET CHECK-IN DATA FOR CURRENT MONTH (Protected route)
router.get("/checkins", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get current month start and end dates
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Filter check-ins for current month
    const monthlyCheckIns = user.checkIns ? user.checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn);
      return checkInDate >= startOfMonth && checkInDate <= endOfMonth;
    }) : [];

    // Format check-ins as array of day numbers for easier frontend handling
    const checkedDays = monthlyCheckIns.map(checkIn => {
      return new Date(checkIn).getDate();
    });

    // Check if user has checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasCheckedInToday = user.lastCheckIn && user.lastCheckIn >= today;

    res.json({
      currentMonth: {
        year,
        month: month + 1, // JavaScript months are 0-indexed, so add 1
        checkedDays,
        totalCheckIns: checkedDays.length,
        hasCheckedInToday
      },
      user: {
        id: user._id,
        username: user.username,
        xp: user.xp,
        level: user.level,
        totalCheckIns: user.checkIns ? user.checkIns.length : 0
      }
    });
  } catch (err) {
    console.error("Check-ins error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
