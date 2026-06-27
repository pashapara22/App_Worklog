import { format, subDays, isWeekend } from 'date-fns';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Classroom Lecture', icon: '📚' },
  { id: 'cat-2', name: 'Lab Session', icon: '🔬' },
  { id: 'cat-3', name: 'Mentoring', icon: '🤝' },
  { id: 'cat-4', name: 'Content Creation', icon: '✍️' },
  { id: 'cat-5', name: 'Administrative', icon: '📋' },
  { id: 'cat-6', name: 'Research', icon: '🔍' },
  { id: 'cat-7', name: 'Student Evaluation', icon: '📝' },
  { id: 'cat-8', name: 'Meeting', icon: '👥' },
  { id: 'cat-9', name: 'Training & Development', icon: '🎯' },
];

export const STATUS_OPTIONS = [
  { value: 'yet_to_start', label: 'Yet to Start', color: 'slate' },
  { value: 'in_progress', label: 'In Progress', color: 'amber' },
  { value: 'done', label: 'Done', color: 'emerald' },
  { value: 'carry_forward', label: 'Carry Forward', color: 'violet' },
  { value: 'postponed', label: 'Postponed', color: 'orange' },
  { value: 'cancelled', label: 'Cancelled', color: 'rose' },
];

export const DEFAULT_TIME_CONFIG = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 30,
  lunchStartHour: 13,
  lunchEndHour: 14,
  slotDurationMinutes: 60,
};

export const INSTRUCTORS = [
  { id: 'admin-1', name: 'System Admin', email: 'admin@institute.edu', avatar: 'AD', department: 'Administration', employeeId: 'A0000' },
  { id: 'inst-1', name: 'Dr. Sarah Johnson', email: 'sarah.j@institute.edu', avatar: 'SJ', department: 'Computer Science', employeeId: 'I0001' },
  { id: 'inst-2', name: 'Prof. Michael Chen', email: 'michael.c@institute.edu', avatar: 'MC', department: 'Mathematics', employeeId: 'I0002' },
  { id: 'inst-3', name: 'Dr. Emily Rodriguez', email: 'emily.r@institute.edu', avatar: 'ER', department: 'Physics', employeeId: 'I0003' },
  { id: 'inst-4', name: 'Prof. David Kim', email: 'david.k@institute.edu', avatar: 'DK', department: 'Engineering', employeeId: 'I0004' },
  { id: 'inst-5', name: 'Dr. Lisa Patel', email: 'lisa.p@institute.edu', avatar: 'LP', department: 'Biology', employeeId: 'I0005' },
];

export function formatTime(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function generateTimeSlots(config = DEFAULT_TIME_CONFIG) {
  const slots = [];
  let currentHour = config.startHour;
  let currentMinute = config.startMinute;

  while (
    currentHour < config.endHour ||
    (currentHour === config.endHour && currentMinute < config.endMinute)
  ) {
    let endHour = currentHour + 1;
    let endMinute = currentMinute;

    // Handle the last slot (may be 30 min)
    if (endHour > config.endHour || (endHour === config.endHour && endMinute > config.endMinute)) {
      endHour = config.endHour;
      endMinute = config.endMinute;
    }

    const isLunch =
      currentHour >= config.lunchStartHour && currentHour < config.lunchEndHour;

    slots.push({
      id: `slot-${currentHour}-${currentMinute}`,
      startTime: formatTime(currentHour, currentMinute),
      endTime: formatTime(endHour, endMinute),
      startHour: currentHour,
      isLunch,
    });

    currentHour = endHour;
    currentMinute = endMinute;
  }

  return slots;
}

function getPreviousWorkday(dateStr) {
  let d = subDays(new Date(dateStr), 1);
  while (isWeekend(d)) {
    d = subDays(d, 1);
  }
  return format(d, 'yyyy-MM-dd');
}

export function createEmptyEntry(slotId, isLunch) {
  return {
    slotId,
    activity: isLunch ? null : null,
    outcome: isLunch ? '' : '',
    status: isLunch ? null : 'yet_to_start',
    reason: '',
    customStartTime: '',
    customEndTime: '',
  };
}

export function generateMockWorklogs(categories) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = getPreviousWorkday(today);
  const dayBefore = getPreviousWorkday(yesterday);
  const slots = generateTimeSlots();

  const worklogs = {};

  // inst-1: filled yesterday fully, today partially, day before yesterday fully done
  worklogs['inst-1'] = {
    [dayBefore]: slots.map(slot => ({
      ...createEmptyEntry(slot.id, slot.isLunch),
      activity: slot.isLunch ? null : categories[Math.floor(Math.random() * 4)].id,
      outcome: slot.isLunch ? '' : 'Completed session',
      status: slot.isLunch ? null : 'done',
    })),
    [yesterday]: slots.map(slot => ({
      ...createEmptyEntry(slot.id, slot.isLunch),
      activity: slot.isLunch ? null : categories[Math.floor(Math.random() * 4)].id,
      outcome: slot.isLunch ? '' : 'Completed session on topic ' + slot.startTime,
      status: slot.isLunch ? null : 'done',
    })),
    [today]: slots.map((slot, i) => ({
      ...createEmptyEntry(slot.id, slot.isLunch),
      activity: slot.isLunch ? null : (i < 4 ? categories[i % categories.length].id : null),
      outcome: slot.isLunch ? '' : (i < 4 ? 'Morning work completed' : ''),
      status: slot.isLunch ? null : (i < 4 ? 'done' : 'yet_to_start'),
    })),
  };

  // inst-2: filled today fully
  worklogs['inst-2'] = {
    [today]: slots.map(slot => ({
      ...createEmptyEntry(slot.id, slot.isLunch),
      activity: slot.isLunch ? null : categories[Math.floor(Math.random() * categories.length)].id,
      outcome: slot.isLunch ? '' : 'Session planned and completed',
      status: slot.isLunch ? null : 'done',
    })),
  };

  // inst-3: partially filled today with mixed statuses
  worklogs['inst-3'] = {
    [today]: slots.map((slot, i) => {
      const statuses = ['done', 'in_progress', 'postponed', 'yet_to_start', 'cancelled'];
      return {
        ...createEmptyEntry(slot.id, slot.isLunch),
        activity: slot.isLunch ? null : (i < 5 ? categories[i % categories.length].id : null),
        outcome: slot.isLunch ? '' : (i < 5 ? 'Working on task' : ''),
        status: slot.isLunch ? null : (i < 5 ? statuses[i] : 'yet_to_start'),
        reason: slot.isLunch ? '' : (i === 2 ? 'Client rescheduled' : i === 4 ? 'Equipment failure' : ''),
      };
    }),
  };

  // inst-4 and inst-5: no log today (pending)
  worklogs['inst-4'] = {};
  worklogs['inst-5'] = {};

  return worklogs;
}
