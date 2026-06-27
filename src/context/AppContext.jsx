import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TIME_CONFIG,
  INSTRUCTORS,
  generateTimeSlots,
  generateMockWorklogs,
  createEmptyEntry,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Categories (admin-editable)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Time slot config (admin-editable)
  const [timeConfig, setTimeConfig] = useState(DEFAULT_TIME_CONFIG);

  // Computed time slots
  const timeSlots = useMemo(() => generateTimeSlots(timeConfig), [timeConfig]);

  // Worklogs: { instructorId: { dateString: [slotData...] } }
  const [worklogs, setWorklogs] = useState(() => generateMockWorklogs(DEFAULT_CATEGORIES));

  // Submissions tracking: { instructorId: { dateString: { isSubmitted: true, submittedAt: ISOString } } }
  const [submissions, setSubmissions] = useState({
    // Pre-seed some mock submissions for yesterday and today
    'inst-1': {
      [format(new Date(), 'yyyy-MM-dd')]: { isSubmitted: true, submittedAt: new Date().toISOString() }
    },
    'inst-2': {
      [format(new Date(), 'yyyy-MM-dd')]: { isSubmitted: true, submittedAt: new Date().toISOString() }
    }
  });

  // Current instructor (synced from AuthContext via setCurrentInstructorId)
  const [currentInstructorId, setCurrentInstructorId] = useState('inst-1');

  // Reminder visibility
  const [showReminder, setShowReminder] = useState(true);

  // Auto-save indicator
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'

  // Notification log
  const [notifications, setNotifications] = useState([]);

  // --- Category CRUD ---
  const addCategory = useCallback((name) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      icon: '📌',
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback((id, newName) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, name: newName } : c)));
  }, []);

  const removeCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- Worklog Operations ---
  const getLog = useCallback((instructorId, dateStr) => {
    return worklogs[instructorId]?.[dateStr] || null;
  }, [worklogs]);

  const initializeLog = useCallback((instructorId, dateStr) => {
    setWorklogs(prev => {
      if (prev[instructorId]?.[dateStr]) return prev;
      const emptyLog = timeSlots.map(slot => createEmptyEntry(slot.id, slot.isLunch));
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          [dateStr]: emptyLog,
        },
      };
    });
  }, [timeSlots]);

  const updateSlot = useCallback((instructorId, dateStr, slotId, field, value) => {
    setSaveStatus('saving');
    setWorklogs(prev => {
      const log = prev[instructorId]?.[dateStr];
      if (!log) return prev;
      const updated = log.map(entry => {
        if (entry.slotId !== slotId) return entry;
        const newEntry = { ...entry, [field]: value };
        // Clear reason if status is changed away from cancelled/postponed
        if (field === 'status' && value !== 'cancelled' && value !== 'postponed') {
          newEntry.reason = '';
        }
        return newEntry;
      });
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          [dateStr]: updated,
        },
      };
    });
    setTimeout(() => setSaveStatus('saved'), 500);
  }, []);

  const copyPreviousDay = useCallback((instructorId, fromDateStr, toDateStr) => {
    setWorklogs(prev => {
      const prevLog = prev[instructorId]?.[fromDateStr];
      if (!prevLog) return prev;
      const copied = prevLog.map(entry => ({
        ...entry,
        status: entry.status === null ? null : 'yet_to_start',
        reason: '',
        customStartTime: entry.customStartTime || '',
        customEndTime: entry.customEndTime || '',
      }));
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          [toDateStr]: copied,
        },
      };
    });
  }, []);

  const bulkSetStatus = useCallback((instructorId, dateStr, status) => {
    setWorklogs(prev => {
      const log = prev[instructorId]?.[dateStr];
      if (!log) return prev;
      const updated = log.map(entry => ({
        ...entry,
        status: entry.status === null ? null : status,
        reason: (status !== 'cancelled' && status !== 'postponed') ? '' : entry.reason,
      }));
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          [dateStr]: updated,
        },
      };
    });
  }, []);

  const submitDailyLog = useCallback((instructorId, dateStr) => {
    setSubmissions(prev => ({
      ...prev,
      [instructorId]: {
        ...prev[instructorId],
        [dateStr]: {
          isSubmitted: true,
          submittedAt: new Date().toISOString()
        }
      }
    }));
  }, []);

  // --- Time Config ---
  const updateTimeConfig = useCallback((newConfig) => {
    setTimeConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // --- Status Counts for a specific date ---
  const getStatusCounts = useCallback((instructorId, dateStr) => {
    const log = worklogs[instructorId]?.[dateStr];
    if (!log) return { done: 0, pending: 0, postponed: 0, cancelled: 0, total: 0 };
    const nonLunch = log.filter(e => e.status !== null);
    return {
      done: nonLunch.filter(e => e.status === 'done').length,
      pending: nonLunch.filter(e => e.status === 'yet_to_start' || e.status === 'in_progress').length,
      postponed: nonLunch.filter(e => e.status === 'postponed').length,
      cancelled: nonLunch.filter(e => e.status === 'cancelled').length,
      total: nonLunch.length,
    };
  }, [worklogs]);

  // --- Date Range Stats ---
  const getDateRangeStats = useCallback((instructorId, startDate, endDate) => {
    try {
      const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      let totalCompleted = 0;
      let totalSlots = 0;

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = worklogs[instructorId]?.[dateStr];
        if (log) {
          const nonLunch = log.filter(e => e.status !== null);
          totalCompleted += nonLunch.filter(e => e.status === 'done').length;
          totalSlots += nonLunch.length;
        }
      });

      return { totalCompleted, totalSlots, days: days.length };
    } catch {
      return { totalCompleted: 0, totalSlots: 0, days: 0 };
    }
  }, [worklogs]);

  // --- Compliance Analytics ---
  const getComplianceData = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let submitted = 0;
    let pending = 0;

    const activeInstructors = INSTRUCTORS.filter(i => i.role !== 'admin' && i.employeeId !== 'A0000');

    activeInstructors.forEach(inst => {
      if (submissions[inst.id]?.[today]?.isSubmitted) {
        submitted++;
      } else {
        pending++;
      }
    });

    return { submitted, pending, total: activeInstructors.length };
  }, [submissions]);

  // --- Admin V3 Analytics ---
  const getAdminAnalytics = useCallback((startDate, endDate, instructorIdFilter = 'all') => {
    try {
      const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      const activeInstructors = INSTRUCTORS.filter(i => i.employeeId !== 'A0000');
      const targetInstructors = instructorIdFilter === 'all' 
        ? activeInstructors 
        : activeInstructors.filter(i => i.id === instructorIdFilter);

      let totalCompleted = 0;
      let filledWorklogs = 0;
      
      const statusCounts = { done: 0, in_progress: 0, yet_to_start: 0, postponed: 0, cancelled: 0 };
      const trendDataMap = {};
      const flaggedRows = []; // For Reason Inspector

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        trendDataMap[dateStr] = { date: format(day, 'MMM dd'), completed: 0 };

        targetInstructors.forEach(inst => {
          // Check submissions
          if (submissions[inst.id]?.[dateStr]?.isSubmitted) {
            filledWorklogs++;
          }

          const log = worklogs[inst.id]?.[dateStr];
          if (log) {
            log.forEach(entry => {
              if (entry.status !== null) { // Not lunch
                if (entry.status === 'done') {
                  totalCompleted++;
                  trendDataMap[dateStr].completed++;
                  statusCounts.done++;
                } else if (entry.status === 'in_progress') {
                  statusCounts.in_progress++;
                } else if (entry.status === 'yet_to_start') {
                  statusCounts.yet_to_start++;
                } else if (entry.status === 'postponed') {
                  statusCounts.postponed++;
                } else if (entry.status === 'cancelled') {
                  statusCounts.cancelled++;
                }

                // Add to flagged rows for inspector
                if (['cancelled', 'postponed', 'yet_to_start'].includes(entry.status)) {
                  flaggedRows.push({
                    id: `${inst.id}-${dateStr}-${entry.slotId}`,
                    instructorName: inst.name,
                    date: dateStr,
                    slotId: entry.slotId,
                    activity: entry.activity,
                    status: entry.status,
                    reason: entry.reason
                  });
                }
              }
            });
          }
        });
      });

      const totalPotentialSubmissions = days.length * targetInstructors.length;
      const failedToSubmit = totalPotentialSubmissions - filledWorklogs;

      return {
        totalInstructors: targetInstructors.length,
        filledWorklogs,
        failedToSubmit,
        totalCompleted,
        compliancePieData: [
          { name: 'Submitted', value: filledWorklogs },
          { name: 'Pending/Failed', value: failedToSubmit }
        ],
        statusDistribution: [
          { name: 'Done', value: statusCounts.done },
          { name: 'In Progress', value: statusCounts.in_progress },
          { name: 'Yet to Start', value: statusCounts.yet_to_start },
          { name: 'Postponed', value: statusCounts.postponed },
          { name: 'Cancelled', value: statusCounts.cancelled },
        ],
        trendData: Object.values(trendDataMap),
        flaggedRows
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [worklogs, submissions]);

  // --- Notifications ---
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    // Data
    categories,
    timeConfig,
    timeSlots,
    worklogs,
    instructors: INSTRUCTORS,
    currentInstructorId,
    showReminder,
    saveStatus,
    notifications,
    // Category ops
    addCategory,
    updateCategory,
    removeCategory,
    // Worklog ops
    getLog,
    initializeLog,
    updateSlot,
    copyPreviousDay,
    bulkSetStatus,
    submitDailyLog,
    // Config
    updateTimeConfig,
    setCurrentInstructorId,
    setShowReminder,
    // Analytics
    getComplianceData,
    getStatusCounts,
    getDateRangeStats,
    getAdminAnalytics,
    // Notifications
    addNotification,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
