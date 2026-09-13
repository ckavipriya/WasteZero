const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: {
      type: String,
      enum: ['plastic', 'paper', 'glass', 'organic', 'e-waste', 'metal', 'other'],
      required: true,
    },
    weightEstimateKg: { type: Number },
    actualWeightKg: { type: Number },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    photos: [{ type: String }],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pickup', pickupSchema);
