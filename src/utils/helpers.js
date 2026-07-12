import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

// ============================================================
// AssetFlow — Helper Utilities
// ============================================================

/**
 * Format a date string or Date object
 * @param {string|Date} date
 * @param {string} fmt - date-fns format string
 */
export function formatDate(date, fmt = DATE_FORMAT) {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, fmt) : '—';
  } catch {
    return '—';
  }
}

/**
 * Format a datetime string
 */
export function formatDateTime(date) {
  return formatDate(date, DATETIME_FORMAT);
}

/**
 * Relative time (e.g. "2 hours ago")
 */
export function timeAgo(date) {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

/**
 * Generate a random asset tag ID
 * Format: AF-XXXX-XXXX
 */
export function generateAssetTag() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `AF-${seg(4)}-${seg(4)}`;
}

/**
 * Truncate a string to a max length
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

/**
 * Convert a number to a currency string
 * @param {number} value
 * @param {string} currency
 */
export function formatCurrency(value, currency = 'USD') {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get initials from a full name
 * "Sarah Mitchell" → "SM"
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Group an array of objects by a key
 * @param {Array} arr
 * @param {string} key
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key] ?? 'Unknown';
    acc[group] = acc[group] ?? [];
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * Sort an array of objects by a key (ascending)
 */
export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter assets by search query across multiple fields
 */
export function filterBySearch(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? '').toLowerCase().includes(q))
  );
}

/**
 * Download a blob as a file
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Returns a color class pair for a given percentage value (for progress bars)
 */
export function getUtilizationColor(pct) {
  if (pct >= 90) return { bg: '#FFEBEE', bar: '#C0392B' };
  if (pct >= 70) return { bg: '#FFF3E0', bar: '#E68457' };
  return { bg: '#E8F5E9', bar: '#4CAF50' };
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}
