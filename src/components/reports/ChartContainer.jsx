export default function ChartContainer({ title, subtitle, children, action }) {
  return (
    <div className="bg-surface rounded-card border border-border p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
