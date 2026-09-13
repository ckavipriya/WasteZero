import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Award,
  CheckCircle2,
  Save,
  Shield,
  Truck,
  Building2,
  Sparkles,
  Clock,
  Calendar,
  Recycle,
  Filter,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  FileText,
  BadgeCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { userApi, pickupApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import UserAchievements from '../components/UserAchievements';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'history' | 'role' | 'security'

  // Contact details form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [preferredContactMethod, setPreferredContactMethod] = useState(user?.preferredContactMethod || 'WhatsApp');
  const [location, setLocation] = useState(user?.location || 'Banjara Hills, Hyderabad');
  const [address, setAddress] = useState(user?.address || '78 Green Avenue, Sector 4');
  const [bio, setBio] = useState(user?.bio || 'Passionate about urban zero-waste recycling and community composting.');
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(', ') : 'Sorting, Plastic Audit, Community Outreach');
  const [savingProfile, setSavingProfile] = useState(false);

  // Role preference form
  const [selectedRole, setSelectedRole] = useState(user?.role || 'volunteer');
  const [savingRole, setSavingRole] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Past collection history
  const [historyPickups, setHistoryPickups] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'completed' | 'in-progress'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await pickupApi.getAll();
      if (res.data?.success && res.data.pickups) {
        setHistoryPickups(res.data.pickups);
      } else {
        setHistoryPickups(getDefaultMockHistory());
      }
    } catch {
      setHistoryPickups(getDefaultMockHistory());
    } finally {
      setHistoryLoading(false);
    }
  };

  const getDefaultMockHistory = () => [
    {
      _id: 'pick-hist-1',
      category: 'plastic',
      weightEstimateKg: 8.5,
      address: '78 Green Avenue, Sector 4, Hyderabad',
      status: 'completed',
      createdAt: '2026-09-08T10:30:00Z',
      ecoPoints: 102,
      agentName: 'Ramesh Kumar (Agent #4)',
      photos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=300&q=80'],
    },
    {
      _id: 'pick-hist-2',
      category: 'paper',
      weightEstimateKg: 14.0,
      address: '78 Green Avenue, Sector 4, Hyderabad',
      status: 'completed',
      createdAt: '2026-08-28T14:15:00Z',
      ecoPoints: 168,
      agentName: 'Sunil V. (Agent #2)',
      photos: [],
    },
    {
      _id: 'pick-hist-3',
      category: 'e-waste',
      weightEstimateKg: 4.2,
      address: '78 Green Avenue, Sector 4, Hyderabad',
      status: 'in-progress',
      createdAt: '2026-09-11T09:00:00Z',
      ecoPoints: 50,
      agentName: 'Agent One',
      photos: [],
    },
  ];

  // Save Contact Details
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await userApi.updateProfile({
        name,
        email,
        phone,
        preferredContactMethod,
        location,
        address,
        bio,
        skills: skillsArray,
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        toast.success('Contact details and location saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update contact details');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Role Preference
  const handleUpdateRole = async (newRoleValue) => {
    const roleToApply = newRoleValue || selectedRole;
    setSavingRole(true);
    try {
      const res = await userApi.updateProfile({ role: roleToApply });
      if (res.data?.success) {
        updateUser(res.data.user);
        setSelectedRole(roleToApply);
        toast.success(`Account role preference set to ${roleToApply.toUpperCase()}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account role');
    } finally {
      setSavingRole(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await userApi.changePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Security password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Filtered History
  const filteredHistory = historyPickups.filter((p) => {
    if (historyFilter === 'completed') return p.status === 'completed';
    if (historyFilter === 'in-progress') return p.status === 'assigned' || p.status === 'in-progress' || p.status === 'pending';
    return true;
  });

  const totalRecycledWeight = historyPickups
    .filter((p) => p.status === 'completed')
    .reduce((acc, curr) => acc + (curr.weightEstimateKg || 5), 0);

  const totalPointsEarned = Math.round(totalRecycledWeight * 12);

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'admin':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      case 'agent':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'ngo':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white text-emerald-800 text-3xl font-extrabold flex items-center justify-center shadow-lg border-2 border-emerald-400 shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-lg text-white shadow-xs">
              <BadgeCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{user?.name}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeStyle(user?.role)}`}>
                {user?.role}
              </span>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm">@{user?.username} • {user?.email}</p>
            <div className="flex items-center gap-4 text-xs text-white/80 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" /> {location}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {totalPointsEarned} EcoPoints
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs self-stretch md:self-auto justify-around">
          <div className="text-center px-3">
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-bold text-white">{historyPickups.filter((p) => p.status === 'completed').length}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-3">
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">Total Recycled</span>
            <span className="text-xl font-bold text-emerald-300">{totalRecycledWeight} <span className="text-xs font-normal">kg</span></span>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Contact Details & Address</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Past Collection History</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
            {historyPickups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Eco Badges & Achievements</span>
        </button>

        <button
          onClick={() => setActiveTab('role')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'role'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account Role Preference</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Passwords</span>
        </button>
      </div>

      {/* TAB 1: CONTACT DETAILS & ADDRESS FORM */}
      {activeTab === 'contact' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Personal Contact Details & Doorstep Logistics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your primary contact info, default pickup address, and preferred dispatch notifications.
            </p>
          </div>

          <form onSubmit={handleUpdateContact} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mobile / Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Preferred Contact Channel
                </label>
                <select
                  value={preferredContactMethod}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="WhatsApp">WhatsApp Instant Alert</option>
                  <option value="Phone Call">Phone Call Before Arrival</option>
                  <option value="SMS">SMS Notification</option>
                  <option value="Email">Email Dispatch Summary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Zone / Locality Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Banjara Hills, Hyderabad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Default Doorstep Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 78 Green Avenue, Flat 402"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Bio / Waste Sorting Specialization
              </label>
              <textarea
                rows={3}
                placeholder="Share your waste reduction goals or logistics instructions for pickup agents..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Volunteer Skills / Badges (Comma Separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {savingProfile ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                <span>Save Contact Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PAST COLLECTION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Past Collection & Pickup History</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verified audit record of your scheduled doorstep waste collections and earned EcoPoints.
              </p>
            </div>

            {/* History Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  historyFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({historyPickups.length})
              </button>
              <button
                onClick={() => setHistoryFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  historyFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Completed ({historyPickups.filter((p) => p.status === 'completed').length})
              </button>
              <button
                onClick={() => setHistoryFilter('in-progress')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  historyFilter === 'in-progress'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Active
              </button>
            </div>
          </div>

          {/* History List */}
          {historyLoading ? (
            <div className="py-12 text-center text-slate-400">Loading collection history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No past collections match the selected filter.</div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-emerald-300"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize text-sm sm:text-base">
                        {item.category} Waste Pickup
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        {item.weightEstimateKg || 5} kg
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {item.agentName && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Truck className="w-3.5 h-3.5" />
                          {item.agentName}
                        </span>
                      )}
                    </div>

                    {/* Attached Verification Photos */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Snaps:
                        </span>
                        {item.photos.map((img, i) => (
                          <img key={i} src={img} alt="Waste snap" className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Earned Points</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> +{item.ecoPoints || Math.round((item.weightEstimateKg || 5) * 12)} Pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ECO BADGES & ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <UserAchievements
          userStats={{
            totalCollections: historyPickups.length || 18,
            totalWeightKg: totalRecycledWeight || 84.5,
            co2SavedKg: (totalRecycledWeight * 1.38).toFixed(1),
            monthlyVolumeKg: 72.0,
            ngoEventsAttended: 4,
            plasticWeightKg: 32.0,
          }}
        />
      )}

      {/* TAB 4: ACCOUNT ROLE PREFERENCES */}
      {activeTab === 'role' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Platform Role & Account Permissions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your primary ecosystem role preference to customize your platform dashboard capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Volunteer */}
            <div
              onClick={() => setSelectedRole('volunteer')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                selectedRole === 'volunteer'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Eco Volunteer</h3>
                    <p className="text-xs text-slate-500">Resident / Resident Recycler</p>
                  </div>
                </div>
                {selectedRole === 'volunteer' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Schedule doorstep waste pickups, track personal CO₂ impact, apply to NGO community cleanup drives, and earn EcoPoints rewards.
              </p>
            </div>

            {/* Agent */}
            <div
              onClick={() => setSelectedRole('agent')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                selectedRole === 'agent'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Pickup Agent</h3>
                    <p className="text-xs text-slate-500">Logistics & Route Dispatcher</p>
                  </div>
                </div>
                {selectedRole === 'agent' && (
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Access the interactive visual dispatch route map, accept doorstep collection routes, and verify waste weights on-site.
              </p>
            </div>

            {/* NGO Partner */}
            <div
              onClick={() => setSelectedRole('ngo')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                selectedRole === 'ngo'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">NGO Drive Organizer</h3>
                    <p className="text-xs text-slate-500">Community Partner & Leader</p>
                  </div>
                </div>
                {selectedRole === 'ngo' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Post community waste cleanup drives, recruit platform volunteers, and request bulk logistics trucks for community events.
              </p>
            </div>

            {/* Admin */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                selectedRole === 'admin'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Platform Administrator</h3>
                    <p className="text-xs text-slate-500">System Oversight & Governance</p>
                  </div>
                </div>
                {selectedRole === 'admin' && (
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Manage user permissions, audit system dispatches, verify NGO listings, and inspect municipal waste analytics.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleUpdateRole(selectedRole)}
              disabled={savingRole}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {savingRole ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              <span>Apply & Save Role Preference</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & PASSWORDS */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Security & Password Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your account password and security authentication tokens.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {savingPassword ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
