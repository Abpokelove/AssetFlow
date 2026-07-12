import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { Download, BarChart3, TrendingUp, PieChart as PieIcon, Map } from 'lucide-react';
import ChartContainer from '../components/reports/ChartContainer';
import HeatMapPlaceholder from '../components/reports/HeatMapPlaceholder';
import Button from '../components/common/Button';
import {
  mockAssetsByCategory, mockAssetsByStatus, mockMonthlyActivity, mockDepartmentUtilization,
} from '../utils/mockData';

// GET /api/reports/summary
// GET /api/reports/assets-by-category
// GET /api/reports/assets-by-status
// GET /api/reports/monthly-activity?months=7
// GET /api/reports/department-utilization
// GET /api/reports/depreciation?year=2024
// GET /api/reports/export?type=assets&format=csv

const PIE_COLORS = ['#5E244E', '#AA1C41', '#E68457', '#F2A37C', '#8D6E63', '#4CAF50', '#1976D2'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-card px-3 py-2.5 shadow-card text-xs">
      <p className="font-semibold text-text-primary mb-1">{label || payload[0]?.name}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const EXPORT_TYPES = ['Assets', 'Allocations', 'Maintenance', 'Audit'];

export default function Reports() {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async (type) => {
    setExportLoading(true);
    // TODO: const blob = await exportReport({ type: type.toLowerCase(), format: 'csv' });
    // TODO: downloadFile(blob, `${type}-report.csv`);
    await new Promise((r) => setTimeout(r, 800));
    setExportLoading(false);
  };

  return (
    <div className="af-page max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Reports & Analytics</h1>
          <p className="af-page-subtitle">Visual insights into your asset portfolio</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {EXPORT_TYPES.map((t) => (
            <Button key={t} variant="outline" size="sm" icon={<Download size={13} />} onClick={() => handleExport(t)} loading={exportLoading}>
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Asset Value', value: '$892,450', sub: 'Purchase value' },
          { label: 'Current Value', value: '$724,200', sub: 'After depreciation' },
          { label: 'Avg Utilization', value: '73%', sub: 'Across departments' },
          { label: 'Maintenance Cost', value: '$14,320', sub: 'YTD 2024' },
        ].map((item) => (
          <div key={item.label} className="bg-surface rounded-card border border-border p-4">
            <p className="text-xs text-text-muted">{item.label}</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{item.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Assets by Status */}
        <ChartContainer
          title="Assets by Status"
          subtitle="Current portfolio distribution"
          action={<PieIcon size={16} className="text-text-muted" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockAssetsByStatus} cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {mockAssetsByStatus.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Assets by Category */}
        <ChartContainer
          title="Assets by Category"
          subtitle="Count per category"
          action={<BarChart3 size={16} className="text-text-muted" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockAssetsByCategory} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1E5DD" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#5E244E08' }} />
              <Bar dataKey="value" name="Assets" fill="#5E244E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Row 2: Monthly activity + Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Monthly Activity */}
        <ChartContainer
          title="Monthly Activity"
          subtitle="Allocations, returns & maintenance (7 months)"
          action={<TrendingUp size={16} className="text-text-muted" />}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthlyActivity} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1E5DD" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#5E244E08' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="allocations" name="Allocations" fill="#5E244E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" name="Returns" fill="#E68457" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill="#AA1C41" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Department Utilization */}
        <ChartContainer
          title="Department Utilization"
          subtitle="% of allocated vs available assets"
          action={<TrendingUp size={16} className="text-text-muted" />}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockDepartmentUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1E5DD" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" width={36} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#5E244E" strokeWidth={2.5} dot={{ fill: '#5E244E', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Color-coded bars */}
          <div className="mt-4 space-y-2">
            {mockDepartmentUtilization.map(({ dept, utilization }) => (
              <div key={dept} className="flex items-center gap-2">
                <span className="text-xs text-text-secondary w-20 flex-shrink-0">{dept}</span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${utilization}%`,
                      backgroundColor: utilization >= 85 ? '#C0392B' : utilization >= 70 ? '#E68457' : '#4CAF50',
                    }}
                  />
                </div>
                <span className={`text-xs font-semibold w-8 text-right ${utilization >= 85 ? 'text-status-lost' : utilization >= 70 ? 'text-accent' : 'text-status-available'}`}>
                  {utilization}%
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Row 3: Heatmap */}
      <ChartContainer
        title="Asset Utilization Heatmap"
        subtitle="Monthly utilization % per department — darker = higher utilization"
        action={<Map size={16} className="text-text-muted" />}
      >
        <HeatMapPlaceholder />
      </ChartContainer>
    </div>
  );
}
