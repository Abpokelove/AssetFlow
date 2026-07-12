import { STATUS_COLORS } from '../../utils/constants';

/**
 * StatusBadge
 * -----------
 * Renders a pill badge for any asset/booking/maintenance/audit status.
 * Props: status (string), size ('sm' | 'md')
 */
export default function StatusBadge({ status, size = 'md' }) {
  const colors = STATUS_COLORS[status] || { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' };

  const sizeClass = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      {status}
    </span>
  );
}
