const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { users: mockUsers, toSafeUser } = require('../utils/mockStore');
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'wastezero_jwt_secret_key_default_2026';
    const decoded = jwt.verify(token, secret);

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      const found = mockUsers.find((u) => u._id === decoded.id || u.username === decoded.id) ||
                    mockUsers.find((u) => u.role === decoded.role);
      if (found) {
        user = toSafeUser(found);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
});


const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user ? req.user.role : 'unknown'}' is not permitted to access this resource`,
    });
  }
  next();
};

module.exports = { protect, authorize };
