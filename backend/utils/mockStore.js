const bcrypt = require('bcryptjs');

// In-memory fallback dataset for demo/preview mode when MongoDB is offline
const users = [
  {
    _id: 'mock_admin_1',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@wastezero.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    location: 'Boston',
    address: '123 Harbor Way, Boston',
    skills: ['management', 'logistics'],
    bio: 'Platform Administrator for WasteZero',
    isActive: true,
    isSuspended: false,
    createdAt: new Date('2025-01-01'),
  },
  {
    _id: 'mock_ngo_1',
    name: 'GreenEarth NGO',
    username: 'greenearth',
    email: 'ngo@wastezero.com',
    passwordHash: bcrypt.hashSync('ngo12345', 10),
    role: 'ngo',
    location: 'Boston',
    address: '45 Green St, Boston',
    skills: ['education', 'advocacy'],
    bio: 'Dedicated to community cleanups and environmental restoration.',
    isActive: true,
    isSuspended: false,
    createdAt: new Date('2025-01-10'),
  },
  {
    _id: 'mock_volunteer_1',
    name: 'Ganesh Kumar',
    username: 'ganesh',
    email: 'ganesh@wastezero.com',
    passwordHash: bcrypt.hashSync('volunteer123', 10),
    role: 'volunteer',
    location: 'Hyderabad',
    address: '78 Banjara Hills, Hyderabad',
    skills: ['teamwork', 'physical stamina'],
    bio: 'Passionate about zero-waste living and recycling.',
    isActive: true,
    isSuspended: false,
    createdAt: new Date('2025-02-01'),
  },
  {
    _id: 'mock_agent_1',
    name: 'Pickup Agent One',
    username: 'agent1',
    email: 'agent1@wastezero.com',
    passwordHash: bcrypt.hashSync('agent12345', 10),
    role: 'agent',
    location: 'Boston',
    address: '12 Depot Ave, Boston',
    skills: ['heavy lifting', 'route planning'],
    bio: 'Certified waste collection and recycling routing agent.',
    isActive: true,
    isSuspended: false,
    createdAt: new Date('2025-02-15'),
  },
];

const opportunities = [
  {
    _id: 'mock_opp_1',
    ngo: { _id: 'mock_ngo_1', name: 'GreenEarth NGO', username: 'greenearth' },
    title: 'Beach Cleanup Drive',
    description: 'Join us for a day of cleaning up the shoreline and protecting marine life.',
    requiredSkills: ['teamwork', 'physical stamina'],
    wasteTypes: ['plastic', 'other'],
    duration: '4 hours',
    date: new Date('2025-06-20'),
    location: 'Brighton Beach, Boston',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
    spotsAvailable: 15,
    status: 'open',
    createdAt: new Date('2025-05-01'),
  },
  {
    _id: 'mock_opp_2',
    ngo: { _id: 'mock_ngo_1', name: 'GreenEarth NGO', username: 'greenearth' },
    title: 'Recycling Workshop',
    description: 'Teach community members about proper segregation and recycling techniques.',
    requiredSkills: ['communication'],
    wasteTypes: ['plastic', 'paper', 'glass'],
    duration: '2 hours',
    date: new Date('2025-06-15'),
    location: 'Community Center, Seattle',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    spotsAvailable: 25,
    status: 'open',
    createdAt: new Date('2025-05-10'),
  },
  {
    _id: 'mock_opp_3',
    ngo: { _id: 'mock_ngo_1', name: 'GreenEarth NGO', username: 'greenearth' },
    title: 'School Education Program',
    description: 'Visit local schools to raise youth awareness about modern waste management.',
    requiredSkills: ['public speaking'],
    wasteTypes: ['other'],
    duration: '3 hours',
    date: new Date('2025-07-10'),
    location: 'Various schools in Boston',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    spotsAvailable: 10,
    status: 'open',
    createdAt: new Date('2025-05-20'),
  },
];

const pickups = [
  {
    _id: 'mock_pickup_1',
    user: { _id: 'mock_volunteer_1', name: 'Ganesh Kumar', username: 'ganesh' },
    agent: { _id: 'mock_agent_1', name: 'Pickup Agent One', username: 'agent1' },
    category: 'plastic',
    weightEstimateKg: 8.5,
    actualWeightKg: 8.5,
    address: '78 Banjara Hills, Hyderabad',
    coordinates: { lat: 17.4156, lng: 78.4357 },
    scheduledTime: new Date(Date.now() + 86400000),
    status: 'assigned',
    notes: 'Please call before arrival.',
    createdAt: new Date(),
  },
  {
    _id: 'mock_pickup_2',
    user: { _id: 'mock_volunteer_1', name: 'Ganesh Kumar', username: 'ganesh' },
    agent: { _id: 'mock_agent_1', name: 'Pickup Agent One', username: 'agent1' },
    category: 'paper',
    weightEstimateKg: 14.0,
    actualWeightKg: 14.0,
    address: '78 Banjara Hills, Hyderabad',
    coordinates: { lat: 17.4156, lng: 78.4357 },
    scheduledTime: new Date(Date.now() - 172800000),
    status: 'completed',
    notes: 'Recycled cardboard bundles.',
    completedAt: new Date(Date.now() - 170000000),
    createdAt: new Date(Date.now() - 200000000),
  },
];

const applications = [];
const notifications = [
  {
    _id: 'mock_notif_1',
    user: 'mock_volunteer_1',
    type: 'pickup',
    message: 'Welcome to WasteZero! Schedule your first recyclable pickup today.',
    link: '/schedule-pickup',
    isRead: false,
    createdAt: new Date(),
  },
];

const adminLogs = [
  {
    _id: 'mock_log_1',
    admin: { _id: 'mock_admin_1', name: 'Admin User', username: 'admin' },
    action: 'System initialized in demo environment',
    targetType: 'system',
    timestamp: new Date(),
  },
];

function toSafeUser(user) {
  const copy = { ...user };
  delete copy.passwordHash;
  delete copy.password;
  copy.toSafeObject = function () {
    return toSafeUser(this);
  };
  return copy;
}

module.exports = {
  users,
  opportunities,
  pickups,
  applications,
  notifications,
  adminLogs,
  toSafeUser,
};
