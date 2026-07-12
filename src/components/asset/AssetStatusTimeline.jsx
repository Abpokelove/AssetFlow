import { CheckCircle, Circle, Clock } from 'lucide-react';
import { STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function AssetStatusTimeline({ timeline = [] }) {
  return (
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border-divider" />

      <div className="space-y-0">
        {timeline.map((entry, i) => {
          const isLast = i === timeline.length - 1;
          const colors = STATUS_COLORS[entry.status] || { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' };
          return (
            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Node */}
              <div
                className="relative z-10 w-7 h-7 rounded-full border-2 border-surface flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: isLast ? colors.dot : `${colors.dot}30`, borderColor: isLast ? colors.dot : '#E9D7CC' }}
              >
                {isLast ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <CheckCircle size={12} style={{ color: colors.dot }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {entry.status}
                  </span>
                  <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{entry.note}</p>
                <p className="text-[11px] text-text-muted mt-0.5">by {entry.by}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
