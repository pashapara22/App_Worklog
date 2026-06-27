import { useState, useEffect, useMemo } from 'react';
import { format, subDays, addDays, isWeekend } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import TimeSlotGrid from '../../components/instructor/TimeSlotGrid';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Zap,
  CheckCircle,
  Loader2,
  Calendar,
  Send,
  Clock,
  XCircle,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { STATUS_OPTIONS } from '../../data/mockData';

function getPreviousWorkday(dateStr) {
  let d = subDays(new Date(dateStr), 1);
  while (isWeekend(d)) {
    d = subDays(d, 1);
  }
  return format(d, 'yyyy-MM-dd');
}

export default function DailyLog() {
  const {
    currentInstructorId,
    getLog,
    initializeLog,
    copyPreviousDay,
    bulkSetStatus,
    saveStatus,
    instructors,
    getStatusCounts,
    submitDailyLog,
  } = useApp();
  const { currentUser } = useAuth();
  const location = useLocation();

  const initialDate = location.state?.date || format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  const instructor = instructors.find(i => i.id === currentInstructorId);
  const log = getLog(currentInstructorId, selectedDate);

  // Initialize log if needed
  useEffect(() => {
    if (!log) {
      initializeLog(currentInstructorId, selectedDate);
    }
  }, [currentInstructorId, selectedDate, log, initializeLog]);

  // Status counts for the ribbon
  const counts = useMemo(() => getStatusCounts(currentInstructorId, selectedDate), [currentInstructorId, selectedDate, getStatusCounts]);

  // Fill stats
  const fillStats = useMemo(() => {
    if (!log) return { filled: 0, total: 0 };
    const nonLunch = log.filter(e => e.status !== null);
    const filled = nonLunch.filter(e => e.activity !== null).length;
    return { filled, total: nonLunch.length };
  }, [log]);

  const navigateDate = (dir) => {
    let d = dir === 'prev'
      ? subDays(new Date(selectedDate), 1)
      : addDays(new Date(selectedDate), 1);
    while (isWeekend(d)) {
      d = dir === 'prev' ? subDays(d, 1) : addDays(d, 1);
    }
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const handleCopyPrevious = () => {
    const prevDay = getPreviousWorkday(selectedDate);
    copyPreviousDay(currentInstructorId, prevDay, selectedDate);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2500);
  };

  const handleBulkStatus = (status) => {
    if (!status) return;
    bulkSetStatus(currentInstructorId, selectedDate, status);
    setBulkStatusValue('');
  };

  const handleSubmit = () => {
    submitDailyLog(currentInstructorId, selectedDate);
    setShowSubmitToast(true);
    setTimeout(() => setShowSubmitToast(false), 3000);
  };

  const ribbonItems = [
    { label: 'Done', value: counts.done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    { label: 'Postponed', value: counts.postponed, icon: ArrowRightLeft, color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
    { label: 'Cancelled', value: counts.cancelled, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Daily Work Log
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {currentUser?.fullName} <span className="text-text-muted">({currentUser?.employeeId})</span> — {instructor?.department}
          </p>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' ? (
            <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Auto-saved
            </span>
          )}
        </div>
      </div>

      {/* Status Analytics Ribbon */}
      <div className="grid grid-cols-4 gap-3">
        {ribbonItems.map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
            <div className={`w-2 h-2 rounded-full ${item.dot}`} />
            <div>
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-text-secondary">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Navigator + Actions */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg hover:bg-slate-100 text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center min-w-[200px]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-center text-base font-semibold text-text-primary cursor-pointer border-none outline-none focus-ring rounded-lg px-3 py-1"
            />
            <p className="text-xs text-text-muted mt-0.5">{format(new Date(selectedDate), 'EEEE')}</p>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg hover:bg-slate-100 text-text-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyPrevious}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 text-text-secondary hover:bg-slate-50 hover:border-primary-300 transition-all"
          >
            <Copy className="w-4 h-4" />
            Copy Previous Day
          </button>

          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-text-muted" />
            <select
              value={bulkStatusValue}
              onChange={(e) => handleBulkStatus(e.target.value)}
              className="px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 text-text-secondary hover:border-primary-300 cursor-pointer focus-ring bg-white"
            >
              <option value="">Bulk Set Status...</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            className="gradient-primary text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Send className="w-4 h-4" />
            Submit Daily Log
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${fillStats.total ? (fillStats.filled / fillStats.total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
          {fillStats.filled}/{fillStats.total} slots filled
        </span>
      </div>

      {/* Time Slot Grid */}
      <TimeSlotGrid
        instructorId={currentInstructorId}
        dateStr={selectedDate}
      />

      {/* Toast Notifications */}
      {showCopyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up z-50">
          <Copy className="w-4 h-4" />
          <span className="text-sm font-medium">Previous day's routine copied!</span>
        </div>
      )}
      {showSubmitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 gradient-success text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up z-50">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Daily log submitted successfully!</span>
        </div>
      )}
    </div>
  );
}
