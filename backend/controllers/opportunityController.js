const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const AdminLog = require('../models/AdminLog');
const { opportunities: mockOpps } = require('../utils/mockStore');

// @desc    Create opportunity (NGO/Admin)
// @route   POST /api/opportunities
// @access  Private (ngo, admin)
const createOpportunity = asyncHandler(async (req, res) => {
  const { title, description, requiredSkills, wasteTypes, duration, date, location, imageUrl, spotsAvailable } = req.body;

  if (mongoose.connection.readyState !== 1) {
    const opp = {
      _id: 'mock_opp_' + Date.now(),
      ngo: { _id: req.user._id, name: req.user.name, username: req.user.username },
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : String(requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      wasteTypes: Array.isArray(wasteTypes) ? wasteTypes : [],
      duration,
      date,
      location,
      imageUrl: imageUrl || '',
      spotsAvailable: spotsAvailable || null,
      status: 'open',
      createdAt: new Date(),
    };
    mockOpps.unshift(opp);
    return res.status(201).json({ success: true, message: 'Opportunity created successfully', opportunity: opp });
  }

  const opportunity = await Opportunity.create({
    ngo: req.user._id,
    title,
    description,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : String(requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    wasteTypes: Array.isArray(wasteTypes) ? wasteTypes : [],
    duration,
    date,
    location,
    imageUrl: imageUrl || '',
    spotsAvailable: spotsAvailable || null,
  });

  res.status(201).json({ success: true, message: 'Opportunity created successfully', opportunity });
});

// @desc    List opportunities with search/filter
// @route   GET /api/opportunities
// @access  Private
const getOpportunities = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    let result = [...mockOpps];
    if (req.query.status && req.query.status !== 'all') {
      result = result.filter((o) => o.status === req.query.status);
    }
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q)
      );
    }
    return res.status(200).json({ success: true, count: result.length, opportunities: result });
  }

  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.mine === 'true') filter.ngo = req.user._id;

  const opportunities = await Opportunity.find(filter).populate('ngo', 'name username').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: opportunities.length, opportunities });
});

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Private
const getOpportunityById = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const opp = mockOpps.find((o) => o._id === req.params.id) || mockOpps[0];
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    return res.status(200).json({ success: true, opportunity: opp, applicationCount: 2 });
  }

  const opportunity = await Opportunity.findById(req.params.id).populate('ngo', 'name username email');
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

  const applicationCount = await Application.countDocuments({ opportunity: opportunity._id });
  res.status(200).json({ success: true, opportunity, applicationCount });
});

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (owner ngo, admin)
const updateOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

  if (opportunity.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this opportunity' });
  }

  const fields = ['title', 'description', 'requiredSkills', 'wasteTypes', 'duration', 'date', 'location', 'imageUrl', 'status', 'spotsAvailable'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) opportunity[f] = req.body[f];
  });

  await opportunity.save();
  res.status(200).json({ success: true, message: 'Opportunity updated successfully', opportunity });
});

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (owner ngo, admin)
const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

  if (opportunity.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this opportunity' });
  }

  await Application.deleteMany({ opportunity: opportunity._id });
  await opportunity.deleteOne();

  if (req.user.role === 'admin') {
    await AdminLog.create({
      admin: req.user._id,
      action: `Deleted opportunity "${opportunity.title}"`,
      targetType: 'opportunity',
      targetId: opportunity._id,
    });
  }

  res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
});

module.exports = { createOpportunity, getOpportunities, getOpportunityById, updateOpportunity, deleteOpportunity };
