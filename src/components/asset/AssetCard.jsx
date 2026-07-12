import { useNavigate } from 'react-router-dom';
import { Package, QrCode, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function AssetCard({ asset, index = 0 }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => navigate(`/assets/${asset.id}`)}
      className="bg-surface rounded-card border border-border p-5 cursor-pointer hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
          <Package size={18} className="text-primary" />
        </div>
        <StatusBadge status={asset.status} size="sm" />
      </div>

      <h3 className="text-sm font-bold text-text-primary leading-snug mb-0.5 group-hover:text-primary transition-colors">
        {asset.name}
      </h3>
      <p className="text-xs text-text-muted font-mono">{asset.tag}</p>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <MapPin size={11} className="flex-shrink-0 text-text-muted" />
          {asset.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar size={11} className="flex-shrink-0 text-text-muted" />
          Purchased {formatDate(asset.purchaseDate)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div>
          <p className="text-[11px] text-text-muted">Category</p>
          <p className="text-xs font-medium text-text-primary">{asset.category}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted">Value</p>
          <p className="text-xs font-semibold text-text-primary">{formatCurrency(asset.currentValue)}</p>
        </div>
      </div>
    </motion.div>
  );
}
