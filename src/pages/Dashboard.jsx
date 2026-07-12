import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ArrowLeftRight, Wrench, Bell, CalendarDays,
  ClipboardList, AlertTriangle, CheckCircle, Plus, ArrowRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import KPICard from '../components/dashboard/KPICard';
import ActivityCard from '../components/dashboard/ActivityCard';
import NotificationCard from '../components/dashboard/NotificationCard';
import { MonthlyBarChart } from '../components/dashboard/ChartCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import {
  mockDashboardKPIs, mockRecentActivity, mockNotifications,
  mockAssetsByStatus, mockMonthlyActivity, mockAllocations,
} from '../utils/mockData';
import { formatDate } from '../utils/helpers';

// GET /api/reports/summary  → KPI numbers
// GET /api/reports/monthly-activity  → bar chart
// GET /api/reports/assets-by-status  → pie chart
// GET /api/notifications?read=false&pageSize=4  → notification panel
// GET /api/allocations/overdue  → overdue table

const QUICK_ACTIONS = [
  { label: 'Register Asset', icon: Plus, path: '/assets', color: '#5E244E' },
  { label: 'Allocate Asset', icon: ArrowLeftRight, path: '/allocation', color: '#AA1C41' },
  { label: 'Book Resource', icon: CalendarDays, path: '/bookings', color: '#E68457' },
  { label: 'New Maintenance', icon: Wrench, path: '/maintenance', color: '#1976D2' },
];

const PIE_COLORS = ['#4CAF50', '#5E244E', '#FFB300', '#E68457', '#8D6E63', '#9E9E9E'];

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-card px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-text-primary">{payload[0].name}</p>
      <p className="text-text-secondary">{payload[0].value} assets</p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const kpis = mockDashboardKPIs;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="af-page max-w-screen-2xl mx-auto">
      {/* ---- Page Header ---- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here's what's happening with your assets today.
        </p>
      </div>

      {/* ---- KPI Grid ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Assets" value={kpis.totalAssets} icon={Package} color="#5E244E" trend={3.2} trendLabel="this month" delay={0} onClick={() => navigate('/assets')} />
        <KPICard title="Available" value={kpis.availableAssets} icon={CheckCircle} color="#4CAF50" trend={1.1} trendLabel="vs last week" delay={0.05} onClick={() => navigate('/assets')} />
        <KPICard title="Allocated" value={kpis.allocatedAssets} icon={ArrowLeftRight} color="#AA1C41" trend={-0.8} trendLabel="vs last week" delay={0.1} onClick={() => navigate('/allocation')} />
        <KPICard title="Under Maintenance" value={kpis.underMaintenance} icon={Wrench} color="#E68457" trend={2.1} trendLabel="this week" delay={0.15} onClick={() => navigate('/maintenance')} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Pending Approvals" value={kpis.pendingApprovals} icon={AlertTriangle} color="#F4A261" delay={0.2} onClick={() => navigate('/maintenance')} />
        <KPICard title="Overdue Returns" value={kpis.overdueReturns} icon={Package} color="#C0392B" delay={0.25} onClick={() => navigate('/allocation')} />
        <KPICard title="Active Bookings" value={kpis.activebookings} icon={CalendarDays} color="#1976D2" delay={0.3} onClick={() => navigate('/bookings')} />
        <KPICard title="Upcoming Audits" value={kpis.upcomingAudits} icon={ClipboardList} color="#5E244E" delay={0.35} onClick={() => navigate('/audit')} />
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2.5 p-4 bg-surface rounded-card border border-border hover:shadow-card-hover hover:border-primary/20 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors text-center">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ---- Charts Row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Monthly Activity Bar Chart */}
        <Card className="lg:col-span-2 !p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Monthly Activity</h3>
              <p className="text-xs text-text-secondary">Allocations, returns & maintenance over 7 months</p>
            </div>
          </div>
          <MonthlyBarChart data={mockMonthlyActivity} />
        </Card>

        {/* Asset Status Pie Chart */}
        <Card className="!p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">Assets by Status</h3>
            <p className="text-xs text-text-secondary">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mockAssetsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {mockAssetsByStatus.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ---- Bottom Row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 !p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />} onClick={() => navigate('/notifications')}>
              View all
            </Button>
          </div>
          <ActivityCard activities={mockRecentActivity} />
        </Card>

        {/* Notifications Panel */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
            <span className="text-xs font-bold text-white bg-secondary px-2 py-0.5 rounded-full">
              {mockNotifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="space-y-1">
            {mockNotifications.slice(0, 4).map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
          <button onClick={() => navigate('/notifications')} className="mt-3 w-full text-xs text-primary font-medium hover:underline text-center">
            View all notifications →
          </button>
        </Card>
      </div>

      {/* ---- Upcoming Returns ---- */}
      <Card className="mt-5 !p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Upcoming Asset Returns</h3>
            <p className="text-xs text-text-secondary">Allocations due for return in the next 30 days</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/allocation')}>
            Manage Allocations
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs text-text-secondary font-semibold">Asset</th>
                <th className="text-left py-2 px-3 text-xs text-text-secondary font-semibold hidden sm:table-cell">Assigned To</th>
                <th className="text-left py-2 px-3 text-xs text-text-secondary font-semibold hidden md:table-cell">Department</th>
                <th className="text-left py-2 px-3 text-xs text-text-secondary font-semibold">Due Date</th>
                <th className="text-left py-2 px-3 text-xs text-text-secondary font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockAllocations.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-background/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="text-xs font-semibold text-text-primary">{a.assetName}</p>
                    <p className="text-xs text-text-muted">{a.assetTag}</p>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell text-xs text-text-secondary">{a.employeeName}</td>
                  <td className="py-3 px-3 hidden md:table-cell text-xs text-text-secondary">{a.department}</td>
                  <td className="py-3 px-3 text-xs text-text-secondary">{a.expectedReturn ? formatDate(a.expectedReturn) : '—'}</td>
                  <td className="py-3 px-3"><StatusBadge status={a.status === 'Active' ? 'Allocated' : 'Available'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
