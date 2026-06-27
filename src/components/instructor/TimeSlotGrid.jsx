import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STATUS_OPTIONS } from '../../data/mockData';
import SearchableDropdown from '../ui/SearchableDropdown';
import { Coffee, Clock, AlertTriangle, Pencil, Check, X, Tag } from 'lucide-react';

const statusColorMap = {
  yet_to_start: 'bg-slate-100 border-slate-200 text-slate-600',
  in_progress: 'bg-amber-50 border-amber-200 text-amber-700',
  done: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  carry_forward: 'bg-violet-50 border-violet-200 text-violet-700',
  postponed: 'bg-orange-50 border-orange-200 text-orange-700',
  cancelled: 'bg-rose-50 border-rose-200 text-rose-700',
};

const statusDotMap = {
  yet_to_start: 'bg-slate-400',
  in_progress: 'bg-amber-500',
  done: 'bg-emerald-500',
  carry_forward: 'bg-violet-500',
  postponed: 'bg-orange-500',
  cancelled: 'bg-rose-500',
};

export default function TimeSlotGrid({
  instructorId,
  dateStr,
  readOnly = false,
}) {
  const { timeSlots, categories, getLog, updateSlot } = useApp();
  const log = getLog(instructorId, dateStr);
  
  // State for time editing
  const [editingTimeSlotId, setEditingTimeSlotId] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // State for reason expanding
  const [expandedReasonIds, setExpandedReasonIds] = useState(new Set());

  if (!log) {
    return (
      <div className="text-center py-12 text-text-muted">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No log data for this date.</p>
      </div>
    );
  }

  // --- Time Edit Logic ---
  const handleStartTimeEdit = (slotId, startTime, endTime) => {
    if (readOnly) return;
    setEditingTimeSlotId(slotId);
    setEditStartTime(startTime);
    setEditEndTime(endTime);
  };

  const confirmTimeEdit = (slotId) => {
    if (editStartTime.trim() && editEndTime.trim()) {
      updateSlot(instructorId, dateStr, slotId, 'customStartTime', editStartTime.trim());
      updateSlot(instructorId, dateStr, slotId, 'customEndTime', editEndTime.trim());

      // Cascade to the next non-lunch slot
      const currentIndex = timeSlots.findIndex(s => s.id === slotId);
      let nextIndex = currentIndex + 1;
      while (nextIndex < timeSlots.length && timeSlots[nextIndex].isLunch) {
        nextIndex++;
      }
      
      if (nextIndex < timeSlots.length) {
        const nextSlotId = timeSlots[nextIndex].id;
        updateSlot(instructorId, dateStr, nextSlotId, 'customStartTime', editEndTime.trim());
      }
    }
    setEditingTimeSlotId(null);
  };

  const cancelTimeEdit = () => {
    setEditingTimeSlotId(null);
    setEditStartTime('');
    setEditEndTime('');
  };

  // --- Reason Edit Logic ---
  const handleStatusChange = (slotId, newStatus) => {
    updateSlot(instructorId, dateStr, slotId, 'status', newStatus);
    
    // Auto-expand the reason field if it requires one
    if (['yet_to_start', 'cancelled', 'postponed'].includes(newStatus)) {
      setExpandedReasonIds(prev => new Set(prev).add(slotId));
    } else {
      // If changed to something else, remove from expanded set and clear reason
      setExpandedReasonIds(prev => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });
      updateSlot(instructorId, dateStr, slotId, 'reason', '');
    }
  };

  const toggleReasonEdit = (slotId) => {
    if (readOnly) return;
    setExpandedReasonIds(prev => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[160px_1fr_1fr_180px] gap-3 px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
        <span>Time</span>
        <span>Activity / Task</span>
        <span>Outcome</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {timeSlots.map((slot, idx) => {
        const entry = log.find(e => e.slotId === slot.id);

        if (slot.isLunch) {
          return (
            <div
              key={slot.id}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr_1fr_180px] gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 items-center"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                <span className="text-xs font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded-lg">
                  {slot.startTime} – {slot.endTime}
                </span>
              </div>
              <div className="md:col-span-3 flex items-center gap-2 text-slate-400">
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">Lunch Break</span>
                <span className="text-xs">— Take a break, you deserve it! 🍽️</span>
              </div>
            </div>
          );
        }

        const status = entry?.status || 'yet_to_start';
        const isDone = status === 'done';
        const needsReason = ['yet_to_start', 'cancelled', 'postponed'].includes(status);
        
        const displayStart = entry?.customStartTime || slot.startTime;
        const displayEnd = entry?.customEndTime || slot.endTime;
        const isEditingTime = editingTimeSlotId === slot.id;
        const isReasonExpanded = expandedReasonIds.has(slot.id);

        return (
          <div key={slot.id} className="relative">
            {/* Main Row */}
            <div
              className={`
                grid grid-cols-1 md:grid-cols-[160px_1fr_1fr_180px] gap-3 px-4 py-3 rounded-xl border
                bg-white transition-all duration-300 items-center
                ${isDone ? 'opacity-45' : 'hover:shadow-md border-slate-200'}
                ${isReasonExpanded ? 'rounded-b-none border-b-0' : ''}
              `}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Time Column — Editable on single click of the pencil icon */}
              <div className="flex items-center gap-1">
                {isEditingTime ? (
                  <div className="flex items-center gap-1 animate-fade-in bg-primary-50 p-1 rounded-lg border border-primary-200">
                    <input
                      type="text"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmTimeEdit(slot.id)}
                      className="w-[60px] text-xs font-mono px-1.5 py-1 rounded-md border border-primary-300 focus-ring bg-white text-primary-700 text-center"
                      autoFocus
                    />
                    <span className="text-text-muted text-xs">–</span>
                    <input
                      type="text"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmTimeEdit(slot.id)}
                      className="w-[60px] text-xs font-mono px-1.5 py-1 rounded-md border border-primary-300 focus-ring bg-white text-primary-700 text-center"
                    />
                    <div className="flex flex-col gap-0.5 ml-1">
                      <button onClick={() => confirmTimeEdit(slot.id)} className="p-0.5 rounded text-emerald-600 hover:bg-emerald-200 bg-emerald-100 transition-colors">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={cancelTimeEdit} className="p-0.5 rounded text-slate-500 hover:bg-slate-200 bg-slate-100 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group">
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                      <span className="text-xs font-mono font-medium">{displayStart}</span>
                      <span className="text-text-muted text-xs">–</span>
                      <span className="text-xs font-mono font-medium">{displayEnd}</span>
                    </div>
                    {!readOnly && (
                      <button 
                        onClick={() => handleStartTimeEdit(slot.id, displayStart, displayEnd)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Time"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Activity Dropdown */}
              <div>
                <SearchableDropdown
                  options={categories}
                  value={entry?.activity}
                  onChange={(val) => updateSlot(instructorId, dateStr, slot.id, 'activity', val)}
                  placeholder="Select activity..."
                  disabled={readOnly}
                />
              </div>

              {/* Outcome Input */}
              <div>
                <input
                  type="text"
                  value={entry?.outcome || ''}
                  onChange={(e) => updateSlot(instructorId, dateStr, slot.id, 'outcome', e.target.value)}
                  placeholder="What was accomplished?"
                  disabled={readOnly}
                  className={`
                    w-full px-3 py-2 rounded-lg border border-slate-200 text-sm
                    focus-ring bg-white placeholder:text-text-muted
                    ${readOnly ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'hover:border-primary-300'}
                  `}
                />
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col gap-2">
                {readOnly ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusColorMap[status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[status]}`} />
                    {STATUS_OPTIONS.find(s => s.value === status)?.label || status}
                  </span>
                ) : (
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(slot.id, e.target.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer focus-ring
                      ${statusColorMap[status]}
                    `}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Tag displaying the saved reason when collapsed */}
            {needsReason && !isReasonExpanded && entry?.reason && (
              <div className="px-4 py-2 -mt-3 bg-white border border-t-0 border-slate-200 rounded-b-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="font-medium text-slate-500">Reason:</span>
                  <span className="truncate max-w-[400px]">{entry.reason}</span>
                </div>
                {!readOnly && (
                  <button 
                    onClick={() => toggleReasonEdit(slot.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 px-2 py-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                  >
                    Edit Tag
                  </button>
                )}
              </div>
            )}

            {/* Expanded Reason Field */}
            {needsReason && (
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isReasonExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="flex items-start gap-3 px-4 py-3 rounded-b-xl border border-t-0 bg-slate-50 border-slate-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Add a reason tag
                      </label>
                      <input
                        type="text"
                        value={entry?.reason || ''}
                        onChange={(e) => updateSlot(instructorId, dateStr, slot.id, 'reason', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleReasonEdit(slot.id)}
                        placeholder="Why was this not completed?"
                        disabled={readOnly}
                        autoFocus
                        className={`
                          w-full mt-1.5 px-3 py-2 rounded-lg border text-sm focus-ring
                          placeholder:text-slate-400 border-slate-300 bg-white
                          ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}
                        `}
                      />
                    </div>
                    {!readOnly && (
                      <button 
                        onClick={() => toggleReasonEdit(slot.id)}
                        className="self-end px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Save Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
