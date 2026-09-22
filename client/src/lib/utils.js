export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(date).toLocaleDateString();
}

export function formatDuration(sec = 0) {
  if (!sec || Number.isNaN(sec)) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export const cx = (...classes) => classes.filter(Boolean).join(' ');

/* ---- Resume playback (localStorage) ---- */
const RESUME_KEY = 'accj:resume';
export const getResume = (id) => {
  try {
    return JSON.parse(localStorage.getItem(RESUME_KEY))?.[id] || 0;
  } catch {
    return 0;
  }
};
export const setResume = (id, time) => {
  try {
    const all = JSON.parse(localStorage.getItem(RESUME_KEY)) || {};
    if (time > 5 && time < 360000) all[id] = time;
    else delete all[id];
    localStorage.setItem(RESUME_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};
