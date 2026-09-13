const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Pickup = require('../models/Pickup');
const WasteStat = require('../models/WasteStat');
const Notification = require('../models/Notification');
const { findBestAgentForPickup } = require('../utils/matching');
const { pickups: mockPickups, users: mockUsers } = require('../utils/mockStore');

const CO2_FACTOR = { plastic: 1.5, paper: 0.9, glass: 0.3, organic: 0.2, 'e-waste': 2.5, metal: 1.8, other: 0.5 };

const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

const createPickup = asyncHandler(async (req, res) => {
  const { category, weightEstimateKg, address, coordinates, scheduledTime, notes, photos } = req.body;

  if (new Date(scheduledTime).getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
  }

  if (mongoose.connection.readyState !== 1) {
    const agent = mockUsers.find((u) => u.role === 'agent') || {
      _id: 'mock_agent_1',
      name: 'Pickup Agent One',
      username: 'agent1',
    };
    const newPickup = {
      _id: 'mock_pickup_' + Date.now(),
      user: { _id: req.user._id, name: req.user.name, username: req.user.username },
      agent: { _id: agent._id, name: agent.name, username: agent.username },
      category,
      weightEstimateKg: weightEstimateKg || null,
      address,
      coordinates: coordinates || {},
      scheduledTime,
      status: 'assigned',
      notes: notes || '',
      photos: Array.isArray(photos) ? photos : [],
      createdAt: new Date(),
    };
    mockPickups.unshift(newPickup);
    return res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      pickup: newPickup,
    });
  }

  const pickup = await Pickup.create({
    user: req.user._id,
    category,
    weightEstimateKg: weightEstimateKg || null,
    address,
    coordinates: coordinates || {},
    scheduledTime,
    notes: notes || '',
    photos: Array.isArray(photos) ? photos : [],
  });

  const agent = await findBestAgentForPickup(pickup);
  if (agent) {
    pickup.agent = agent._id;
    pickup.status = 'assigned';
    await pickup.save();

    const notif = await Notification.create({
      user: agent._id,
      type: 'pickup',
      message: `You've been assigned a new ${category} pickup at ${address}`,
      link: `/schedule-pickup`,
    });
    emitToUser(req, agent._id, 'notification:new', notif);
  }

  const notif = await Notification.create({
    user: req.user._id,
    type: 'pickup',
    message: agent
      ? `Your pickup has been scheduled and an agent has been assigned.`
      : `Your pickup was scheduled. We'll assign an agent shortly.`,
    link: '/schedule-pickup',
  });
  emitToUser(req, req.user._id, 'notification:new', notif);

  const populated = await pickup.populate('agent', 'name username');
  res.status(201).json({ success: true, message: 'Pickup scheduled successfully', pickup: populated });
});

const getPickups = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    let result = [...mockPickups];
    if (req.query.status) {
      result = result.filter((p) => p.status === req.query.status);
    }
    return res.status(200).json({ success: true, count: result.length, pickups: result });
  }

  const filter = {};
  if (req.user.role === 'admin') {
    // no filter — admins see all
  } else if (req.user.role === 'agent') {
    filter.agent = req.user._id;
  } else {
    filter.user = req.user._id;
  }
  if (req.query.status) filter.status = req.query.status;

  const pickups = await Pickup.find(filter)
    .populate('user', 'name username email')
    .populate('agent', 'name username')
    .sort({ scheduledTime: 1 });

  res.status(200).json({ success: true, count: pickups.length, pickups });
});

const getPickupById = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const pickup = mockPickups.find((p) => p._id === req.params.id) || mockPickups[0];
    if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });
    return res.status(200).json({ success: true, pickup });
  }

  const pickup = await Pickup.findById(req.params.id).populate('user', 'name username email').populate('agent', 'name username');
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });

  const isOwner = pickup.user._id.toString() === req.user._id.toString();
  const isAgent = pickup.agent && pickup.agent._id.toString() === req.user._id.toString();
  if (!isOwner && !isAgent && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this pickup' });
  }

  res.status(200).json({ success: true, pickup });
});

const updatePickupStatus = asyncHandler(async (req, res) => {
  const { status, actualWeightKg } = req.body;
  const validStatuses = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });

  const isAgent = pickup.agent && pickup.agent.toString() === req.user._id.toString();
  if (!isAgent && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this pickup' });
  }

  pickup.status = status;
  if (status === 'completed') {
    pickup.completedAt = new Date();
    pickup.actualWeightKg = actualWeightKg || pickup.weightEstimateKg || 0;

    const weight = pickup.actualWeightKg || 0;
    const co2 = +(weight * (CO2_FACTOR[pickup.category] || 0.5)).toFixed(2);
    await WasteStat.create({ user: pickup.user, pickup: pickup._id, category: pickup.category, weight, co2SavedKg: co2 });

    const notif = await Notification.create({
      user: pickup.user,
      type: 'pickup',
      message: `Your ${pickup.category} pickup was completed. Thanks for recycling!`,
      link: '/dashboard',
    });
    emitToUser(req, pickup.user, 'notification:new', notif);
  }

  await pickup.save();
  res.status(200).json({ success: true, message: 'Pickup status updated', pickup });
});


const cancelPickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) return res.status(404).json({ success: false, message: 'Pickup not found' });

  const isOwner = pickup.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to cancel this pickup' });
  }
  if (pickup.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Cannot cancel a completed pickup' });
  }

  pickup.status = 'cancelled';
  await pickup.save();
  res.status(200).json({ success: true, message: 'Pickup cancelled' });
});

module.exports = { createPickup, getPickups, getPickupById, updatePickupStatus, cancelPickup };
