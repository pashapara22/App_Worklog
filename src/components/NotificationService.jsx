import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  AlertTriangle,
  Mail,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

export default function NotificationService() {
  const { currentInstructorId, getLog, addNotification, notifications, clearNotifications } = useApp();
  const { isAuthenticated, currentUser } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const sentRef = useRef(new Set());

  // Cron simulation — checks every 10 seconds (compressed for demo)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const log = getLog(currentInstructorId, today);

      // Check if log is empty (no activities filled)
      const nonLunch = log?.filter(e => e.status !== null) || [];
      const isEmpty = !nonLunch.some(e => e.activity !== null);

      const reminderKey = `reminder-${today}`;
      const escalationKey = `escalation-${today}`;

      // 8:50 AM Reminder (or simulate with a manual button)
      if (hours === 8 && minutes >= 50 && isEmpty && !sentRef.current.has(reminderKey)) {
        sentRef.current.add(reminderKey);
        const notification = {
          id: Date.now(),
          type: 'reminder',
          title: '📧 Morning Reminder',
          message: `Hi ${currentUser?.fullName || 'Instructor'}, please fill out your morning worklog before 9:00 AM.`,
          timestamp: now.toISOString(),
          read: false,
        };
        addNotification(notification);
        showToast(notification);
      }

      // 9:00 AM Escalation
      if (hours >= 9 && isEmpty && !sentRef.current.has(escalationKey)) {
        sentRef.current.add(escalationKey);
        const notification = {
          id: Date.now() + 1,
          type: 'escalation',
          title: '⚠️ URGENT: Worklog Empty',
          message: `ALERT: ${currentUser?.fullName || 'Instructor'}'s worklog for today is still empty. Immediate action required.`,
          timestamp: now.toISOString(),
          read: false,
        };
        addNotification(notification);
        showToast(notification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, currentInstructorId, getLog, addNotification, currentUser]);

  const showToast = (notification) => {
    setToasts(prev => [...prev, { ...notification, visible: true }]);
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== notification.id));
    }, 8000);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Manual trigger for demo purposes
  const triggerReminder = () => {
    const notification = {
      id: Date.now(),
      type: 'reminder',
      title: '📧 Morning Reminder',
      message: `Hi ${currentUser?.fullName || 'Instructor'}, please fill out your morning worklog before 9:00 AM.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    addNotification(notification);
    showToast(notification);
  };

  const triggerEscalation = () => {
    const notification = {
      id: Date.now(),
      type: 'escalation',
      title: '⚠️ URGENT: Worklog Empty',
      message: `ALERT: ${currentUser?.fullName || 'Instructor'}'s worklog for today is still empty. Immediate action required.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    addNotification(notification);
    showToast(notification);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Notification Bell + Panel Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-text-secondary transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-slide-down overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-bold text-text-primary">Email Notifications</span>
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-text-primary hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Manual Trigger Buttons (Demo) */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex gap-2">
              <button
                onClick={triggerReminder}
                className="flex-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1 justify-center"
              >
                <Clock className="w-3 h-3" />
                8:50 AM Reminder
              </button>
              <button
                onClick={triggerEscalation}
                className="flex-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors flex items-center gap-1 justify-center"
              >
                <AlertTriangle className="w-3 h-3" />
                9:00 AM Escalation
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">Use the buttons above to simulate cron triggers</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`
                      px-4 py-3 border-b border-slate-50 last:border-b-0
                      ${n.type === 'escalation' ? 'bg-rose-50/50' : 'bg-amber-50/30'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${n.type === 'escalation' ? 'bg-rose-100' : 'bg-amber-100'}
                      `}>
                        {n.type === 'escalation'
                          ? <AlertTriangle className="w-4 h-4 text-rose-600" />
                          : <Mail className="w-4 h-4 text-amber-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${n.type === 'escalation' ? 'text-rose-800' : 'text-amber-800'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(n.timestamp), 'hh:mm:ss a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-md animate-slide-up
              ${toast.type === 'escalation'
                ? 'bg-rose-600 text-white'
                : 'bg-amber-500 text-white'
              }
            `}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {toast.type === 'escalation'
                ? <AlertTriangle className="w-4 h-4" />
                : <Mail className="w-4 h-4" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{toast.title}</p>
              <p className="text-xs text-white/85 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
