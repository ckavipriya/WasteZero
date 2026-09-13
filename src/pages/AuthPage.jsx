import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Recycle, CalendarClock, Leaf, Handshake, Eye, EyeOff, ShieldCheck, Building2, Truck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const initialRegister = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'volunteer',
};

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // --- Login state ---
  const [selectedRole, setSelectedRole] = useState('volunteer');
  const [loginData, setLoginData] = useState({ username: 'ganesh', password: 'volunteer123' });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const roles = [
    {
      id: 'volunteer',
      title: 'Volunteer',
      sub: 'Schedule pickups & eco points',
      icon: User,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      ringColor: 'ring-emerald-500',
      user: 'ganesh',
      pass: 'volunteer123',
    },
    {
      id: 'agent',
      title: 'Pickup Agent',
      sub: 'Doorstep waste collection',
      icon: Truck,
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      ringColor: 'ring-amber-500',
      user: 'agent1',
      pass: 'agent12345',
    },
    {
      id: 'ngo',
      title: 'NGO Partner',
      sub: 'Host community cleanup drives',
      icon: Building2,
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      ringColor: 'ring-blue-500',
      user: 'greenearth',
      pass: 'ngo12345',
    },
    {
      id: 'admin',
      title: 'Admin',
      sub: 'Full system governance & audits',
      icon: ShieldCheck,
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
      ringColor: 'ring-rose-500',
      user: 'admin',
      pass: 'admin123',
    },
  ];

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.id);
    setLoginData({ username: roleObj.user, password: roleObj.pass });
    setLoginErrors({});
  };

  // --- Register state ---
  const [regData, setRegData] = useState(initialRegister);
  const [regErrors, setRegErrors] = useState({});
  const [showRegPw, setShowRegPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const validateLogin = () => {
    const errs = {};
    const trimmedUser = loginData.username.trim();
    if (!trimmedUser) errs.username = 'Username or email is required';
    if (!loginData.password) errs.password = 'Password is required';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getRoleDestination = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'ngo':
        return '/opportunities';
      case 'agent':
        return '/schedule-pickup';
      case 'volunteer':
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const payload = {
        username: loginData.username.trim(),
        password: loginData.password,
      };
      const res = await authApi.login(payload);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const dest = (from && from !== '/dashboard') ? from : getRoleDestination(res.data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.errors) setLoginErrors(err.response.data.errors);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickLogin = async (username, password) => {
    setLoginData({ username, password });
    setLoginErrors({});
    setLoginLoading(true);
    try {
      const res = await authApi.login({ username, password });
      login(res.data.token, res.data.user);
      toast.success(`Logged in as ${res.data.user.name} (${res.data.user.role})!`);
      const dest = getRoleDestination(res.data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const validateRegister = () => {
    const errs = {};
    const trimmedName = regData.name.trim();
    const trimmedEmail = regData.email.trim();
    const trimmedUsername = regData.username.trim();

    if (!trimmedName) errs.name = 'Full name is required';
    if (!trimmedEmail) errs.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) errs.email = 'A valid email address is required';
    
    if (trimmedUsername.length < 3) errs.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) errs.username = 'Only letters, numbers, and underscores allowed';
    
    if (regData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (regData.confirmPassword !== regData.password) errs.confirmPassword = 'Passwords do not match';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!validateRegister()) return;
    setRegLoading(true);
    try {
      const payload = {
        name: regData.name.trim(),
        email: regData.email.trim().toLowerCase(),
        username: regData.username.trim().toLowerCase(),
        password: regData.password,
        confirmPassword: regData.confirmPassword,
        role: regData.role,
      };
      const res = await authApi.register(payload);
      login(res.data.token, res.data.user);
      toast.success(`Welcome to WasteZero, ${res.data.user.name}!`);
      const dest = getRoleDestination(res.data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.errors) setRegErrors(err.response.data.errors);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Branding side */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-br from-brand-600 to-leaf-600 text-white">
        <div className="flex items-center gap-2 text-2xl font-bold mb-8">
          <Recycle size={28} />
          WasteZero
        </div>
        <h1 className="text-4xl font-extrabold leading-tight mb-4">Join the Recycling Revolution</h1>
        <p className="text-white/90 text-lg max-w-md mb-10">
          WasteZero connects volunteers, NGOs, and administrators to schedule pickups, manage recycling
          opportunities, and make a positive impact on our environment.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-md">
          <div>
            <CalendarClock className="mb-2" size={22} />
            <p className="font-semibold text-sm">Schedule Pickups</p>
            <p className="text-xs text-white/75 mt-1">Easily arrange waste collection</p>
          </div>
          <div>
            <Leaf className="mb-2" size={22} />
            <p className="font-semibold text-sm">Track Impact</p>
            <p className="text-xs text-white/75 mt-1">Monitor your environmental contribution</p>
          </div>
          <div>
            <Handshake className="mb-2" size={22} />
            <p className="font-semibold text-sm">Volunteer</p>
            <p className="text-xs text-white/75 mt-1">Join recycling initiatives</p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 text-xl font-bold text-brand-700 dark:text-brand-400 mb-6">
            <Recycle size={24} />
            WasteZero
          </div>

          {tab === 'login' ? (
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to WasteZero</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select your account role to continue</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setLoginErrors({}); }}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Create account →
                </button>
              </div>

              {/* Explicit Role Selector */}
              <div className="mb-5 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Select Account Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const IconComponent = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? `${r.bgColor} ${r.borderColor} border-2 shadow-sm font-semibold`
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <IconComponent className={`w-4 h-4 ${isSelected ? r.textColor : 'text-slate-500'}`} />
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${r.borderColor.replace('border-', 'bg-')}`} />
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? r.textColor : 'text-slate-800 dark:text-slate-200'}`}>
                            {r.title}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{r.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleLogin} noValidate className="space-y-4">
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      2. Credentials ({roles.find(r => r.id === selectedRole)?.title}):
                    </label>
                    <span className="text-[10px] text-slate-400">Pre-filled with test account</span>
                  </div>

                  <div>
                    <label className="label">Username or Email</label>
                    <input
                      className={`input ${loginErrors.username ? 'input-error' : ''}`}
                      placeholder="e.g. username or email"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    {loginErrors.username && <p className="error-text">{loginErrors.username}</p>}
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPw ? 'text' : 'password'}
                        className={`input pr-10 ${loginErrors.password ? 'input-error' : ''}`}
                        placeholder="Your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {loginErrors.password && <p className="error-text">{loginErrors.password}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loginLoading} className="btn-primary w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2">
                  {loginLoading && <Spinner size={16} className="text-white" />}
                  <span>Sign In as {roles.find(r => r.id === selectedRole)?.title || 'User'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setLoginErrors({}); }}
                    className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">Create a new account</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fill in your details to join WasteZero</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setRegErrors({}); }}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Sign in →
                </button>
              </div>

              {/* Registration Role Selector Grid */}
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Select Your Account Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const IconComponent = r.icon;
                    const isSelected = regData.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegData({ ...regData, role: r.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? `${r.bgColor} ${r.borderColor} border-2 font-semibold shadow-sm`
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? r.textColor : 'text-slate-500'}`} />
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${r.borderColor.replace('border-', 'bg-')}`} />
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? r.textColor : 'text-slate-800 dark:text-slate-200'}`}>
                            {r.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      className={`input ${regErrors.name ? 'input-error' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    />
                    {regErrors.name && <p className="error-text">{regErrors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className={`input ${regErrors.email ? 'input-error' : ''}`}
                      placeholder="name@example.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    />
                    {regErrors.email && <p className="error-text">{regErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Username</label>
                  <input
                    className={`input ${regErrors.username ? 'input-error' : ''}`}
                    placeholder="e.g. priya_green"
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  />
                  {regErrors.username && <p className="error-text">{regErrors.username}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        className={`input pr-10 ${regErrors.password ? 'input-error' : ''}`}
                        placeholder="Min 6 characters"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {regErrors.password && <p className="error-text">{regErrors.password}</p>}
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      className={`input ${regErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Repeat password"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    />
                    {regErrors.confirmPassword && <p className="error-text">{regErrors.confirmPassword}</p>}
                  </div>
                </div>

                <button type="submit" disabled={regLoading} className="btn-primary w-full py-3 text-sm font-bold">
                  {regLoading && <Spinner size={16} className="text-white" />}
                  Register as {roles.find(r => r.id === regData.role)?.title || 'User'}
                </button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setRegErrors({}); }}
                    className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
