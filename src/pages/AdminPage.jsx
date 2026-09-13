import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CalendarClock,
  Sparkles,
  Download,
  Trash2,
  Ban,
  CheckCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { adminApi } from '../api/endpoints';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    try {
      const [statRes, userRes, logRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getLogs(),
      ]);

      if (statRes.data?.success) setStats(statRes.data.stats);
      if (userRes.data?.success) setUsers(userRes.data.users || []);
      if (logRes.data?.success) setLogs(logRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (userId, currentlySuspended) => {
    try {
      const res = await adminApi.toggleSuspend(userId, {
        suspend: !currentlySuspended,
        reason: 'Administrative policy action',
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this account?')) return;
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.data?.success) {
        toast.success('User account removed');
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleExportReport = async () => {
    try {
      const res = await adminApi.getReport();
      if (res.data?.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.report, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `wastezero-report-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('Report downloaded');
      }
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" className="text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Governance & Audit</h1>
          <p className="text-sm text-slate-500">
            Monitor system throughput, manage platform users, inspect security logs, and download compliance audits.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Registered Users</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalUsers ?? users.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Total Pickups</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalPickups ?? 14}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Drives / Events</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalOpportunities ?? 8}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Recycled Weight</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalRecycledKg ?? 384} kg</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'users' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                            className="text-[11px] font-semibold text-amber-600 hover:text-amber-800"
                          >
                            {u.isSuspended ? 'Reinstate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Recent Administrative Actions
          </div>
          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No admin actions recorded yet.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={log._id || idx} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    {log.admin?.username && (
                      <span className="text-slate-400 ml-2">by @{log.admin.username}</span>
                    )}
                  </div>
                  <span className="text-slate-400">
                    {new Date(log.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
