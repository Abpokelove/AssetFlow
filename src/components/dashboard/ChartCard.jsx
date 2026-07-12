import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-card px-3 py-2.5 shadow-card text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function MonthlyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={10} barGap={4}>
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
  );
}

export function UtilizationLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1E5DD" vertical={false} />
        <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" width={36} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#5E244E" strokeWidth={2.5} dot={{ fill: '#5E244E', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
