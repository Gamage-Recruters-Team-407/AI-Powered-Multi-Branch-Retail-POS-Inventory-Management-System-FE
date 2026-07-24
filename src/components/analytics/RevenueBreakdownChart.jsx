import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import { formatLKR } from '../../services/analyticsService';

const GROUP_OPTIONS = [
  { key: 'category', label: 'Category' },
  { key: 'paymentMethod', label: 'Payment' },
  { key: 'hour', label: 'Hour' },
  { key: 'dayOfWeek', label: 'Day' },
];

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#FF8042'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function RevenueBreakdownChart({ data, loading }) {
  const [groupBy, setGroupBy] = useState('category');

  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[380px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <PieIcon size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No revenue breakdown data available</p>
      </div>
    );
  }

  const rawData = data.data || [];

  if (rawData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <PieIcon size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No revenue breakdown data available</p>
      </div>
    );
  }

  let chartData = rawData.map((d, i) => ({
    name: d._id || 'Unknown',
    value: d.revenue || 0,
    count: d.count || 0,
    fill: COLORS[i % COLORS.length],
  }));

  if (groupBy === 'hour') {
    chartData = rawData.map((d) => ({
      name: HOUR_LABELS[d._id] || `Hour ${d._id}`,
      value: d.revenue || 0,
      count: d.count || 0,
      fill: '#3b82f6',
    }));
  }

  if (groupBy === 'dayOfWeek') {
    chartData = rawData.map((d) => ({
      name: DAY_NAMES[d._id - 1] || `Day ${d._id}`,
      value: d.revenue || 0,
      count: d.count || 0,
      fill: '#3b82f6',
    }));
  }

  if (groupBy === 'paymentMethod') {
    chartData = rawData.map((d) => ({
      name: d._id || 'Unknown',
      value: d.revenue || 0,
      count: d.count || 0,
      fill: COLORS[rawData.indexOf(d) % COLORS.length],
    }));
  }

  const isPie = groupBy === 'category' || groupBy === 'paymentMethod';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-800">{d.name}</p>
          <p className="text-xs font-semibold text-blue-600">{formatLKR(d.value)}</p>
          {d.count > 0 && <p className="text-xs text-slate-500">Count: {d.count.toLocaleString()}</p>}
        </div>
      );
    }
    return null;
  };

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPie ? <PieIcon size={18} className="text-blue-600" /> : <Layers size={18} className="text-blue-600" />}
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Revenue Breakdown</h2>
            <p className="text-xs text-slate-500">By {groupBy === 'paymentMethod' ? 'Payment Method' : groupBy === 'hour' ? 'Hour' : groupBy === 'dayOfWeek' ? 'Day' : 'Category'}</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroupBy(g.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                groupBy === g.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {isPie ? (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="text-lg font-bold text-slate-800">{formatLKR(total)}</p>
          </div>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={groupBy === 'hour' ? 8 : 28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `LKR${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" name="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{chartData.length} data points</span>
            <span>Total: {formatLKR(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueBreakdownChart;
