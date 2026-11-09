import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';

const SEGMENT_COLORS = { REGULAR: '#3b82f6', LOYAL: '#10b981', WALK_IN: '#f59e0b', NEW: '#8b5cf6', VIP: '#ef4444' };

function CustomerInsightsPanel({ data, loading }) {
  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[380px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <Users size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No customer insights available</p>
      </div>
    );
  }

  const segments = data.segments || [];
  const summary = data.summary || {};

  if (segments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <Users size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No customer data available</p>
      </div>
    );
  }

  const segmentChart = segments.map((s) => ({
    name: s.type || 'Unknown',
    value: s.revenue || 0,
    count: s.count || 0,
    fill: SEGMENT_COLORS[s.type] || '#94a3b8',
    avgValue: s.avgValue || 0,
    share: s.share || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-800">{d.name}</p>
          <p className="text-xs font-semibold text-blue-600">{formatLKR(d.value)}</p>
          <p className="text-xs text-slate-500">Customers: {formatNumber(d.count)}</p>
          <p className="text-xs text-slate-500">Share: {d.share}%</p>
          <p className="text-xs text-slate-500">Avg: {formatLKR(d.avgValue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Customer Insights</h2>
            <p className="text-xs text-slate-500">{formatNumber(summary.totalCustomers)} customers</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Avg Revenue/Customer</p>
          <p className="text-sm font-bold text-slate-800">{formatLKR(summary.avgRevenuePerCustomer)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={segmentChart} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                {segmentChart.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {segmentChart.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                <span className="text-xs font-semibold text-slate-700">{s.name}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800">{formatLKR(s.value)}</p>
                <p className="text-xs text-slate-400">{s.count} customers</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
        <div className="text-center">
          <p className="text-xs text-slate-500">Total Customers</p>
          <p className="text-lg font-bold text-slate-800">{formatNumber(summary.totalCustomers)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Total Revenue</p>
          <p className="text-lg font-bold text-slate-800">{formatLKR(summary.totalRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Avg Orders/Customer</p>
          <p className="text-lg font-bold text-slate-800">{summary.avgOrdersPerCustomer || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerInsightsPanel;
