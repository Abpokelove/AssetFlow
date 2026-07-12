import { BarChart3 } from 'lucide-react';

/**
 * HeatMapPlaceholder
 * ------------------
 * Visual placeholder for an asset utilization heatmap.
 * Backend: GET /api/reports/heatmap?year=2024
 * Returns: { month: string, dept: string, utilization: number }[]
 */
export default function HeatMapPlaceholder() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const depts = ['IT Ops', 'Engineering', 'Finance', 'Marketing', 'Sales', 'HR', 'Operations'];

  // Fake utilization values for visualization
  const getColor = (val) => {
    if (val >= 85) return '#5E244E';
    if (val >= 70) return '#AA1C41';
    if (val >= 55) return '#E68457';
    if (val >= 40) return '#F2A37C';
    return '#F1E5DD';
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-text-muted font-medium w-20">Dept</th>
              {months.map((m) => (
                <th key={m} className="text-center py-2 px-1 text-text-muted font-medium min-w-[32px]">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depts.map((dept, di) => (
              <tr key={dept}>
                <td className="py-1 pr-3 text-text-secondary font-medium text-xs whitespace-nowrap">{dept}</td>
                {months.map((_, mi) => {
                  const val = Math.floor(30 + Math.random() * 60 + di * 5 + mi * 2) % 100;
                  return (
                    <td key={mi} className="py-1 px-1 text-center">
                      <div
                        className="w-full h-7 rounded flex items-center justify-center text-[10px] font-semibold transition-all hover:scale-110 cursor-default"
                        style={{ backgroundColor: getColor(val), color: val >= 70 ? '#fff' : '#5E244E' }}
                        title={`${dept} — ${months[mi]}: ${val}%`}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span className="text-xs text-text-muted">Utilization:</span>
        {[
          { label: '< 40%', color: '#F1E5DD' },
          { label: '40–55%', color: '#F2A37C' },
          { label: '55–70%', color: '#E68457' },
          { label: '70–85%', color: '#AA1C41' },
          { label: '> 85%', color: '#5E244E' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-muted italic">
        Placeholder — connect to GET /api/reports/heatmap for live data
      </p>
    </div>
  );
}
