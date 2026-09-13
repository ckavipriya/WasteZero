const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, trim: true }],
    wasteTypes: [{ type: String, trim: true }],
    duration: { type: String, default: '' },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    spotsAvailable: { type: Number, default: 10 },
    status: { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
