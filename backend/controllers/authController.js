const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { users: mockUsers, toSafeUser } = require('../utils/mockStore');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, role, location, skills, bio } = req.body;
  const allowedRoles = ['volunteer', 'ngo', 'admin', 'agent'];
  const safeRole = allowedRoles.includes(role) ? role : 'volunteer';
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();

  if (mongoose.connection.readyState !== 1) {
    const existing = mockUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername
    );
    if (existing) {
      const field = existing.email.toLowerCase() === cleanEmail ? 'email' : 'username';
      return res.status(409).json({ success: false, message: `That ${field} is already registered` });
    }

    const newUser = {
      _id: 'mock_user_' + Date.now(),
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: safeRole,
      location: location || '',
      skills: Array.isArray(skills) ? skills : [],
      bio: bio || '',
      isActive: true,
      isSuspended: false,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    const token = generateToken(newUser._id, newUser.role);
    return res.status(201).json({ success: true, message: 'Account created successfully', token, user: toSafeUser(newUser) });
  }

  const existing = await User.findOne({
    $or: [{ email: cleanEmail }, { username: cleanUsername }],
  });
  if (existing) {
    const field = existing.email.toLowerCase() === cleanEmail ? 'email' : 'username';
    return res.status(409).json({ success: false, message: `That ${field} is already registered` });
  }

  const user = await User.create({
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    password,
    role: safeRole,
    location: location || '',
    skills: Array.isArray(skills) ? skills : [],
    bio: bio || '',
  });

  const token = generateToken(user._id, user.role);
  res.status(201).json({ success: true, message: 'Account created successfully', token, user: user.toSafeObject() });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const rawId = req.body.username || req.body.email || '';
  const identifier = rawId.trim().toLowerCase();
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Username/email and password are required' });
  }

  if (mongoose.connection.readyState !== 1) {
    const user = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({ success: true, message: 'Login successful', token, user: toSafeUser(user) });
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  res.status(200).json({ success: true, message: 'Login successful', token, user: user.toSafeObject() });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
