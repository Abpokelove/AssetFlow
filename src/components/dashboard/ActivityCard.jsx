import { Link } from 'react-router-dom';
import { ArrowUpRight, Package, ArrowLeftRight, CalendarDays, Wrench, ClipboardList, Plus } from 'lucide-react';

const TYPE_CONFIG = {
  allocation: { icon: ArrowLeftRight, color: '#5E244E', bg: '#EDE7F6' },
  maintenance: { icon: Wrench, color: '#E68457', bg: '#FFF3E0' },
  booking: { icon: CalendarDays, color: '#AA1C41', bg: '#FCE4EC' },
  return: { icon: Package, color: '#4CAF50', bg: '#E8F5E9' },
  audit: { icon: ClipboardList, color: '#1976D2', bg: '#E3F2FD' },
  registration: { icon: Plus, color: '#5E244E', bg: '#EDE7F6' },
};

export default function ActivityCard({ activities = [] }) {
  return (
    <div className="space-y-1">
      {activities.map((item) => {
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.registration;
        const Icon = cfg.icon;
        return (
          <div key={item.id} className="flex items-center gap-3 py-2.5 px-1 rounded-button hover:bg-background transition-colors group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{item.action}</p>
              <p className="text-xs text-text-secondary truncate">{item.asset} · {item.user}</p>
            </div>
            <span className="text-xs text-text-muted flex-shrink-0">{item.time}</span>
          </div>
        );
      })}
    </div>
  );
}
