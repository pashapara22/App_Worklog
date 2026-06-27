import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { Sparkles, X, CheckCircle2, ChevronRight, Wand2, Lightbulb } from 'lucide-react';

export default function AICopilot({ instructorId, dateStr }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { getLog, updateSlot, addNotification } = useApp();
  const log = getLog(instructorId, dateStr) || [];

  // --- AI Analysis Logic ---
  const analysis = useMemo(() => {
    const emptyOutcomes = log.filter(e => e.status === 'done' && (!e.outcome || e.outcome.trim() === ''));
    const pendingSlots = log.filter(e => e.status === 'yet_to_start');
    const hasLunch = log.some(e => e.isLunch);
    
    const now = new Date();
    const isLate = now.getHours() >= 17; // After 5 PM

    let suggestions = [];
    
    if (emptyOutcomes.length > 0) {
      suggestions.push({
        id: 'auto-outcomes',
        type: 'action',
        title: `Auto-fill ${emptyOutcomes.length} missing outcomes`,
        desc: "You marked some tasks as 'Done' but forgot to write outcomes. I can auto-generate them based on the activity type.",
        action: async () => {
          setIsProcessing(true);
          await new Promise(r => setTimeout(r, 800)); // Simulate AI thinking
          emptyOutcomes.forEach(e => {
            const generatedOutcome = `Successfully completed ${e.activity || 'the task'} as per standard requirements.`;
            updateSlot(instructorId, dateStr, e.slotId, 'outcome', generatedOutcome);
          });
          setIsProcessing(false);
          addNotification({ id: Date.now(), title: 'AI Copilot', message: 'Missing outcomes were auto-filled.', type: 'success' });
        }
      });
    }

    if (isLate && pendingSlots.length > 0) {
      suggestions.push({
        id: 'auto-postpone',
        type: 'action',
        title: `Postpone ${pendingSlots.length} unstarted tasks`,
        desc: "It's getting late. Would you like me to automatically postpone your remaining 'Yet to Start' tasks to tomorrow?",
        action: async () => {
          setIsProcessing(true);
          await new Promise(r => setTimeout(r, 800));
          pendingSlots.forEach(e => {
            updateSlot(instructorId, dateStr, e.slotId, 'status', 'postponed');
            updateSlot(instructorId, dateStr, e.slotId, 'reason', 'End of day reached. Postponed via AI Copilot.');
          });
          setIsProcessing(false);
          addNotification({ id: Date.now(), title: 'AI Copilot', message: 'Remaining tasks were postponed.', type: 'success' });
        }
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        id: 'all-good',
        type: 'info',
        title: "Your log looks perfect! ✨",
        desc: "I've analyzed your schedule and everything seems up to date. Keep up the great work!",
      });
    }

    return suggestions;
  }, [log, instructorId, dateStr, updateSlot, addNotification]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform z-50 animate-bounce group"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* AI Panel Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 bg-white/90 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-indigo-950">AI Copilot</h2>
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Smart Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
              Hi! I'm your AI Copilot. I've analyzed your worklog for {format(new Date(dateStr), 'MMM d, yyyy')}. Here are my suggestions:
            </p>
          </div>

          <div className="space-y-3">
            {analysis.map(sug => (
              <div key={sug.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${sug.type === 'action' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {sug.type === 'action' ? <Lightbulb className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{sug.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sug.desc}</p>
                    
                    {sug.type === 'action' && (
                      <button
                        onClick={sug.action}
                        disabled={isProcessing}
                        className="mt-3 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            Apply Suggestion
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
