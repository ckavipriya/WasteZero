const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Pickup = require('../models/Pickup');
const Application = require('../models/Application');
const AdminLog = require('../models/AdminLog');
const { users: mockUsers, opportunities: mockOpps, pickups: mockPickups, applications: mockApps, adminLogs: mockLogs, toSafeUser } = require('../utils/mockStore');
const getStats = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: mockUsers.length,
        totalVolunteers: mockUsers.filter((u) => u.role === 'volunteer').length,
        totalNgos: mockUsers.filter((u) => u.role === 'ngo').length,
        totalOpportunities: mockOpps.length,
        openOpportunities: mockOpps.filter((o) => o.status === 'open').length,
        totalPickups: mockPickups.length,
        completedPickups: mockPickups.filter((p) => p.status === 'completed').length,
        totalApplications: mockApps.length,
        suspendedUsers: mockUsers.filter((u) => u.isSuspended).length,
      },
    });
  }
  const [totalUsers, totalVolunteers, totalNgos, totalOpportunities, openOpportunities, totalPickups, completedPickups, totalApplications, suspendedUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'ngo' }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'open' }),
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: 'completed' }),
      Application.countDocuments(),
      User.countDocuments({ isSuspended: true }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalVolunteers,
      totalNgos,
      totalOpportunities,
      openOpportunities,
      totalPickups,
      completedPickups,
      totalApplications,
      suspendedUsers,
    },
  });
});
const getAllUsers = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    let result = mockUsers.map(toSafeUser);
    if (req.query.role) result = result.filter((u) => u.role === req.query.role);
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return res.status(200).json({ success: true, count: result.length, users: result });
  }
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

const toggleSuspendUser = asyncHandler(async (req, res) => {
  const { suspend, reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot suspend an admin account' });
  }

  user.isSuspended = !!suspend;
  user.suspendedReason = suspend ? reason || 'Violation of platform policy' : '';
  await user.save();

  await AdminLog.create({
    admin: req.user._id,
    action: `${suspend ? 'Suspended' : 'Reinstated'} user ${user.username}`,
    targetUser: user._id,
    targetType: 'user',
    targetId: user._id,
  });

  res.status(200).json({ success: true, message: `User ${suspend ? 'suspended' : 'reinstated'} successfully`, user: user.toSafeObject() });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
  }

  await user.deleteOne();
  await AdminLog.create({
    admin: req.user._id,
    action: `Deleted user ${user.username}`,
    targetType: 'user',
    targetId: user._id,
  });

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});



const getLogs = asyncHandler(async (req, res) => {
  const logs = await AdminLog.find().populate('admin', 'name username').sort({ timestamp: -1 }).limit(200);
  res.status(200).json({ success: true, logs });
});


const getReport = asyncHandler(async (req, res) => {
  const [users, opportunities, pickups, applications] = await Promise.all([
    User.find().select('name username email role createdAt isSuspended'),
    Opportunity.find().select('title status location createdAt'),
    Pickup.find().select('category status scheduledTime createdAt'),
    Application.find().select('status createdAt'),
  ]);

  res.status(200).json({
    success: true,
    generatedAt: new Date(),
    report: { users, opportunities, pickups, applications },
  });
});

module.exports = { getStats, getAllUsers, toggleSuspendUser, deleteUser, getLogs, getReport };
