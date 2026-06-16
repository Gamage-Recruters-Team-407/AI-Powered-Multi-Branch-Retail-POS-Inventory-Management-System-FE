import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Layers } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];

function CategoryAnalysisChart({ data, loading }) {
  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[380px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <Layers size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No category analysis data available</p>
      </div>
    );
  }

  const categories = data.categories || [];
  const summary = data.summary || {};

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <Layers size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No category data available</p>
      </div>
    );
  }

  const chartData = categories.map((c, i) => ({
    name: c._id || 'Unknown',
    value: c.revenue || 0,
    share: c.share || 0,
    quantity: c.quantitySold || 0,
    uniqueProducts: c.uniqueProducts || 0,
    fill: COLORS[i % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-800">{d.name}</p>
          <p className="text-xs font-semibold text-blue-600">{formatLKR(d.value)}</p>
          <p className="text-xs text-slate-500">Share: {d.share}%</p>
          <p className="text-xs text-slate-500">Units: {formatNumber(d.quantity)}</p>
          <p className="text-xs text-slate-500">Products: {d.uniqueProducts}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Category Analysis</h2>
            <p className="text-xs text-slate-500">{summary.totalCategories || 0} categories</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {chartData.map((c, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
              <span className="text-xs font-medium text-slate-700">{c.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{c.share}%</span>
              <span className="text-xs font-semibold text-slate-800">{formatLKR(c.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryAnalysisChart;
