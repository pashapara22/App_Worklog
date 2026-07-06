import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  LogOut,
  Users,
  Crown,
  UserMinus,
  UserCheck,
  Search,
  ChevronUp,
  ChevronDown,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';

export default function OverviewDashboard() {
  const navigate = useNavigate();
  const { registeredUsers, promoteToAdmin, demoteToInstructor, approveUser, rejectUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'instructor'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'rejected'
  const [sortField, setSortField] = useState('fullName');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmAction, setConfirmAction] = useState(null); // { type, employeeId, name }

  const handleLogout = () => {
    sessionStorage.removeItem('overview_access');
    navigate('/login');
  };

  // Stats
  const stats = useMemo(() => {
    const total = registeredUsers.length;
    const admins = registeredUsers.filter(u => u.role === 'admin').length;
    const instructors = registeredUsers.filter(u => u.role === 'instructor').length;
    const pending = registeredUsers.filter(u => u.status === 'pending').length;
    const approved = registeredUsers.filter(u => u.status === 'approved').length;
    return { total, admins, instructors, pending, approved };
  }, [registeredUsers]);

  // Filtered & sorted users
  const filteredUsers = useMemo(() => {
    let users = [...registeredUsers];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        u =>
          u.fullName.toLowerCase().includes(q) ||
          u.employeeId.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      users = users.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      users = users.filter(u => u.status === statusFilter);
    }

    // Sort
    users.sort((a, b) => {
      const aVal = (a[sortField] || '').toLowerCase();
      const bVal = (b[sortField] || '').toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return users;
  }, [registeredUsers, searchQuery, roleFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-primary-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary-600" />
    );
  };

  const handleAction = (type, employeeId) => {
    if (type === 'promote') promoteToAdmin(employeeId);
    if (type === 'demote') demoteToInstructor(employeeId);
    if (type === 'approve') approveUser(employeeId);
    if (type === 'reject') rejectUser(employeeId);
    setConfirmAction(null);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const roleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-600">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-600">
        <User className="w-3 h-3" /> Instructor
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary">Overview Dashboard</h1>
              <p className="text-[10px] text-text-muted font-medium tracking-wider uppercase">System Administration</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit Overview
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-slate-50 text-slate-700', iconBg: 'bg-slate-100' },
            { label: 'Admins', value: stats.admins, icon: Shield, color: 'bg-violet-50 text-violet-700', iconBg: 'bg-violet-100' },
            { label: 'Instructors', value: stats.instructors, icon: User, color: 'bg-sky-50 text-sky-700', iconBg: 'bg-sky-100' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-100' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-100' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-4 border border-slate-100 ${stat.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium opacity-70 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="glass-card rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, employee ID, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring placeholder:text-text-muted bg-white"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-text-primary bg-white focus-ring min-w-[130px]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="instructor">Instructors</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-text-primary bg-white focus-ring min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
            <h2 className="font-bold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              All Users
            </h2>
            <span className="text-xs font-semibold text-text-muted bg-slate-100 px-2.5 py-1 rounded-full">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort('fullName')}
                  >
                    <span className="flex items-center gap-1.5">
                      Name <SortIcon field="fullName" />
                    </span>
                  </th>
                  <th
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort('employeeId')}
                  >
                    <span className="flex items-center gap-1.5">
                      Employee ID <SortIcon field="employeeId" />
                    </span>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-text-muted">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.employeeId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">{user.fullName?.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-semibold text-text-primary">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {user.employeeId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                      <td className="px-6 py-4">{roleBadge(user.role)}</td>
                      <td className="px-6 py-4">{statusBadge(user.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role actions */}
                          {user.status === 'approved' && (
                            <>
                              {user.role === 'instructor' ? (
                                <button
                                  onClick={() => setConfirmAction({ type: 'promote', employeeId: user.employeeId, name: user.fullName })}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                                  title="Promote to Admin"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmAction({ type: 'demote', employeeId: user.employeeId, name: user.fullName })}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                  title="Demote to Instructor"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Demote
                                </button>
                              )}
                            </>
                          )}
                          {/* Status actions */}
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction('reject', user.employeeId)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction('approve', user.employeeId)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            </>
                          )}
                          {user.status === 'rejected' && (
                            <button
                              onClick={() => handleAction('approve', user.employeeId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-down">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {confirmAction.type === 'promote' ? 'Promote to Admin?' : 'Demote to Instructor?'}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {confirmAction.type === 'promote' ? (
                <>Are you sure you want to grant admin privileges to <span className="font-semibold text-text-primary">{confirmAction.name}</span>?</>
              ) : (
                <>Are you sure you want to remove admin privileges from <span className="font-semibold text-text-primary">{confirmAction.name}</span>?</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-text-primary hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.type, confirmAction.employeeId)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                  confirmAction.type === 'promote'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {confirmAction.type === 'promote' ? 'Promote' : 'Demote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
