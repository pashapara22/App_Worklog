import { Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReminderBanner() {
  const { showReminder, setShowReminder } = useApp();

  if (!showReminder) return null;

  return (
    <div className="animate-slide-down bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg shadow-primary-600/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse-soft">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-sm">Don't forget to plan your day!</p>
          <p className="text-white/80 text-xs">Please fill out your morning worklog to stay on track.</p>
        </div>
      </div>
      <button
        onClick={() => setShowReminder(false)}
        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
        aria-label="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
