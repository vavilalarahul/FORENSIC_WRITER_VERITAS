const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/email");
const { otpStore, tempUserStore } = require("../utils/storage");

const router = express.Router();

// Use server's existing User model
const User = require('../server/src/models/User');

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    tempUserStore[email] = {
      username,
      email,
      password: hashedPassword,
      role
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expiry: Date.now() + 5 * 60 * 1000
    };

    try {
      await transporter.sendMail({
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}` 
      });
      console.log("OTP sent to:", email);
    } catch (emailError) {
      console.log("Email error (continuing anyway):", emailError.message);
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      otp: otp // Include OTP in response for testing (remove in production)
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (Date.now() > record.expiry) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp.toString().trim()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const tempUser = tempUserStore[email];

  try {
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role
    });

    await newUser.save();

    delete otpStore[email];
    delete tempUserStore[email];

    return res.status(200).json({
      message: "Account created successfully",
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (error) {
    console.error("User creation error:", error);
    return res.status(500).json({ message: "Server error during account creation" });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password || !role) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist"
      });
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({
        message: "Role mismatch"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'forensic_writer_secret_key_2026',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// GET /users - Fetch all registered users for messaging
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email role");
    console.log("Found users for directory:", users.length);
    const formattedUsers = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      name: u.username // Fallback for components expecting 'name'
    }));
    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({ message: "Server error fetching users" });
  }
});

module.exports = router;
