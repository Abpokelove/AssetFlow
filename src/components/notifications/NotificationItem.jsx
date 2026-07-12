import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeftRight, CalendarDays, ClipboardList, Package, Info, X, CheckCircle } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

const TYPE_CONFIG = {
  maintenance: { Icon: Wrench, color: '#E68457', bg: '#FFF3E0' },
  allocation: { Icon: ArrowLeftRight, color: '#5E244E', bg: '#EDE7F6' },
  booking: { Icon: CalendarDays, color: '#AA1C41', bg: '#FCE4EC' },
  audit: { Icon: ClipboardList, color: '#1976D2', bg: '#E3F2FD' },
  return: { Icon: Package, color: '#4CAF50', bg: '#E8F5E9' },
  system: { Icon: Info, color: '#9CA3AF', bg: '#F5F5F5' },
};

const PRIORITY_COLORS = { High: '#C0392B', Medium: '#F4A261', Low: '#4CAF50' };

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const { Icon } = cfg;

  const handleClick = () => {
    if (!notification.read) onMarkRead?.(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div
      className={`flex gap-4 p-4 rounded-card border transition-all duration-200 hover:shadow-card-hover hover:-translate-y-[1px] group cursor-pointer ${
        !notification.read ? 'bg-primary/4 border-primary/15' : 'bg-surface/95 border-border hover:border-border-divider'
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: cfg.bg }}>
        <Icon size={16} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className={`text-sm font-semibold flex-1 ${!notification.read ? 'text-primary' : 'text-text-primary'}`}>
            {notification.title}
            {!notification.read && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-1.5 mb-0.5 align-middle" />
            )}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[notification.priority] }} title={`${notification.priority} priority`} />
            <span className="text-xs text-text-muted font-medium capitalize">{notification.priority}</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{notification.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">{timeAgo(notification.timestamp)}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkRead?.(notification.id); }}
                className="p-1 rounded hover:bg-background transition-colors text-text-muted hover:text-status-available"
                title="Mark as read"
              >
                <CheckCircle size={13} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(notification.id); }}
              className="p-1 rounded hover:bg-background transition-colors text-text-muted hover:text-status-lost"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
