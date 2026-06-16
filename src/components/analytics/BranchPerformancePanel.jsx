import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

function BranchPerformancePanel({ data, loading }) {
  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[400px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[400px]">
        <Building2 size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No branch performance data available</p>
      </div>
    );
  }

  const branches = data.branches || [];
  const comparisons = data.comparisons || [];
  const totals = data.totals || {};

  const chartData = branches.map((b) => ({
    name: b.branchName || 'Unknown',
    revenue: b.revenue || 0,
    transactions: b.transactionCount || 0,
    share: b.revenueShare || 0,
    city: b.city || '',
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[300px]">
        <Building2 size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No branch data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const item = chartData.find((c) => c.name === label);
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="mb-1 text-sm font-bold text-slate-800">{label}</p>
          {item?.city && <p className="text-xs text-slate-500 mb-2">{item.city}</p>}
          {payload.map((p, i) => (
            <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
              {p.name}: {p.name === 'revenue' ? formatLKR(p.value) : formatNumber(p.value)}
            </p>
          ))}
          {item && <p className="text-xs font-semibold text-violet-600 mt-1">Share: {item.share}%</p>}
        </div>
      );
    }
    return null;
  };

  const TrendIcon = ({ val }) => {
    if (val > 0) return <TrendingUp size={14} className="text-emerald-500" />;
    if (val < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Branch Performance Comparison</h2>
            <p className="text-xs text-slate-500">Revenue across branches</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Revenue</p>
          <p className="text-lg font-bold text-slate-800">{formatLKR(totals.totalRevenue)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `LKR${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="revenue" name="revenue" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {branches.slice(0, 6).map((b, i) => (
          <div key={b._id || i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{b.rank}</span>
                <span className="text-sm font-semibold text-slate-800">{b.branchName}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">{b.city}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="text-sm font-bold text-slate-800">{formatLKR(b.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Transactions</p>
                <p className="text-sm font-bold text-slate-800">{formatNumber(b.transactionCount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Share</p>
                <p className="text-sm font-bold text-blue-600">{b.revenueShare}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comparisons.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Branch Comparisons</p>
          <div className="space-y-2">
            {comparisons.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <TrendIcon val={c.revenueDiffPercent} />
                  <span className="font-semibold text-slate-700">{c.higher}</span>
                  <span className="text-slate-400">vs</span>
                  <span className="font-semibold text-slate-700">{c.lower}</span>
                </div>
                <span className="font-bold text-emerald-600">+{c.revenueDiffPercent}% revenue</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchPerformancePanel;
