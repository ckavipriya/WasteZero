const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Pickup = require('../models/Pickup');
const WasteStat = require('../models/WasteStat');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const User = require('../models/User');
const { opportunities: mockOpps, pickups: mockPickups } = require('../utils/mockStore');
const getDashboard = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      success: true,
      stats: {
        totalPickups: mockPickups.length,
        completedPickups: mockPickups.filter((p) => p.status === 'completed').length,
        recycledItems: 24,
        totalWeightKg: 85.5,
        co2SavedKg: 112.4,
        volunteerHours: 12,
      },
      recyclingBreakdown: [
        { category: 'plastic', weight: 35.5, percent: 42 },
        { category: 'paper', weight: 28.0, percent: 33 },
        { category: 'glass', weight: 12.0, percent: 14 },
        { category: 'e-waste', weight: 10.0, percent: 11 },
      ],
      upcomingPickups: mockPickups.filter((p) => p.status !== 'completed'),
      volunteerOpportunities: mockOpps.slice(0, 3),
    });
  }

  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  const pickupFilter = isAdmin ? {} : { user: userId };
  const statFilter = isAdmin ? {} : { user: userId };

  const [totalPickups, completedPickups, stats, upcomingPickups, opportunities] = await Promise.all([
    Pickup.countDocuments(pickupFilter),
    Pickup.countDocuments({ ...pickupFilter, status: 'completed' }),
    WasteStat.find(statFilter),
    Pickup.find({ ...pickupFilter, status: { $in: ['pending', 'assigned', 'in-progress'] } })
      .sort({ scheduledTime: 1 })
      .limit(5)
      .populate('agent', 'name'),
    Opportunity.find({ status: 'open' }).sort({ createdAt: -1 }).limit(3),
  ]);

  const totalWeight = stats.reduce((sum, s) => sum + s.weight, 0);
  const totalCO2 = stats.reduce((sum, s) => sum + (s.co2SavedKg || 0), 0);

  const breakdown = {};
  stats.forEach((s) => {
    breakdown[s.category] = (breakdown[s.category] || 0) + s.weight;
  });
  const breakdownPct = Object.entries(breakdown).map(([category, weight]) => ({
    category,
    weight,
    percent: totalWeight ? Math.round((weight / totalWeight) * 100) : 0,
  }));

  let volunteerHours = 0;
  if (!isAdmin) {
    const acceptedApps = await Application.find({ volunteer: userId, status: 'accepted' }).populate('opportunity', 'duration');
    volunteerHours = acceptedApps.length; // simplified metric
  }

  res.status(200).json({
    success: true,
    stats: {
      totalPickups,
      completedPickups,
      recycledItems: stats.length,
      totalWeightKg: +totalWeight.toFixed(2),
      co2SavedKg: +totalCO2.toFixed(2),
      volunteerHours,
    },
    recyclingBreakdown: breakdownPct,
    upcomingPickups,
    volunteerOpportunities: opportunities,
  });
});
module.exports = { getDashboard };
