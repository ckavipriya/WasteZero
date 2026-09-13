const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { users: mockUsers, toSafeUser } = require('../utils/mockStore');

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, location, skills, bio, address, avatarUrl, role, phone, preferredContactMethod } = req.body;

  if (mongoose.connection.readyState !==1){
    const user = mockUsers.find((u) => u._id === req.user._id) || req.user;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (location !== undefined) user.location = location;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (preferredContactMethod !== undefined) user.preferredContactMethod = preferredContactMethod;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    return res.status(200).json({ success: true, message: 'Profile updated successfully', user: toSafeUser(user) });
  }

  if (email && email.toLowerCase() !== req.user.email) {
    const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (taken) return res.status(409).json({ success: false, message: 'That email is already in use' });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (location !== undefined) updates.location = location;
  if (address !== undefined) updates.address = address;
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (role !== undefined) updates.role = role;
  if (phone !== undefined) updates.phone = phone;
  if (preferredContactMethod !== undefined) updates.preferredContactMethod = preferredContactMethod;
  if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean);

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: 'Profile updated successfully', user: user.toSafeObject() });
});


const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});


const getUserById = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const user = mockUsers.find((u) => u._id === req.params.id) || mockUsers[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user: toSafeUser(user) });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

const listUsers = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    let result = mockUsers.map(toSafeUser);
    if (req.query.role) result = result.filter((u) => u.role === req.query.role);
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    return res.status(200).json({ success: true, count: result.length, users: result });
  }

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { username: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).select('-password').limit(100);
  res.status(200).json({ success: true, count: users.length, users });
});

module.exports = { updateProfile, changePassword, getUserById, listUsers };
