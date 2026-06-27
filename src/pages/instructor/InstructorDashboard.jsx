import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, getDay } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CalendarRange,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AICopilot from '../../components/instructor/AICopilot';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { currentInstructorId, getStatusCounts, getDateRangeStats, instructors } = useApp();
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showDateRange, setShowDateRange] = useState(false);
  const [rangeStart, setRangeStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const instructor = instructors.find(i => i.id === currentInstructorId);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const stats = useMemo(() => getStatusCounts(currentInstructorId, dateStr), [currentInstructorId, dateStr, getStatusCounts]);
  const rangeStats = useMemo(() => getDateRangeStats(currentInstructorId, rangeStart, rangeEnd), [currentInstructorId, rangeStart, rangeEnd, getDateRangeStats]);

  // Mini Calendar data
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  const analyticsCards = [
    { label: 'Completed', value: stats.done, icon: CheckCircle2, gradient: 'gradient-success', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'gradient-warning', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    { label: 'Postponed', value: stats.postponed, icon: ArrowRightLeft, gradient: 'bg-gradient-to-br from-orange-500 to-orange-600', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, gradient: 'gradient-danger', textColor: 'text-rose-700', bgColor: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentUser?.fullName?.split(' ').pop()} 👋
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Viewing worklog for <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/instructor/log', { state: { date: dateStr } })}
          className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
        >
          <ClipboardList className="w-4 h-4" />
          Open Daily Log
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Status Analytics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card, idx) => (
          <div
            key={card.label}
            className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${card.gradient} blur-xl group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-black/5`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 ${card.textColor} opacity-40`} />
            </div>
            <div className={`text-4xl font-extrabold ${card.textColor} relative z-10 tracking-tight`}>{card.value}</div>
            <div className="text-sm font-semibold text-text-secondary mt-1 relative z-10">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Calendar */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              Calendar
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="p-1 rounded-lg hover:bg-slate-100 text-text-muted">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-text-primary min-w-[100px] text-center">
                {format(calendarMonth, 'MMMM yyyy')}
              </span>
              <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-1 rounded-lg hover:bg-slate-100 text-text-muted">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map(day => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    w-full aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                    ${isSelected
                      ? 'gradient-primary text-white shadow-sm'
                      : isTodayDate
                        ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-200'
                        : 'hover:bg-slate-100 text-text-primary'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setSelectedDate(new Date()); setCalendarMonth(new Date()); }}
            className="w-full mt-3 text-xs font-medium text-primary-600 bg-primary-50 py-2 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Go to Today
          </button>
        </div>

        {/* Completion Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Today's Progress</h2>
                <p className="text-sm text-text-secondary mt-0.5">Completion for {format(selectedDate, 'MMM d, yyyy')}</p>
              </div>
              <span className="text-3xl font-bold text-primary-600">
                {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-text-muted">
              <span>{stats.done} of {stats.total} slots completed</span>
              <span>{stats.total - stats.done} remaining</span>
            </div>
          </div>

          {/* Date Range Performance */}
          <div className="glass-card rounded-2xl p-6">
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-primary-600" />
                Date Range Performance
              </h3>
              {showDateRange
                ? <ChevronUp className="w-4 h-4 text-text-muted" />
                : <ChevronDown className="w-4 h-4 text-text-muted" />
              }
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${showDateRange ? 'max-h-60 mt-4' : 'max-h-0'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-secondary mb-1">From</label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus-ring"
                  />
                </div>
                <span className="text-text-muted mt-5">→</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-secondary mb-1">To</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{rangeStats.totalCompleted}</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Tasks Completed</div>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary-700">{rangeStats.totalSlots}</div>
                  <div className="text-xs text-primary-600 mt-0.5">Total Slots</div>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{rangeStats.days}</div>
                  <div className="text-xs text-text-secondary mt-0.5">Days Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2 relative z-10">💡 Quick Tips</h3>
        <div className="grid sm:grid-cols-3 gap-4 relative z-10">
          <div className="bg-primary-50/80 backdrop-blur-sm rounded-2xl p-5 border border-primary-100/50 hover:shadow-md transition-all">
            <p className="text-sm font-bold text-primary-800 mb-1">Editable Time Slots</p>
            <p className="text-xs text-primary-600/90 leading-relaxed">Click the pencil icon next to any time label to customize the start and end times for a specific task.</p>
          </div>
          <div className="bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100/50 hover:shadow-md transition-all">
            <p className="text-sm font-bold text-emerald-800 mb-1">Done = De-emphasized</p>
            <p className="text-xs text-emerald-600/90 leading-relaxed">Completed tasks gracefully fade out to reduce clutter and keep your focus on pending work.</p>
          </div>
          <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/50 hover:shadow-md transition-all">
            <p className="text-sm font-bold text-amber-800 mb-1">Reason Required</p>
            <p className="text-xs text-amber-600/90 leading-relaxed">Postponed, Cancelled, or Not Started tasks require a short reason tag for audit compliance.</p>
          </div>
        </div>
      </div>

      <AICopilot instructorId={currentInstructorId} dateStr={dateStr} />
    </div>
  );
}
