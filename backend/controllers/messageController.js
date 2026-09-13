const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

// @desc    Get list of conversations (most recent message per contact)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({ success: true, conversations: [] });
  }

  const userId = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0] },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'contact' },
    },
    { $unwind: '$contact' },
    {
      $project: {
        contact: { _id: 1, name: 1, username: 1, role: 1, avatarUrl: 1 },
        lastMessage: { content: 1, createdAt: 1, sender: 1 },
        unreadCount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, conversations });
});

// @desc    Get message thread with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getThread = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({ success: true, messages: [] });
  }

  if (!mongoose.isValidObjectId(otherUserId)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany({ sender: otherUserId, receiver: req.user._id, read: false }, { read: true });

  res.status(200).json({ success: true, messages });
});

// @desc    Send a message (also broadcast via socket.io from the socket handler)
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
  }
  if (receiverId === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot send a message to yourself' });
  }

  if (mongoose.connection.readyState !== 1) {
    const mockMsg = {
      _id: 'mock_msg_' + Date.now(),
      sender: { _id: req.user._id, name: req.user.name, username: req.user.username },
      receiver: receiverId,
      content: content.trim(),
      read: false,
      createdAt: new Date(),
    };
    const io = req.app.get('io');
    if (io) io.to(`user:${receiverId}`).emit('message:new', mockMsg);
    return res.status(201).json({ success: true, message: mockMsg });
  }

  const message = await Message.create({ sender: req.user._id, receiver: receiverId, content: content.trim() });
  const populated = await message.populate('sender', 'name username avatarUrl');

  const io = req.app.get('io');
  if (io) io.to(`user:${receiverId}`).emit('message:new', populated);

  const notif = await Notification.create({
    user: receiverId,
    type: 'message',
    message: `New message from ${req.user.name}`,
    link: '/messages',
  });
  emitToUser(req, receiverId, 'notification:new', notif);

  res.status(201).json({ success: true, message: populated });
});

module.exports = { getConversations, getThread, sendMessage };
