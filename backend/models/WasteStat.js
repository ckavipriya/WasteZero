const mongoose = require('mongoose');

const wasteStatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' },
    category: { type: String, required: true },
    weight: { type: Number, required: true },
    co2SavedKg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WasteStat', wasteStatSchema);
