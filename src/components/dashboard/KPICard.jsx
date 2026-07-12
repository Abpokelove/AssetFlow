import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPICard
 * Props: title, value, icon, color, trend, trendLabel, onClick
 */
export default function KPICard({ title, value, icon: Icon, color = '#5E244E', trend, trendLabel, onClick, delay = 0 }) {
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className={`bg-surface rounded-card shadow-card border border-border p-5 flex flex-col gap-3 ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{value?.toLocaleString()}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={13} className="text-status-available" />
          ) : (
            <TrendingDown size={13} className="text-status-lost" />
          )}
          <span className={`text-xs font-semibold ${isPositive ? 'text-status-available' : 'text-status-lost'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span className="text-xs text-text-muted">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
