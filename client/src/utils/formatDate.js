// client/src/utils/formatDate.js

/**
 * Formats an ISO date string into a readable short date.
 * e.g. "2026-03-01T10:00:00Z" → "Mar 1, 2026"
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
};