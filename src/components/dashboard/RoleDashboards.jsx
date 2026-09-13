import { Link } from 'react-router-dom';
import AgentDispatchMap from './AgentDispatchMap';
import AdminWasteAnalyticsChart from './AdminWasteAnalyticsChart';
import UserAchievements from '../UserAchievements';
import {
  Recycle,
  Leaf,
  Trees,
  Award,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Users,
  Building2,
  Truck,
  PlusCircle,
  MessageSquare,
  MapPin,
  Check,
  FileText,
  UserCheck,
  CheckSquare,
  Map,
  Zap,
} from 'lucide-react';

// Helper for status badge
export function getStatusBadge(status) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      );
    case 'assigned':
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {status}
        </span>
      );
  }
}

// ----------------------------------------------------
// 1. ADMIN DASHBOARD VIEW
// ----------------------------------------------------
export function AdminDashboardView({ stats, pickups, onRefresh, refreshing, onStatusChange, user }) {
  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-rose-800 via-rose-700 to-pink-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-rose-100 backdrop-blur">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
            <span>•</span>
            <span>{user?.name || user?.username}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Oversight & Governance</h1>
          <p className="text-white/90 text-sm max-w-2xl">
            Monitor platform health, audit user permissions, manage agent pickup dispatches, and review NGO community drives.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition backdrop-blur cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh System</span>
          </button>
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold shadow-md transition"
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>User Management</span>
          </Link>
        </div>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">1,248</div>
            <div className="text-xs text-rose-600 font-medium mt-0.5">Active accounts</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Dispatches</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{pickups.length || 24}</div>
            <div className="text-xs text-amber-600 font-medium mt-0.5">Doorstep pickups</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">System Recycled</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalWeightKg || 142.5} <span className="text-sm font-normal text-slate-500">kg</span></div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Diverted from waste</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">NGO Drives</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">18</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">Active community events</div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Bar Chart */}
      <AdminWasteAnalyticsChart stats={stats} />

      {/* Admin Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin" className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl hover:border-rose-300 hover:shadow-md transition space-y-2 group">
          <ShieldCheck className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">User Management</div>
          <p className="text-xs text-slate-500">Suspend accounts & toggle admin permissions</p>
        </Link>

        <Link to="/schedule-pickup" className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl hover:border-amber-300 hover:shadow-md transition space-y-2 group">
          <Truck className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Pickup Dispatch Hub</div>
          <p className="text-xs text-slate-500">Assign agents & audit collection logs</p>
        </Link>

        <Link to="/opportunities" className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl hover:border-blue-300 hover:shadow-md transition space-y-2 group">
          <Building2 className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">NGO Drive Approval</div>
          <p className="text-xs text-slate-500">Review & verify community event listings</p>
        </Link>

        <Link to="/messages" className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl hover:border-emerald-300 hover:shadow-md transition space-y-2 group">
          <MessageSquare className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">System Messages</div>
          <p className="text-xs text-slate-500">Send platform updates & announcements</p>
        </Link>
      </div>

      {/* Admin Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">System-Wide Pickup Dispatches</h2>
            </div>
            <Link to="/schedule-pickup" className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1">
              <span>All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {pickups.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No active system pickups.</p>
            ) : (
              pickups.slice(0, 5).map((p) => (
                <div key={p._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm capitalize">{p.category}</span>
                      <span className="text-xs text-slate-500">({p.weightEstimateKg || 5} kg)</span>
                      {getStatusBadge(p.status)}
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{p.address}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Requester: {p.user?.name || p.user?.username || 'User'}</p>
                  </div>
                  {p.status !== 'completed' && (
                    <button
                      onClick={() => onStatusChange(p._id, 'completed')}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
                    >
                      Override Status
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">System Audit Trail</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>User Role Upgrade</span>
                <span className="text-slate-400 font-normal">10m ago</span>
              </div>
              <p className="text-slate-500">Agent "agent1" assigned to South Zone dispatch route.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>NGO Drive Verified</span>
                <span className="text-slate-400 font-normal">1h ago</span>
              </div>
              <p className="text-slate-500">Approved "Clean Beach Drive 2026" by Green Earth NGO.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Pickup Batch Settled</span>
                <span className="text-slate-400 font-normal">3h ago</span>
              </div>
              <p className="text-slate-500">42 kg recycled plastic verified at Central Processing Plant.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. NGO PARTNER DASHBOARD VIEW
// ----------------------------------------------------
export function NgoDashboardView({ stats, pickups, onRefresh, refreshing, user }) {
  return (
    <div className="space-y-8">
      {/* NGO Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur">
            <Building2 className="w-3.5 h-3.5" />
            <span>NGO Partner Portal</span>
            <span>•</span>
            <span>{user?.name || user?.username}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community Cleanup & Drives Dashboard</h1>
          <p className="text-white/90 text-sm max-w-2xl">
            Host local environmental drives, manage volunteer participation rosters, and arrange bulk recycling collection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition backdrop-blur cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/opportunities"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Host Drive</span>
          </Link>
        </div>
      </div>

      {/* NGO Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Drives Organized</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">8</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">Community events</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteers Mobilized</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">142</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Active participants</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collected Waste</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">380 <span className="text-sm font-normal text-slate-500">kg</span></div>
            <div className="text-xs text-amber-600 font-medium mt-0.5">From cleanup drives</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Eco Impact Rank</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">Gold Partner</div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">Verified NGO status</div>
          </div>
        </div>
      </div>

      {/* NGO Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/opportunities" className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl hover:border-blue-300 hover:shadow-md transition space-y-2 group">
          <PlusCircle className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Host New Drive</div>
          <p className="text-xs text-slate-500">Create new community cleanup listing</p>
        </Link>

        <Link to="/opportunities" className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl hover:border-emerald-300 hover:shadow-md transition space-y-2 group">
          <Users className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Volunteer Roster</div>
          <p className="text-xs text-slate-500">Review & confirm volunteer applications</p>
        </Link>

        <Link to="/schedule-pickup" className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl hover:border-amber-300 hover:shadow-md transition space-y-2 group">
          <Truck className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Bulk Collection</div>
          <p className="text-xs text-slate-500">Dispatch agent to collect drive waste</p>
        </Link>

        <Link to="/messages" className="p-4 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-2xl hover:border-purple-300 hover:shadow-md transition space-y-2 group">
          <MessageSquare className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Volunteer Chat</div>
          <p className="text-xs text-slate-500">Message drive attendees & coordinators</p>
        </Link>
      </div>

      {/* NGO Drives & Roster */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active NGO Cleanup Drives</h2>
          </div>
          <Link to="/opportunities" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>Manage All Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Upcoming Drive</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Beachfront Plastic Sweep</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-bold">18 Volunteers</span>
            </div>
            <p className="text-xs text-slate-500">Marina Beach Bay, Section A • Tomorrow 8:00 AM</p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link to="/opportunities" className="text-xs font-bold text-blue-600 hover:underline">View Roster & Check-ins →</Link>
            </div>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Monthly Event</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">City Park E-Waste Drive</h3>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-xs font-bold">24 Volunteers</span>
            </div>
            <p className="text-xs text-slate-500">Central Park Community Pavilion • Saturday 10:00 AM</p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link to="/opportunities" className="text-xs font-bold text-blue-600 hover:underline">View Roster & Check-ins →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. PICKUP AGENT DASHBOARD VIEW
// ----------------------------------------------------
export function AgentDashboardView({ stats, pickups, onRefresh, refreshing, onStatusChange, user }) {
  const pendingAgentPickups = pickups.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');

  return (
    <div className="space-y-8">
      {/* Agent Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-amber-100 backdrop-blur">
            <Truck className="w-3.5 h-3.5" />
            <span>Pickup Agent Console</span>
            <span>•</span>
            <span>{user?.name || user?.username}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Doorstep Collection Center</h1>
          <p className="text-white/90 text-sm max-w-2xl">
            View assigned waste pickup dispatches, record verified item weights, and manage doorstep route updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition backdrop-blur cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Dispatches</span>
          </button>
          <Link
            to="/schedule-pickup"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold shadow-md transition"
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Dispatch Map</span>
          </Link>
        </div>
      </div>

      {/* Agent Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Pickups</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{pendingAgentPickups.length}</div>
            <div className="text-xs text-amber-600 font-medium mt-0.5">Assigned to your shift</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Today</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {pickups.filter((p) => p.status === 'completed').length || 6}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Successfully collected</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Weight Collected</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalWeightKg || 54} <span className="text-sm font-normal text-slate-500">kg</span></div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">Total shift volume</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">On-Time Rating</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">98.5%</div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">Performance index</div>
          </div>
        </div>
      </div>

      {/* Visual Route & Dispatch Map */}
      <AgentDispatchMap pickups={pickups} onStatusChange={onStatusChange} />

      {/* Agent Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Doorstep Collection Schedule</h2>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            {pendingAgentPickups.length} Pickups Needing Action
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pickups.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No doorstep pickups assigned currently.</p>
            </div>
          ) : (
            pickups.map((pickup) => (
              <div key={pickup._id} className="py-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm capitalize">{pickup.category}</span>
                      <span className="text-xs text-slate-500">Est. {pickup.weightEstimateKg || 5} kg</span>
                      {getStatusBadge(pickup.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{pickup.address}</span>
                    </div>
                    {pickup.user && (
                      <div className="text-[11px] text-slate-400">
                        Customer: <span className="font-medium text-slate-700 dark:text-slate-300">{pickup.user.name || pickup.user.username}</span> ({pickup.phone || 'Phone on file'})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {pickup.status === 'assigned' && (
                      <button
                        onClick={() => onStatusChange(pickup._id, 'in-progress')}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" /> Start Transit
                      </button>
                    )}
                    {pickup.status !== 'completed' && pickup.status !== 'cancelled' && (
                      <button
                        onClick={() => onStatusChange(pickup._id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Collected
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. VOLUNTEER DASHBOARD VIEW
// ----------------------------------------------------
export function VolunteerDashboardView({ stats, pickups, breakdown, onRefresh, refreshing, user }) {
  const treesSaved = (stats.totalWeightKg * 0.017).toFixed(1);
  const ecoPoints = Math.round(stats.totalWeightKg * 12);

  const categoryColors = {
    plastic: 'bg-blue-500',
    paper: 'bg-amber-500',
    glass: 'bg-teal-500',
    'e-waste': 'bg-purple-500',
    organic: 'bg-emerald-500',
    metal: 'bg-slate-500',
    other: 'bg-gray-400',
  };

  return (
    <div className="space-y-8">
      {/* Volunteer Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-emerald-100 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Volunteer Eco Dashboard</span>
            <span>•</span>
            <span>{user?.name || user?.username}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Circular Impact Hub</h1>
          <p className="text-white/90 text-sm max-w-2xl">
            Track your doorstep waste recycling footprint, earn redeemable EcoPoints, and join community drives.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition backdrop-blur cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/schedule-pickup"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold shadow-md transition"
          >
            <CalendarClock className="w-4 h-4 text-emerald-600" />
            <span>Schedule Pickup</span>
          </Link>
        </div>
      </div>

      {/* Volunteer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Recycled</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalWeightKg} <span className="text-sm font-normal text-slate-500">kg</span></div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Diverted from landfills</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">CO₂ Offset</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.co2SavedKg} <span className="text-sm font-normal text-slate-500">kg</span></div>
            <div className="text-xs text-teal-600 font-medium mt-0.5">Emissions prevented</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trees Saved</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{treesSaved} <span className="text-sm font-normal text-slate-500">equiv.</span></div>
            <div className="text-xs text-amber-600 font-medium mt-0.5">Paper & pulp saved</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">EcoPoints Balance</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{ecoPoints} <span className="text-sm font-normal text-slate-500">pts</span></div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">Redeemable rewards</div>
          </div>
        </div>
      </div>

      {/* Volunteer Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/schedule-pickup" className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl hover:border-emerald-300 hover:shadow-md transition space-y-2 group">
          <CalendarClock className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Schedule Pickup</div>
          <p className="text-xs text-slate-500">Request doorstep collection</p>
        </Link>

        <Link to="/opportunities" className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl hover:border-blue-300 hover:shadow-md transition space-y-2 group">
          <Sparkles className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Community Drives</div>
          <p className="text-xs text-slate-500">Join local recycling events</p>
        </Link>

        <Link to="/profile" className="p-4 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-2xl hover:border-purple-300 hover:shadow-md transition space-y-2 group">
          <Award className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">My Badges</div>
          <p className="text-xs text-slate-500">View rank & redeem rewards</p>
        </Link>

        <Link to="/messages" className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl hover:border-amber-300 hover:shadow-md transition space-y-2 group">
          <MessageSquare className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
          <div className="font-bold text-sm text-slate-900 dark:text-white">Direct Chat</div>
          <p className="text-xs text-slate-500">Message agents & NGOs</p>
        </Link>
      </div>

      {/* User Achievements & Badges Module */}
      <UserAchievements
        userStats={{
          totalCollections: pickups.length || 18,
          totalWeightKg: stats.totalWeightKg || 84.5,
          co2SavedKg: stats.co2SavedKg || 116.6,
          monthlyVolumeKg: 72.0,
          ngoEventsAttended: 4,
          plasticWeightKg: 32.0,
        }}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Doorstep Pickups</h2>
              </div>
              <Link to="/schedule-pickup" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {pickups.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-500">No pickups scheduled yet.</p>
                  <Link
                    to="/schedule-pickup"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                  >
                    Schedule Your First Pickup
                  </Link>
                </div>
              ) : (
                pickups.slice(0, 5).map((pickup) => (
                  <div key={pickup._id} className="py-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white capitalize text-sm">{pickup.category}</span>
                        {pickup.weightEstimateKg && <span className="text-xs text-slate-500">({pickup.weightEstimateKg} kg)</span>}
                        {getStatusBadge(pickup.status)}
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-md">{pickup.address}</p>
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      {new Date(pickup.scheduledTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Material Distribution */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Material Breakdown</h3>
            </div>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-slate-700 dark:text-slate-300">{item.category}</span>
                    <span className="text-slate-500">{item.weight} kg ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${categoryColors[item.category] || 'bg-emerald-500'}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
