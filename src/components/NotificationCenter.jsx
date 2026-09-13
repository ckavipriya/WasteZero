import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  Sparkles,
  X,
  CheckCheck,
  AlertCircle,
  ArrowRight,
  Info,
  CalendarClock,
  Radio,
} from 'lucide-react';
import { notificationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Helper to generate role-specific initial alerts dynamically
export function getRoleNotifications(role, pickups = []) {
  const notifs = [];

  if (role === 'admin') {
    notifs.push({
      id: 'notif-admin-1',
      title: 'New Pickup Request Pending Dispatch',
      message: 'New Plastic pickup request (8.5 kg) submitted by Ganesh Kumar needs agent assignment.',
      type: 'pickup',
      roleTarget: 'admin',
      time: '10m ago',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Truck,
    });
    notifs.push({
      id: 'notif-admin-2',
      title: 'NGO Drive Approval Needed',
      message: 'GreenEarth NGO posted "Beach Cleanup Drive". Verify listing for public display.',
      type: 'ngo',
      roleTarget: 'admin',
      time: '1h ago',
      read: false,
      link: '/opportunities',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Building2,
    });
    notifs.push({
      id: 'notif-admin-3',
      title: 'System Milestone Reached',
      message: 'Total community recycled weight crossed 140 kg with zero audit violations.',
      type: 'system',
      roleTarget: 'admin',
      time: '3h ago',
      read: true,
      link: '/admin',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: ShieldCheck,
    });
  } else if (role === 'agent') {
    notifs.push({
      id: 'notif-agent-1',
      title: 'New Pickup Dispatch Assigned',
      message: 'Route dispatch assigned: Plastic waste (8.5 kg) at 78 Banjara Hills, Hyderabad.',
      type: 'pickup',
      roleTarget: 'agent',
      time: '5m ago',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Truck,
    });
    notifs.push({
      id: 'notif-agent-2',
      title: 'Customer Note Attached',
      message: 'Customer Ganesh requested: "Please call 5 mins before arriving at gate."',
      type: 'info',
      roleTarget: 'agent',
      time: '25m ago',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Info,
    });
    notifs.push({
      id: 'notif-agent-3',
      title: 'Shift Performance Update',
      message: 'On-time rating updated to 98.5%. 6 completed collections today.',
      type: 'system',
      roleTarget: 'agent',
      time: '2h ago',
      read: true,
      link: '/dashboard',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
    });
  } else if (role === 'ngo') {
    notifs.push({
      id: 'notif-ngo-1',
      title: 'New Volunteer Application',
      message: 'Priya Sharma applied to participate in "Beachfront Plastic Sweep Drive".',
      type: 'volunteer',
      roleTarget: 'ngo',
      time: '15m ago',
      read: false,
      link: '/opportunities',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Sparkles,
    });
    notifs.push({
      id: 'notif-ngo-2',
      title: 'Bulk Drive Pickup Status',
      message: 'Agent assigned to collect drive waste at Brighton Beach tomorrow 8:00 AM.',
      type: 'pickup',
      roleTarget: 'ngo',
      time: '1h ago',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Truck,
    });
    notifs.push({
      id: 'notif-ngo-3',
      title: 'Drive Verification Complete',
      message: 'Your drive "Recycling Workshop" was verified by platform Administrator.',
      type: 'system',
      roleTarget: 'ngo',
      time: '4h ago',
      read: true,
      link: '/opportunities',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Building2,
    });
  } else {
    // Volunteer role
    notifs.push({
      id: 'notif-vol-1',
      title: 'Pickup Request Status Update',
      message: 'Your Plastic doorstep pickup request is assigned to Agent One.',
      type: 'pickup',
      roleTarget: 'volunteer',
      time: '12m ago',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Clock,
    });
    notifs.push({
      id: 'notif-vol-2',
      title: 'EcoPoints Credited!',
      message: '+102 EcoPoints added to your balance for Paper waste recycling.',
      type: 'reward',
      roleTarget: 'volunteer',
      time: '2h ago',
      read: false,
      link: '/profile',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Sparkles,
    });
    notifs.push({
      id: 'notif-vol-3',
      title: 'Upcoming Community Drive',
      message: 'GreenEarth NGO posted "City Park E-Waste Drive" this Saturday.',
      type: 'ngo',
      roleTarget: 'volunteer',
      time: '5h ago',
      read: true,
      link: '/opportunities',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: CalendarClock,
    });
  }

  // Include dynamic pickup updates if present
  if (pickups && pickups.length > 0) {
    const latestPickup = pickups[0];
    notifs.unshift({
      id: `notif-pickup-${latestPickup._id}`,
      title: `Pickup ${latestPickup.status.toUpperCase()}`,
      message: `Pickup for ${latestPickup.category} (${latestPickup.weightEstimateKg || 5}kg) at ${latestPickup.address} is now "${latestPickup.status}".`,
      type: 'pickup',
      roleTarget: role,
      time: 'Just now',
      read: false,
      link: '/schedule-pickup',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Radio,
    });
  }

  return notifs;
}

// ----------------------------------------------------
// 1. FLOATING NOTIFICATION DROPDOWN MENU FOR NAVBAR
// ----------------------------------------------------
export function NotificationDropdown({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'volunteer';
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch or initialize role notifications
    const defaultNotifs = getRoleNotifications(role);
    notificationApi
      .getAll()
      .then((res) => {
        if (res.data?.success && res.data.notifications?.length > 0) {
          const apiNotifs = res.data.notifications.map((n) => ({
            id: n._id,
            title: n.title || 'System Notification',
            message: n.message,
            type: n.type || 'info',
            read: n.isRead || n.read || false,
            time: 'Recently',
            link: n.link || '/dashboard',
            icon: Bell,
            badgeColor: 'bg-emerald-100 text-emerald-800',
          }));
          setItems([...apiNotifs, ...defaultNotifs]);
        } else {
          setItems(defaultNotifs);
        }
      })
      .catch(() => {
        setItems(defaultNotifs);
      });
  }, [role]);

  if (!isOpen) return null;

  const unreadCount = items.filter((i) => !i.read).length;

  const markOneRead = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    notificationApi.markAsRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    notificationApi.markAllAsRead().catch(() => {});
    toast.success('All notifications marked as read');
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">Role Alerts ({role.toUpperCase()})</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 p-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Read all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No active notifications</div>
        ) : (
          items.map((item) => {
            const IconComponent = item.icon || Bell;
            return (
              <div
                key={item.id}
                onClick={() => markOneRead(item.id)}
                className={`p-3.5 transition flex gap-3 cursor-pointer ${
                  item.read ? 'bg-white dark:bg-slate-900 opacity-75' : 'bg-emerald-50/40 dark:bg-emerald-950/20'
                } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{item.message}</p>
                  {item.link && (
                    <Link
                      to={item.link}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 self-center" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View Full Role Dispatch Console →
        </Link>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. LIVE ROLE NOTIFICATION BANNER FOR DASHBOARD
// ----------------------------------------------------
export function RoleNotificationBanner({ user, pickups = [] }) {
  const [dismissed, setDismissed] = useState(false);
  const role = user?.role || 'volunteer';
  const notifs = getRoleNotifications(role, pickups);
  const activeAlert = notifs.find((n) => !n.read) || notifs[0];

  if (dismissed || !activeAlert) return null;

  const roleStyles = {
    admin: 'from-rose-900/90 via-rose-800 to-pink-900 border-rose-700 text-white',
    ngo: 'from-blue-900/90 via-blue-800 to-indigo-900 border-blue-700 text-white',
    agent: 'from-amber-900/90 via-amber-800 to-orange-900 border-amber-700 text-white',
    volunteer: 'from-emerald-900/90 via-emerald-800 to-teal-900 border-emerald-700 text-white',
  };

  const IconComp = activeAlert.icon || Bell;

  return (
    <div
      className={`bg-gradient-to-r ${
        roleStyles[role] || roleStyles.volunteer
      } rounded-2xl p-4 shadow-md border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-300`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
          <IconComp className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              Live {role.toUpperCase()} Alert
            </span>
            <span className="text-[11px] opacity-80">{activeAlert.time}</span>
          </div>
          <p className="font-medium text-white/95 mt-0.5">{activeAlert.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {activeAlert.link && (
          <Link
            to={activeAlert.link}
            className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-bold text-xs shadow transition flex items-center gap-1"
          >
            <span>Review Update</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
