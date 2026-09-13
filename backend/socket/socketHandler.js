const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const { users: mockUsers, toSafeUser } = require('../utils/mockStore');

// Authenticates each socket connection using the same JWT as the REST API,
// then joins the socket to a per-user room so events can be targeted precisely.
function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const secret = process.env.JWT_SECRET || 'wastezero_jwt_secret_key_default_2026';
      const decoded = jwt.verify(token, secret);

      let user;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id);
      } else {
        const found = mockUsers.find((u) => u._id === decoded.id || u.username === decoded.id) ||
                      mockUsers.find((u) => u.role === decoded.role);
        if (found) user = toSafeUser(found);
      }

      if (!user || user.isSuspended) return next(new Error('Not authorized'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    io.emit('presence:online', { userId });

    socket.on('typing', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing', { senderId: userId });
    });

    socket.on('message:send', async ({ receiverId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          return callback?.({ success: false, message: 'Message cannot be empty' });
        }
        const message = await Message.create({ sender: userId, receiver: receiverId, content: content.trim() });
        const populated = await message.populate('sender', 'name username avatarUrl');

        io.to(`user:${receiverId}`).emit('message:new', populated);
        io.to(`user:${userId}`).emit('message:new', populated);
        callback?.({ success: true, message: populated });
      } catch (err) {
        callback?.({ success: false, message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      io.emit('presence:offline', { userId });
    });
  });
}

module.exports = initSocket;
