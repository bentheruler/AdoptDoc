const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/admin-test', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin access granted" });
});

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

  const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);

res.json({
  accessToken,
  refreshToken
});

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET CURRENT USER
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const verifyToken = require('../middleware/authMiddleware');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;