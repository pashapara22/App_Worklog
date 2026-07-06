import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useApp } from '../../context/AppContext';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line
} from 'recharts';
import {
  Users, CheckCircle2, XCircle, Activity,
  Filter, Calendar as CalendarIcon, User
} from 'lucide-react';
import ReasonInspector from '../../components/admin/ReasonInspector';
import CronSimulator from '../../components/admin/CronSimulator';

export default function AdminDashboard() {
  const { instructors, getAdminAnalytics } = useApp();
  
  // Filters
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [dateRangeOption, setDateRangeOption] = useState('today');
  
  // Custom Date Range
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const activeInstructors = instructors.filter(i => i.role !== 'admin' && i.id !== 'admin-1');

  // Compute actual start/end based on dropdown
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    switch (dateRangeOption) {
      case 'today':
        return { startDate: format(today, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
      case 'last7':
        return { startDate: format(subDays(today, 7), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
      case 'thisMonth':
        return { startDate: format(startOfMonth(today), 'yyyy-MM-dd'), endDate: format(endOfMonth(today), 'yyyy-MM-dd') };
      case 'custom':
        return { startDate: customStart, endDate: customEnd };
      default:
        return { startDate: format(today, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
    }
  }, [dateRangeOption, customStart, customEnd]);

  const analytics = getAdminAnalytics(startDate, endDate, instructorFilter);

  if (!analytics) return <div className="p-8 text-center text-rose-500">Error loading analytics.</div>;

  const kpis = [
    { label: 'Active Instructors', value: analytics.totalInstructors, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Filled Worklogs', value: analytics.filledWorklogs, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Failed to Submit', value: analytics.failedToSubmit, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Accomplished Tasks', value: analytics.totalCompleted, icon: Activity, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  const PIE_COLORS = ['#10b981', '#f43f5e']; // Emerald (Submitted), Rose (Failed)
  const STATUS_COLORS = {
    'Done': '#10b981',
    'In Progress': '#3b82f6',
    'Yet to Start': '#f59e0b',
    'Postponed': '#f97316',
    'Cancelled': '#f43f5e',
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Control Center</h1>
          <p className="text-sm text-text-secondary mt-1">Platform-wide productivity and compliance overview</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Instructor Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <User className="w-4 h-4 text-text-muted" />
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-text-primary outline-none cursor-pointer"
            >
              <option value="all">All Instructors</option>
              {activeInstructors.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-text-muted" />
            <select
              value={dateRangeOption}
              onChange={(e) => setDateRangeOption(e.target.value)}
              className="bg-transparent text-sm font-medium text-text-primary outline-none cursor-pointer pr-2"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRangeOption === 'custom' && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="text-sm outline-none" />
              <span className="text-slate-300">→</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="text-sm outline-none" />
            </div>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={kpi.label} className="glass-card rounded-2xl p-5 hover:-translate-y-0.5 transition-all animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{kpi.value}</div>
                <div className="text-xs font-semibold text-text-secondary mt-0.5">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rich Analytics Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Pie Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Submission Compliance
          </h2>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.compliancePieData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {analytics.compliancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text-primary">
                {Math.round((analytics.filledWorklogs / (analytics.filledWorklogs + analytics.failedToSubmit || 1)) * 100)}%
              </span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Submitted</span>
            </div>
          </div>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-500" />
            Worklog Status Distribution
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analytics.statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line Graph */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-3">
          <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />
            Productivity Trend (Accomplished Tasks)
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                  name="Done Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* The Reason Inspector & Cron Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
        <ReasonInspector flaggedRows={analytics.flaggedRows} />
        <CronSimulator />
      </div>

    </div>
  );
}
