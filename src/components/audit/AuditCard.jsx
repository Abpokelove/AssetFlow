import { ClipboardList, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function AuditCard({ audit, onClick }) {
  const progress = audit.totalAssets > 0 ? Math.round((audit.verified / audit.totalAssets) * 100) : 0;
  return (
    <div onClick={() => onClick?.(audit)}
      className="bg-surface rounded-card border border-border p-5 cursor-pointer hover:shadow-card-hover transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList size={16} className="text-primary" />
        </div>
        <StatusBadge status={audit.status} size="sm" />
      </div>

      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug mb-1">
        {audit.name}
      </h3>
      <p className="text-xs text-text-muted">{audit.category}</p>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <User size={11} className="text-text-muted" />Auditor: {audit.auditor}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar size={11} className="text-text-muted" />
          {formatDate(audit.startDate)} → {formatDate(audit.endDate)}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted">{audit.verified}/{audit.totalAssets} verified</span>
          <span className="text-xs font-semibold text-text-primary">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{
            width: `${progress}%`,
            backgroundColor: audit.discrepancies > 0 ? '#C0392B' : '#4CAF50',
          }} />
        </div>
        {audit.discrepancies > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <AlertTriangle size={11} className="text-status-lost" />
            <span className="text-xs text-status-lost font-medium">{audit.discrepancies} discrepancies</span>
          </div>
        )}
      </div>
    </div>
  );
}
