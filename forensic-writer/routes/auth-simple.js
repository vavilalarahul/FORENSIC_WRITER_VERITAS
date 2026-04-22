const express = require("express");
const bcrypt = require("bcrypt");
const transporter = require("../config/email");
const { otpStore, tempUserStore } = require("../utils/storage");

const router = express.Router();

// In-memory user storage for testing (replace with MongoDB later)
const users = [];

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
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
  } catch (emailError) {
    console.log("Email error (continuing anyway):", emailError.message);
  }

  return res.status(200).json({
    message: "OTP sent successfully",
    otp: otp // Include OTP in response for testing (remove in production)
  });
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

  const newUser = {
    ...tempUser,
    id: Date.now().toString(),
    isVerified: true
  };

  users.push(newUser);

  delete otpStore[email];
  delete tempUserStore[email];

  return res.status(200).json({
    message: "Account created successfully",
    user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
  });
});

router.post("/login", async (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password || !role) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const user = users.find(u => 
    (u.email === identifier || u.username === identifier) && u.role === role
  );

  if (!user) {
    return res.status(404).json({
      message: "User does not exist"
    });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      message: "Account not verified"
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid password"
    });
  }

  return res.status(200).json({
    message: "Login successful",
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

module.exports = router;
