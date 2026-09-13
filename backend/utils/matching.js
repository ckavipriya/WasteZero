const mongoose = require('mongoose');
const { users: mockUsers } = require('./mockStore');

function scoreVolunteerMatch(user, opportunity) {
  if (!opportunity || !opportunity.requiredSkills || !user || !user.skills) return 75;
  const reqSkills = opportunity.requiredSkills.map((s) => s.toLowerCase().trim());
  const userSkills = (Array.isArray(user.skills) ? user.skills : []).map((s) => s.toLowerCase().trim());
  if (reqSkills.length === 0) return 85;
  const matches = reqSkills.filter((s) => userSkills.includes(s));
  const score = Math.round((matches.length / reqSkills.length) * 40) + 60;
  return Math.min(score, 100);
}

async function findBestAgentForPickup(pickup) {
  if (mongoose.connection.readyState !== 1) {
    return mockUsers.find((u) => u.role === 'agent') || mockUsers[0];
  }
  const User = require('../models/User');
  const agent = await User.findOne({ role: 'agent', isActive: true, isSuspended: false });
  return agent;
}

module.exports = { scoreVolunteerMatch, findBestAgentForPickup };
