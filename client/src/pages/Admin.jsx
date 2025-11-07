import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, MessageSquare, Hash, Activity, TrendingUp, 
  Ban, Unlock, Trash2, Search, Calendar, UserCheck, 
  AlertTriangle, XCircle, Clock, ArchiveRestore, Loader2, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmDialog from '../components/ConfirmDialog';
import { getSocket } from '../utils/socket';

const Admin = ({ defaultTab = 'dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const violationThreshold = Number(import.meta.env.VITE_VIOLATION_THRESHOLD || 3);
  const [latestViolation, setLatestViolation] = useState(null);
  const [violationsData, setViolationsData] = useState({
    violations: [],
    summary: {
      total: 0,
      byReason: [],
      statusCounts: [],
      suspendedUsers: 0,
      bannedUsers: 0
    }
  });
  const [violationsLoading, setViolationsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const openConfirm = (config) => setConfirmDialog({ open: true, ...config });
  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, open: false }));

  const fetchViolations = async () => {
     try {
       setViolationsLoading(true);
       const response = await api.get('/admin/violations');
       const payload = response.data || {};
       const summary = payload.summary || {};
       setViolationsData({
         violations: payload.violations || [],
         summary: {
           total: summary.total || 0,
           byReason: summary.byReason || [],
           statusCounts: summary.statusCounts || [],
           suspendedUsers: summary.suspendedUsers || 0,
           bannedUsers: summary.bannedUsers || 0
         }
       });
     } catch (error) {
       console.error('Violations error:', error);
     } finally {
       setViolationsLoading(false);
     }
   };

  const fetchAnalytics = async () => {
     try {
       setAnalyticsLoading(true);
       const response = await api.get('/admin/analytics');
       const payload = response.data || {};
       setAnalytics({
         totals: payload.totals || {
           totalMessages: 0,
           totalUsers: 0,
           activeUsers: 0,
           suspendedUsers: 0,
           bannedUsers: 0,
           totalViolations: 0
         },
         messageTrend: payload.messageTrend || [],
         newUsersTrend: payload.newUsersTrend || [],
         topRooms: payload.topRooms || [],
         moderationSummary: payload.moderationSummary || []
       });
     } catch (error) {
       console.error('Analytics error:', error);
     } finally {
       setAnalyticsLoading(false);
     }
   };

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    fetchDashboard();
    fetchUsers();
    fetchRooms();
    fetchActivities();
    fetchActionLogs();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchActionLogs();
    }
    if (activeTab === 'violations' && violationsData.violations.length === 0 && !violationsLoading) {
      fetchViolations();
    }
    if (activeTab === 'analytics' && !analytics && !analyticsLoading) {
      fetchAnalytics();
    }
  }, [activeTab, analytics, analyticsLoading, violationsData.violations.length, violationsLoading]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !(user?.isAdmin || user?.role === 'admin')) return;

    const handleAdminViolation = (payload) => {
      setLatestViolation({ ...payload, timestamp: new Date().toISOString() });
    };

    socket.on('admin:violation', handleAdminViolation);
    return () => {
      socket.off('admin:violation', handleAdminViolation);
    };
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard error:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/admin/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Rooms error:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/admin/activity');
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Activities error:', error);
    }
  };

  const fetchActionLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await api.get('/admin/logs');
      setActionLogs(response.data.logs || []);
    } catch (error) {
      console.error('Logs error:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleBanUser = async (userId, banned) => {
    const targetUser = users.find(u => (u._id || u.id) === userId);
    if (banned) {
      const reason = prompt('Enter ban reason (optional):');
      if (reason === null) return;

      openConfirm({
        title: `Ban ${targetUser?.username || 'this user'}?`,
        message: 'The user will be blocked from logging in until reinstated.',
        confirmLabel: 'Ban user',
        destructive: true,
        onConfirm: async () => {
          try {
            await api.post(`/admin/users/${userId}/ban`, { banned: true, reason });
            await fetchUsers();
            await fetchActionLogs();
            alert('User banned successfully');
          } catch (error) {
            console.error('Ban error:', error);
            alert(error.response?.data?.error || 'Failed to ban user');
          } finally {
            closeConfirm();
          }
        }
      });
    } else {
      openConfirm({
        title: `Unban ${targetUser?.username || 'this user'}?`,
        message: 'The user will regain access immediately.',
        confirmLabel: 'Unban user',
        onConfirm: async () => {
          try {
            await api.post(`/admin/users/${userId}/ban`, { banned: false });
            await fetchUsers();
            await fetchActionLogs();
            alert('User unbanned successfully');
          } catch (error) {
            console.error('Unban error:', error);
            alert(error.response?.data?.error || 'Failed to unban user');
          } finally {
            closeConfirm();
          }
        }
      });
    }
  };

  const handleSuspendUser = async (userId, suspended) => {
    const targetUser = users.find(u => (u._id || u.id) === userId);
    if (suspended) {
      const days = prompt('Enter suspension duration in days:');
      if (!days || isNaN(days) || parseInt(days) <= 0) {
        alert('Please enter a valid number of days');
        return;
      }
      const reason = prompt('Enter suspension reason (optional):');
      if (reason === null) return;

      openConfirm({
        title: `Suspend ${targetUser?.username || 'this user'}?`,
        message: `The user will be suspended for ${parseInt(days, 10)} day(s).`,
        confirmLabel: 'Suspend user',
        destructive: true,
        onConfirm: async () => {
          try {
            await api.post(`/admin/users/${userId}/suspend`, {
              suspended: true,
              days: parseInt(days, 10),
              reason
            });
            await fetchUsers();
            await fetchActionLogs();
            alert(`User suspended for ${parseInt(days, 10)} day(s)`);
          } catch (error) {
            console.error('Suspend error:', error);
            alert(error.response?.data?.error || 'Failed to suspend user');
          } finally {
            closeConfirm();
          }
        }
      });
    } else {
      openConfirm({
        title: `Unsuspend ${targetUser?.username || 'this user'}?`,
        message: 'The user will regain normal access.',
        confirmLabel: 'Unsuspend',
        onConfirm: async () => {
          try {
            await api.post(`/admin/users/${userId}/suspend`, { suspended: false });
            await fetchUsers();
            await fetchActionLogs();
            alert('User unsuspended successfully');
          } catch (error) {
            console.error('Unsuspend error:', error);
            alert(error.response?.data?.error || 'Failed to unsuspend user');
          } finally {
            closeConfirm();
          }
        }
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const username = users.find(u => (u._id || u.id) === userId)?.username;
    openConfirm({
      title: `Delete ${username || 'this user'}?`,
      message: 'This action permanently removes the account and cannot be undone.',
      confirmLabel: 'Delete user',
      destructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          await fetchUsers();
          await fetchActionLogs();
          alert('User deleted successfully');
        } catch (error) {
          console.error('Delete error:', error);
          alert(error.response?.data?.error || 'Failed to delete user');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const handleDeleteRoom = async (roomId) => {
    openConfirm({
      title: 'Delete room?',
      message: 'This will remove the room and its membership.',
      confirmLabel: 'Delete room',
      destructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/rooms/${roomId}`);
          await fetchRooms();
        } catch (error) {
          console.error('Delete room error:', error);
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    openConfirm({
      title: 'Reset password?',
      message: 'The user will receive a new password immediately.',
      confirmLabel: 'Reset password',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
          await fetchActionLogs();
          alert('Password reset successfully');
        } catch (error) {
          console.error('Reset password error:', error);
          alert('Failed to reset password');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const handleReinstateUser = (userId) => {
    const targetUser = users.find(u => (u._id || u.id) === userId);
    openConfirm({
      title: `Reinstate ${targetUser?.username || 'this user'}?`,
      message: 'This will remove any active suspensions or bans.',
      confirmLabel: 'Reinstate user',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${userId}/reinstate`);
          await fetchUsers();
          await fetchActionLogs();
          alert('User reinstated successfully');
        } catch (error) {
          console.error('Reinstate error:', error);
          alert(error.response?.data?.error || 'Failed to reinstate user');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: Hash },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'activity', label: 'Activity', icon: Calendar },
    { id: 'logs', label: 'Action Logs', icon: ArchiveRestore }
  ];

  const getStatusCount = (status) => {
    const entry = violationsData.summary.statusCounts.find(item => item.status === status);
    return entry ? entry.count : 0;
  };

  const renderStatusBadge = (status) => {
    const label = (status || 'unknown').replace(/_/g, ' ');
    const palette = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
      reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
      action_taken: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
    };
    const classes = palette[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>
        {label}
      </span>
    );
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage users, rooms, and view analytics</p>
        </div>

        {latestViolation && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-600 dark:text-amber-300">Violation alert</p>
              <p className="text-sm text-amber-700 dark:text-amber-200">{latestViolation.username || 'A user'} triggered a content violation. Total violations: {latestViolation.count || 1}.</p>
              {latestViolation.autoSuspended && (
                <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">User has been automatically suspended.</p>
              )}
            </div>
            <button
              onClick={() => setLatestViolation(null)}
              className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 hover:bg-amber-500/30"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboard.stats.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboard.stats.totalMessages}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboard.stats.activeUsers}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspended Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {dashboard.stats.suspendedUsers}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Summaries</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {dashboard.stats.totalSummaries}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">Recent Violations</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">Threshold {violationThreshold || 3}</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {dashboard.recentViolations && dashboard.recentViolations.length > 0 ? (
                  dashboard.recentViolations.map((violation) => (
                    <div key={violation._id} className="p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{violation.user?.username || 'Unknown user'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(violation.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">{violation.reason.replace('-', ' ')}</span>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{violation.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No violations recorded yet.</div>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Recent Admin Actions</h3>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {actionLogs && actionLogs.length > 0 ? (
                  actionLogs.slice(0, 6).map(log => (
                    <div key={log._id} className="p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 capitalize">{log.action.replace('-', ' ')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(log.admin?.username || 'System')} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Target: {log.targetUser?.username || 'User'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No admin actions yet.</div>
                )}
              </div>
            </div>
          </div>
        </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map(u => (
                    <tr key={u._id || u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.status === 'online' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {u.status || 'offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {u.isBanned && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Banned
                            </span>
                          )}
                          {u.isSuspended && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Suspended
                              {u.suspendedUntil && new Date(u.suspendedUntil) > new Date() && (
                                <span className="text-xs">({Math.ceil((new Date(u.suspendedUntil) - new Date()) / (1000 * 60 * 60 * 24))}d)</span>
                              )}
                            </span>
                          )}
                          {!u.isBanned && !u.isSuspended && (
                            <span className="text-xs text-gray-500">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.isAdmin ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                            Admin
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">User</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleBanUser(u._id || u.id, !u.isBanned)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title={u.isBanned ? 'Unban' : 'Ban'}
                          >
                            {u.isBanned ? (
                              <Unlock className="w-4 h-4 text-green-600" />
                            ) : (
                              <Ban className="w-4 h-4 text-red-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSuspendUser(u._id || u.id, !u.isSuspended)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          >
                            <AlertTriangle className={`w-4 h-4 ${u.isSuspended ? 'text-green-600' : 'text-yellow-600'}`} />
                          </button>
                          {(u.isBanned || u.isSuspended) && (
                            <button
                              onClick={() => handleReinstateUser(u._id || u.id)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                              title="Reinstate user"
                            >
                              <ArchiveRestore className="w-4 h-4 text-emerald-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u._id || u.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition text-red-600"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(u._id || u.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-blue-600"
                            title="Reset Password"
                          >
                            🔑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div
                key={room._id || room.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{room.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRoom(room._id || room.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition text-red-600"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {room.members?.length || 0} members • {room.admins?.length || 0} admins
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {activity.type === 'registration' && `New user: ${activity.username}`}
                        {activity.type === 'summary' && `${activity.username} requested summary for ${activity.roomName}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Admin Action Logs</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest administrative actions for auditing.</p>
            </div>
            {logsLoading ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading logs...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {actionLogs.map(log => (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">{log.action.replace('-', ' ')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{log.admin?.username || 'System'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{log.targetUser?.username || 'N/A'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {log.details?.reason && <div>Reason: {log.details.reason}</div>}
                          {log.details?.days && <div>Duration: {log.details.days} day(s)</div>}
                          {!log.details?.reason && !log.details?.days && Object.keys(log.details || {}).length === 0 && (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {actionLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No admin actions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="space-y-6">
            {violationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Violations</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{violationsData.summary.total || 0}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-300">{getStatusCount('pending')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reviewed</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{getStatusCount('reviewed')}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Action Taken</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">{getStatusCount('action_taken')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Top Reasons</h3>
                    {violationsData.summary.byReason.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        {violationsData.summary.byReason.slice(0, 6).map(item => (
                          <li key={item.reason} className="flex items-center justify-between">
                            <span className="capitalize">{item.reason?.replace(/-/g, ' ') || 'unknown'}</span>
                            <span className="font-semibold">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No violations recorded yet.</p>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Status Breakdown</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {['pending', 'reviewed', 'action_taken'].map(status => (
                        <li key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                          <span className="font-semibold">{getStatusCount(status)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Enforcement</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Suspended users</span>
                        <span className="font-semibold">{violationsData.summary.suspendedUsers || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Banned users</span>
                        <span className="font-semibold">{violationsData.summary.bannedUsers || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold">Recent Violations</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Showing latest {violationsData.violations.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">User</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Reason</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Message</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {violationsData.violations.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                              No violations found for the selected filters.
                            </td>
                          </tr>
                        ) : (
                          violationsData.violations.map(violation => (
                            <tr key={violation._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-800 dark:text-gray-100">{violation.user?.username || 'Unknown'}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{violation.user?.email}</div>
                              </td>
                              <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-200">{violation.reason?.replace(/-/g, ' ') || 'unknown'}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs">
                                <p className="line-clamp-2">{violation.message?.content || violation.content || 'No content available'}</p>
                              </td>
                              <td className="px-4 py-3">{renderStatusBadge(violation.status)}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDateTime(violation.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totals.totalMessages}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totals.totalUsers}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex items-center gap-3">
                    <Activity className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Active Now</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totals.activeUsers}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Violations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totals.totalViolations}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Messages (last {analytics.messageTrend.length} days)</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {analytics.messageTrend.map(item => (
                        <li key={`messages-${item.date}`} className="flex items-center justify-between">
                          <span>{item.date}</span>
                          <span className="font-semibold">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">New Users (last {analytics.newUsersTrend.length} days)</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {analytics.newUsersTrend.map(item => (
                        <li key={`users-${item.date}`} className="flex items-center justify-between">
                          <span>{item.date}</span>
                          <span className="font-semibold">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold">Top Active Rooms</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Room</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Messages</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {analytics.topRooms.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                No room activity detected in the selected range.
                              </td>
                            </tr>
                          ) : (
                            analytics.topRooms.map(room => (
                              <tr key={room.roomId} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{room.name}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold">{room.count}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Moderation Summary</h3>
                    {analytics.moderationSummary.length === 0 ? (
                      <p className="text-sm text-gray-500">No moderation activity in the selected timeframe.</p>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        {analytics.moderationSummary.map(item => (
                          <li key={item.reason} className="flex items-center justify-between">
                            <span className="capitalize">{item.reason?.replace(/-/g, ' ') || 'unknown'}</span>
                            <span className="font-semibold">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Suspended users: {analytics.totals.suspendedUsers || 0} • Banned users: {analytics.totals.bannedUsers || 0}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow text-center text-gray-500 dark:text-gray-400">
                No analytics data available yet.
              </div>
            )}
          </div>
        )}

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          destructive={confirmDialog.destructive}
          onCancel={closeConfirm}
          onConfirm={confirmDialog.onConfirm || closeConfirm}
        />
      </div>
    </div>
  );
};

export default Admin;







