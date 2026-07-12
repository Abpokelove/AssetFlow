import { Bell, Wrench, ArrowLeftRight, CalendarDays, ClipboardList, Package, Info } from 'lucide-react';

const ICON_MAP = {
  maintenance: { Icon: Wrench, color: '#E68457', bg: '#FFF3E0' },
  allocation: { Icon: ArrowLeftRight, color: '#5E244E', bg: '#EDE7F6' },
  booking: { Icon: CalendarDays, color: '#AA1C41', bg: '#FCE4EC' },
  audit: { Icon: ClipboardList, color: '#1976D2', bg: '#E3F2FD' },
  return: { Icon: Package, color: '#4CAF50', bg: '#E8F5E9' },
  system: { Icon: Info, color: '#9CA3AF', bg: '#F5F5F5' },
};

const PRIORITY_DOT = { High: '#C0392B', Medium: '#F4A261', Low: '#4CAF50' };

export default function NotificationCard({ notification }) {
  const cfg = ICON_MAP[notification.type] || ICON_MAP.system;
  const { Icon } = cfg;

  return (
    <div className={`flex gap-3 p-3 rounded-button transition-all duration-200 hover:bg-background hover:-translate-y-[1px] ${!notification.read ? 'bg-primary/5' : ''}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: cfg.bg }}>
        <Icon size={14} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold ${notification.read ? 'text-text-primary' : 'text-primary'} leading-snug`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: PRIORITY_DOT[notification.priority] }} />
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
      </div>
    </div>
  );
}
