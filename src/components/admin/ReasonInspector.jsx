import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Clock, XCircle, ArrowRightLeft } from 'lucide-react';

export default function ReasonInspector({ flaggedRows }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'cancelled': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Cancelled' };
      case 'postponed': return { icon: ArrowRightLeft, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Postponed' };
      case 'yet_to_start': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Not Started' };
      default: return { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Unknown' };
    }
  };

  if (!flaggedRows || flaggedRows.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-text-primary">No Flagged Items</h3>
        <p className="text-xs text-text-secondary mt-1">All tasks are running smoothly for this period.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          Attention Required
        </h3>
        <span className="text-xs font-semibold text-text-secondary px-2 py-1 bg-slate-100 rounded-md">
          {flaggedRows.length} Items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase w-8"></th>
              <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Instructor</th>
              <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Date</th>
              <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Activity</th>
              <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {flaggedRows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              const config = getStatusConfig(row.status);
              const Icon = config.icon;
              
              return (
                <React.Fragment key={row.id}>
                  <tr 
                    onClick={() => toggleRow(row.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {row.instructorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary max-w-[200px] truncate">
                      {row.activity || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                  </tr>
                  {/* Expanded Reason Row */}
                  <tr className={`
                    bg-slate-50/50 overflow-hidden transition-all duration-300
                    ${isExpanded ? 'table-row' : 'hidden'}
                  `}>
                    <td colSpan={5} className="px-4 py-4 border-b border-slate-100">
                      <div className="pl-8 animate-slide-up">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Reason for change
                        </h4>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-text-primary shadow-sm relative">
                          {row.reason ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{row.reason}</p>
                          ) : (
                            <p className="text-text-muted italic">No reason provided by the instructor.</p>
                          )}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-slate-200"></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[7px] w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-white"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
