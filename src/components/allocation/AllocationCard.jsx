import { Calendar, User, Building2, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function AllocationCard({ allocation, onReturn, onTransfer }) {
  const isOverdue = allocation.expectedReturn && new Date(allocation.expectedReturn) < new Date() && !allocation.returnedDate;
  return (
    <div className={`bg-surface rounded-card border p-4 space-y-3 transition-shadow hover:shadow-card-hover ${isOverdue ? 'border-status-lost/40 bg-red-50/30' : 'border-border'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary">{allocation.assetName}</p>
          <p className="text-xs text-text-muted font-mono">{allocation.assetTag}</p>
        </div>
        <StatusBadge status={allocation.status === 'Active' ? 'Allocated' : 'Available'} size="sm" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <User size={11} className="text-text-muted" />{allocation.employeeName}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Building2 size={11} className="text-text-muted" />{allocation.department}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar size={11} className="text-text-muted" />
          Since {formatDate(allocation.allocatedDate)}
          {allocation.expectedReturn && (
            <span className={`ml-1 font-medium ${isOverdue ? 'text-status-lost' : 'text-text-secondary'}`}>
              · Return {isOverdue ? 'overdue' : formatDate(allocation.expectedReturn)}
            </span>
          )}
        </div>
      </div>
      {allocation.status === 'Active' && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => onTransfer?.(allocation)} className="flex-1 text-xs font-semibold text-primary border border-primary/30 rounded-button py-1.5 hover:bg-primary hover:text-white transition-all">
            Transfer
          </button>
          <button onClick={() => onReturn?.(allocation)} className="flex-1 text-xs font-semibold text-status-available border border-status-available/30 rounded-button py-1.5 hover:bg-status-available hover:text-white transition-all">
            Return
          </button>
        </div>
      )}
    </div>
  );
}
