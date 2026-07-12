import { Wrench, Calendar, User, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';

const PRIORITY_CONFIG = {
  Critical: { bg: '#FFEBEE', text: '#C62828' },
  High: { bg: '#FFF3E0', text: '#E65100' },
  Medium: { bg: '#FFF8E1', text: '#8B6914' },
  Low: { bg: '#E8F5E9', text: '#2E7D32' },
};

export default function MaintenanceCard({ maintenance, onClick }) {
  const pCfg = PRIORITY_CONFIG[maintenance.priority] || PRIORITY_CONFIG.Low;
  return (
    <div
      onClick={() => onClick?.(maintenance)}
      className="bg-surface rounded-card border border-border p-5 cursor-pointer hover:shadow-card-hover transition-shadow group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Wrench size={16} className="text-accent" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: pCfg.bg, color: pCfg.text }}>
            {maintenance.priority}
          </span>
          <StatusBadge status={maintenance.status} size="sm" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
        {maintenance.assetName}
      </h3>
      <p className="text-xs text-text-muted font-mono">{maintenance.assetTag}</p>
      <p className="text-xs text-text-secondary mt-2 line-clamp-2">{maintenance.description}</p>

      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <User size={11} className="text-text-muted" />Requested by {maintenance.requestedBy}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar size={11} className="text-text-muted" />
          {formatDate(maintenance.requestedDate)}
          {maintenance.scheduledDate && ` · Scheduled ${formatDate(maintenance.scheduledDate)}`}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="text-text-muted text-[11px]">Type:</span> {maintenance.type}
        </div>
      </div>
    </div>
  );
}
