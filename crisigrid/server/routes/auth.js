const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, assignedCampId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      assignedCampId: assignedCampId || null,
    });

    const savedUser = await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        role: savedUser.role, 
        assignedCampId: savedUser.assignedCampId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user object for response (exclude passwordHash)
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      assignedCampId: savedUser.assignedCampId,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        assignedCampId: user.assignedCampId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user object for response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCampId: user.assignedCampId,
      createdAt: user.createdAt,
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
});

module.exports = router;
