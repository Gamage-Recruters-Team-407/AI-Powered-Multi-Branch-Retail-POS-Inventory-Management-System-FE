import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { formatLKR, fetchSalesTrends } from '../../services/analyticsService';

const GRANULARITIES = [
  { key: 'day',   label: 'Day'   },
  { key: 'week',  label: 'Week'  },
  { key: 'month', label: 'Month' },
];

function SalesTrendsChart({ params }) {
  const [granularity, setGranularity] = useState('day');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);

  /* Re-fetch whenever granularity or parent filters change */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSalesTrends({ ...(params || {}), granularity });
        if (!cancelled) setData(res.data || null);
      } catch {
        if (!cancelled) setData(null);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [granularity, params]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
              {p.name}: {p.name === 'revenue' ? formatLKR(p.value) : p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const trends   = data?.trends   || [];
  const summary  = data?.summary  || {};
  const chartData = trends.map((t) => ({
    period:       t._id,
    revenue:      t.revenue || 0,
    transactions: t.transactionCount || 0,
    avgValue:     parseFloat((t.avgOrderValue || 0).toFixed(2)),
  }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Sales Trends</h2>
            <p className="text-xs text-slate-500">Revenue &amp; transaction volume over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-0.5">
            {GRANULARITIES.map((g) => (
              <button
                key={g.key}
                onClick={() => setGranularity(g.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  granularity === g.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI pills */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-xs text-blue-600 font-semibold">Total Revenue</p>
          <p className="text-lg font-bold text-blue-800">{formatLKR(summary.totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600 font-semibold">Transactions</p>
          <p className="text-lg font-bold text-emerald-800">{(summary.totalTransactions || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-3">
          <p className="text-xs text-violet-600 font-semibold">Growth Rate</p>
          <p className={`text-lg font-bold ${(summary.growthRate || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(summary.growthRate || 0) >= 0 ? '+' : ''}{(summary.growthRate || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[220px] gap-3">
          <Loader2 size={26} className="animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Loading {granularity} data…</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
          <TrendingUp size={36} className="text-slate-200 mb-2" />
          <p className="text-sm font-semibold">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left"  tickFormatter={(v) => `LKR${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} />
            <Area yAxisId="left"  type="monotone" dataKey="revenue"      name="revenue"      stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            <Area yAxisId="right" type="monotone" dataKey="transactions" name="transactions" stroke="#10b981" strokeWidth={2}   fill="url(#txGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SalesTrendsChart;
