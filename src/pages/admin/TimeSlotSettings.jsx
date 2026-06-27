import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateTimeSlots } from '../../data/mockData';
import {
  Settings,
  Clock,
  Coffee,
  Save,
  RotateCcw,
  Eye,
  Check,
  AlertTriangle,
} from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatTime(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function TimeSlotSettings() {
  const { timeConfig, updateTimeConfig } = useApp();
  const [draft, setDraft] = useState({ ...timeConfig });
  const [saved, setSaved] = useState(false);

  const previewSlots = useMemo(() => generateTimeSlots(draft), [draft]);

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: parseInt(value, 10) }));
    setSaved(false);
  };

  const handleSave = () => {
    updateTimeConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setDraft({ ...timeConfig });
    setSaved(false);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(timeConfig);

  const isValid = draft.startHour < draft.endHour &&
    draft.lunchStartHour >= draft.startHour &&
    draft.lunchEndHour <= draft.endHour &&
    draft.lunchStartHour < draft.lunchEndHour;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" />
          Time Slot Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Configure the global time slots for the instructor worklog grid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Working Hours */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Working Hours
            </h2>

            <div className="space-y-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Start Time</label>
                <div className="flex gap-2">
                  <select
                    value={draft.startHour}
                    onChange={(e) => handleChange('startHour', e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                  >
                    {HOURS.filter(h => h >= 6 && h <= 12).map(h => (
                      <option key={h} value={h}>{formatTime(h, 0)}</option>
                    ))}
                  </select>
                  <select
                    value={draft.startMinute}
                    onChange={(e) => handleChange('startMinute', e.target.value)}
                    className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                  >
                    {MINUTES.map(m => (
                      <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">End Time</label>
                <div className="flex gap-2">
                  <select
                    value={draft.endHour}
                    onChange={(e) => handleChange('endHour', e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                  >
                    {HOURS.filter(h => h >= 14 && h <= 22).map(h => (
                      <option key={h} value={h}>{formatTime(h, 0)}</option>
                    ))}
                  </select>
                  <select
                    value={draft.endMinute}
                    onChange={(e) => handleChange('endMinute', e.target.value)}
                    className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                  >
                    {MINUTES.map(m => (
                      <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lunch Break */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600" />
              Lunch Break
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Start Hour</label>
                <select
                  value={draft.lunchStartHour}
                  onChange={(e) => handleChange('lunchStartHour', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                >
                  {HOURS.filter(h => h >= draft.startHour && h < draft.endHour).map(h => (
                    <option key={h} value={h}>{formatTime(h, 0)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">End Hour</label>
                <select
                  value={draft.lunchEndHour}
                  onChange={(e) => handleChange('lunchEndHour', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus-ring cursor-pointer bg-white"
                >
                  {HOURS.filter(h => h > draft.lunchStartHour && h <= draft.endHour).map(h => (
                    <option key={h} value={h}>{formatTime(h, 0)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Validation Warning */}
          {!isValid && (
            <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-4 border border-rose-200 animate-slide-down">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-800">Invalid Configuration</p>
                <p className="text-sm text-rose-600/80">
                  Please ensure start time is before end time, and the lunch break falls within working hours.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!isValid || !hasChanges}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all
                ${isValid && hasChanges
                  ? 'gradient-primary text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-slate-200 text-text-secondary hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm animate-fade-in">
                <Check className="w-4 h-4" />
                Settings saved!
              </span>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="glass-card rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="text-base font-bold text-text-primary mb-1 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary-600" />
            Slot Preview
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {previewSlots.length} slots generated
          </p>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2">
            {previewSlots.map((slot, idx) => (
              <div
                key={slot.id}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  ${slot.isLunch
                    ? 'bg-amber-50 border border-dashed border-amber-200'
                    : 'bg-slate-50 border border-slate-100'
                  }
                `}
              >
                <span className={`
                  text-xs font-mono font-medium px-2 py-0.5 rounded
                  ${slot.isLunch ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary-700'}
                `}>
                  {idx + 1}
                </span>
                <span className={`text-sm font-medium ${slot.isLunch ? 'text-amber-700' : 'text-text-primary'}`}>
                  {slot.startTime} – {slot.endTime}
                </span>
                {slot.isLunch && (
                  <span className="text-xs text-amber-600 ml-auto flex items-center gap-1">
                    <Coffee className="w-3 h-3" />
                    Lunch
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
