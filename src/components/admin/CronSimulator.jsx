import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { EmailService } from '../../services/EmailService';
import { format } from 'date-fns';
import { Bot, Mail, CheckCircle2, Play, AlertCircle } from 'lucide-react';

export default function CronSimulator() {
  const { registeredUsers } = useAuth();
  const { worklogs, addNotification } = useApp();
  
  const [lastMorningRun, setLastMorningRun] = useState(localStorage.getItem('cron_morning_run') || 'Never');
  const [lastEveningRun, setLastEveningRun] = useState(localStorage.getItem('cron_evening_run') || 'Never');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-run logic (Simulating a real cron that runs every minute to check the time)
  useEffect(() => {
    const checkCron = () => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Morning Cron: Runs if it's past 9:00 AM and hasn't run today
      if (hour >= 9) {
        if (localStorage.getItem('cron_morning_run') !== today) {
          console.log("⏰ Auto-triggering Morning Cron (Past 9 AM)");
          runMorningCron(true);
        }
      }

      // Evening Cron: Runs if it's past 6:30 PM (18:30) and hasn't run today
      if ((hour > 18) || (hour === 18 && minute >= 30)) {
        if (localStorage.getItem('cron_evening_run') !== today) {
          console.log("⏰ Auto-triggering Evening Cron (Past 6:30 PM)");
          runEveningCron(true);
        }
      }
    };

    const interval = setInterval(checkCron, 60000); // Check every minute
    checkCron(); // Initial check on mount
    
    return () => clearInterval(interval);
  }, [registeredUsers, worklogs]);

  const runMorningCron = async (isAuto = false) => {
    setIsProcessing(true);
    let sentCount = 0;
    const instructors = registeredUsers.filter(u => u.role === 'instructor' && u.status === 'approved');
    
    for (const inst of instructors) {
      await EmailService.sendMorningReminder(inst.fullName, inst.email);
      sentCount++;
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd (HH:mm:ss)');
    localStorage.setItem('cron_morning_run', isAuto ? format(new Date(), 'yyyy-MM-dd') : dateStr);
    setLastMorningRun(dateStr);
    
    addNotification({
      id: Date.now(),
      title: 'Morning Cron Complete',
      message: `Sent ${sentCount} morning reminder emails.`,
      type: 'success'
    });
    
    setIsProcessing(false);
  };

  const runEveningCron = async (isAuto = false) => {
    setIsProcessing(true);
    let sentCount = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const instructors = registeredUsers.filter(u => u.role === 'instructor' && u.status === 'approved');
    
    for (const inst of instructors) {
      const log = worklogs[inst.instructorId]?.[todayStr] || [];
      // Calculate missing slots (slots not marked as 'done')
      const missingCount = log.filter(entry => entry.status !== null && entry.status !== 'done').length;
      
      // If the log is completely empty, it means they didn't even initialize it
      const isCompletelyEmpty = log.length === 0;

      if (isCompletelyEmpty || missingCount > 0) {
        // Send alert
        await EmailService.sendEveningAlert(inst.fullName, inst.email, isCompletelyEmpty ? 'all' : missingCount);
        sentCount++;
      }
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd (HH:mm:ss)');
    localStorage.setItem('cron_evening_run', isAuto ? format(new Date(), 'yyyy-MM-dd') : dateStr);
    setLastEveningRun(dateStr);
    
    addNotification({
      id: Date.now(),
      title: 'Evening Cron Complete',
      message: `Sent ${sentCount} compliance alerts for incomplete logs.`,
      type: 'warning'
    });

    setIsProcessing(false);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="font-bold text-text-primary flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          Background Jobs & Emails
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
          Cron Simulator
        </span>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-sm text-text-secondary">
          This panel simulates automated backend scripts. The 9:00 AM job emails a reminder to all instructors. 
          The 6:30 PM job emails an alert to any instructor whose log is incomplete. Check the browser console to see the sent emails!
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Morning Job */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Morning Reminder</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Scheduled: 09:00 AM</p>
                </div>
              </div>
              <button 
                onClick={() => runMorningCron(false)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                Force Run
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500">Last executed: <span className="font-mono font-medium text-slate-700">{lastMorningRun}</span></span>
            </div>
          </div>

          {/* Evening Job */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">EOD Compliance Alert</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Scheduled: 06:30 PM</p>
                </div>
              </div>
              <button 
                onClick={() => runEveningCron(false)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                Force Run
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500">Last executed: <span className="font-mono font-medium text-slate-700">{lastEveningRun}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
