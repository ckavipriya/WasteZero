const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const { notifications: mockNotifs } = require('../utils/mockStore');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({ success: true, notifications: mockNotifs, unreadCount: mockNotifs.filter((n) => !n.read).length });
  }

  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.status(200).json({ success: true, notifications, unreadCount });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.status(200).json({ success: true, notification: notif });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
