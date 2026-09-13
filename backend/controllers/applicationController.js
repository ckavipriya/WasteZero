const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const { scoreVolunteerMatch } = require('../utils/matching');
const { applications: mockApps, opportunities: mockOpps } = require('../utils/mockStore');

const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

const applyToOpportunity = asyncHandler(async (req, res) => {
  const { opportunityId, message } = req.body;

  if (mongoose.connection.readyState !== 1) {
    const opp = mockOpps.find((o) => o._id === opportunityId) || mockOpps[0];
    const newApp = {
      _id: 'mock_app_' + Date.now(),
      opportunity: opp,
      volunteer: { _id: req.user._id, name: req.user.name, username: req.user.username, email: req.user.email, skills: req.user.skills },
      message: message || '',
      matchScore: 85,
      status: 'pending',
      createdAt: new Date(),
    };
    mockApps.unshift(newApp);
    return res.status(201).json({ success: true, message: 'Application submitted successfully', application: newApp });
  }

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
  if (opportunity.status !== 'open') {
    return res.status(400).json({ success: false, message: 'This opportunity is no longer accepting applications' });
  }

  const existing = await Application.findOne({ opportunity: opportunityId, volunteer: req.user._id });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already applied to this opportunity' });
  }

  const matchScore = scoreVolunteerMatch(req.user, opportunity);
  const application = await Application.create({
    opportunity: opportunityId,
    volunteer: req.user._id,
    message: message || '',
    matchScore,
  });

  const notif = await Notification.create({
    user: opportunity.ngo,
    type: 'application',
    message: `${req.user.name} applied to "${opportunity.title}"`,
    link: `/opportunities/${opportunity._id}`,
  });
  emitToUser(req, opportunity.ngo, 'notification:new', notif);

  res.status(201).json({ success: true, message: 'Application submitted successfully', application });
});


const getApplications = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({ success: true, count: mockApps.length, applications: mockApps });
  }

  let filter = {};
  if (req.user.role === 'volunteer') {
    filter.volunteer = req.user._id;
  } else if (req.user.role === 'ngo') {
    const myOpportunities = await Opportunity.find({ ngo: req.user._id }).select('_id');
    filter.opportunity = { $in: myOpportunities.map((o) => o._id) };
  }
  if (req.query.opportunityId) filter.opportunity = req.query.opportunityId;

  const applications = await Application.find(filter)
    .populate('opportunity', 'title location date status')
    .populate('volunteer', 'name username email skills')
    .sort({ matchScore: -1, createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const application = await Application.findById(req.params.id).populate('opportunity');
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (application.opportunity.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
  }
  application.status = status;
  await application.save();

  const notif = await Notification.create({
    user: application.volunteer,
    type: 'application',
    message: `Your application to "${application.opportunity.title}" was ${status}`,
    link: `/opportunities/${application.opportunity._id}`,
  });
  emitToUser(req, application.volunteer, 'notification:new', notif);

  res.status(200).json({ success: true, message: `Application ${status}`, application });
});

module.exports = { applyToOpportunity, getApplications, updateApplicationStatus };
