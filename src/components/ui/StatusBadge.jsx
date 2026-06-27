const STATUS_STYLES = {
  yet_to_start: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: 'Yet to Start',
  },
  in_progress: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'In Progress',
  },
  done: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Done',
  },
  carry_forward: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    label: 'Carry Forward',
  },
  postponed: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    label: 'Postponed',
  },
  cancelled: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    label: 'Cancelled',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] || STATUS_STYLES.yet_to_start;

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${style.bg} ${style.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export { STATUS_STYLES };
