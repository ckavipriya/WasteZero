const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, default: 'system' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminLog', adminLogSchema);
