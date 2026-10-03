// The author name is appended to the stored text as "\n- name".
// Split it back out for display.
export const splitNote = (text: string): { body: string; author: string | null } => {
  const idx = text.lastIndexOf('\n- ');
  if (idx === -1) return { body: text.trim(), author: null };
  return { body: text.slice(0, idx).trim(), author: text.slice(idx + 3).trim() };
};

// Normalize a note's timestamp to a stable day key (or 'unknown' if unparseable).
export const dayKey = (ts: string): string => {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 'unknown' : d.toDateString();
};

// Human label for a day.
export const formatDayLabel = (key: string): string => {
  if (key === 'unknown') return 'Undated';
  const d = new Date(key);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};

// Smaller handwriting for longer thoughts so they still fit on the paper.
export const noteFontSize = (length: number) =>
  length < 30 ? 32 : length < 70 ? 26 : length < 140 ? 21 : length < 240 ? 17 : 15;
