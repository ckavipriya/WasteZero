import { useState, useEffect } from 'react';
import { dashboardApi, pickupApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  AdminDashboardView,
  NgoDashboardView,
  AgentDashboardView,
  VolunteerDashboardView,
} from '../components/dashboard/RoleDashboards';
import { RoleNotificationBanner } from '../components/NotificationCenter';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [myPickups, setMyPickups] = useState([]);

  const fetchData = async () => {
    try {
      const [dashRes, pickupRes] = await Promise.all([
        dashboardApi.getStats(),
        pickupApi.getAll(),
      ]);

      if (dashRes.data?.success) {
        setDashboardData(dashRes.data);
      }
      if (pickupRes.data?.success) {
        setMyPickups(pickupRes.data.pickups || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => toast.success('Dashboard metrics refreshed'));
  };

  const handleStatusChange = async (pickupId, newStatus) => {
    try {
      await pickupApi.updateStatus(pickupId, { status: newStatus });
      toast.success(`Pickup status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size="lg" className="text-emerald-600" />
      </div>
    );
  }

  const role = user?.role || 'volunteer';

  const stats = dashboardData?.stats || {
    totalPickups: myPickups.length,
    completedPickups: myPickups.filter((p) => p.status === 'completed').length,
    totalWeightKg: 42.5,
    co2SavedKg: 58.2,
  };

  const breakdown = dashboardData?.recyclingBreakdown || [
    { category: 'plastic', weight: 18.5, percent: 43 },
    { category: 'paper', weight: 14.0, percent: 33 },
    { category: 'glass', weight: 6.0, percent: 14 },
    { category: 'e-waste', weight: 4.0, percent: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RoleNotificationBanner user={user} pickups={myPickups} />

      {role === 'admin' && (
        <AdminDashboardView
          stats={stats}
          pickups={myPickups}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onStatusChange={handleStatusChange}
          user={user}
        />
      )}
      {role === 'ngo' && (
        <NgoDashboardView
          stats={stats}
          pickups={myPickups}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          user={user}
        />
      )}
      {role === 'agent' && (
        <AgentDashboardView
          stats={stats}
          pickups={myPickups}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onStatusChange={handleStatusChange}
          user={user}
        />
      )}
      {role === 'volunteer' && (
        <VolunteerDashboardView
          stats={stats}
          pickups={myPickups}
          breakdown={breakdown}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          user={user}
        />
      )}
    </div>
  );
}
