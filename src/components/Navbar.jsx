import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Recycle,
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/endpoints';
import { NotificationDropdown } from './NotificationCenter';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi
        .getAll()
        .then((res) => {
          if (res.data?.success) {
            const count = res.data.unreadCount ?? (res.data.notifications || []).filter((n) => !n.read).length;
            setUnreadNotifs(count);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['volunteer', 'ngo', 'agent', 'admin'] },
    { name: 'Pickups', path: '/schedule-pickup', icon: CalendarClock, roles: ['volunteer', 'agent', 'admin'] },
    { name: 'Drives & Events', path: '/opportunities', icon: Sparkles, roles: ['volunteer', 'ngo', 'admin'] },
    { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['volunteer', 'ngo', 'agent', 'admin'] },
    { name: 'Admin Hub', path: '/admin', icon: ShieldCheck, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter((item) => !user || item.roles.includes(user.role));

  const roleBadges = {
    admin: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Admin' },
    ngo: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'NGO' },
    agent: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Agent' },
    volunteer: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Volunteer' },
  };

  const currentBadge = user?.role ? roleBadges[user.role] || roleBadges.volunteer : null;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Recycle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                  Waste<span className="text-emerald-600">Zero</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-none">
                  Smart Recycling Network
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {visibleLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Controls & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Icon */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                {/* Profile Pill */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user?.name || user?.username}
                    </span>
                    {currentBadge && (
                      <span className={`text-[10px] font-medium px-1.5 rounded-sm border ${currentBadge.bg}`}>
                        {currentBadge.label}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
              </div>

              {visibleLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-100 flex flex-col space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <User className="w-5 h-5 text-slate-400" />
                  <span>Account Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium shadow-sm"
            >
              Sign In to WasteZero
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
