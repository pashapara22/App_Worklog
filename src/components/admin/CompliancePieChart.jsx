import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#059669', '#f43f5e'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3">
      <p className="text-sm font-semibold text-text-primary">{payload[0].name}</p>
      <p className="text-2xl font-bold" style={{ color: payload[0].payload.fill }}>
        {payload[0].value}
      </p>
      <p className="text-xs text-text-muted">{payload[0].payload.percentage}% of total</p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold">
      {percentage > 0 ? `${percentage}%` : ''}
    </text>
  );
};

export default function CompliancePieChart({ submitted, pending, total }) {
  const data = [
    { name: 'Submitted On Time', value: submitted, percentage: total ? Math.round((submitted / total) * 100) : 0 },
    { name: 'Pending', value: pending, percentage: total ? Math.round((pending / total) * 100) : 0 },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No compliance data available.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={110}
          paddingAngle={4}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span className="text-sm text-text-secondary">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
