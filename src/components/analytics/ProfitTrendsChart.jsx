import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { formatLKR, fetchProfitTrends } from '../../services/analyticsService';

const GRANULARITIES = [
  { key: 'day',   label: 'Day'   },
  { key: 'week',  label: 'Week'  },
  { key: 'month', label: 'Month' },
];

function ProfitTrendsChart({ params }) {
  const [granularity, setGranularity] = useState('day');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);

  /* Re-fetch whenever granularity or parent filters change */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProfitTrends({ ...(params || {}), granularity });
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
              {p.name}: {formatLKR(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const profitData = data?.profitData || [];
  const summary    = data?.summary    || {};
  const chartData  = profitData.map((p) => ({
    period:    p._id,
    revenue:   p.revenue   || 0,
    cost:      p.cost      || 0,
    netProfit: p.netProfit || 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={18} className="text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Profit Trends</h2>
            <p className="text-xs text-slate-500">Revenue vs Cost vs Profit analysis</p>
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
                    ? 'bg-emerald-600 text-white shadow-sm'
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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-blue-50 p-2 text-center">
          <p className="text-xs text-blue-600 font-semibold">Revenue</p>
          <p className="text-sm font-bold text-blue-800">{formatLKR(summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 text-center">
          <p className="text-xs text-rose-600 font-semibold">Cost</p>
          <p className="text-sm font-bold text-rose-800">{formatLKR(summary.totalCost)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2 text-center">
          <p className="text-xs text-emerald-600 font-semibold">Net Profit</p>
          <p className="text-sm font-bold text-emerald-800">{formatLKR(summary.totalProfit)}</p>
        </div>
      </div>

      {/* Margin badge */}
      <div className="mb-4 flex justify-end">
        <span className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          Overall Margin: <span className="text-emerald-600">{summary.overallMargin || 0}%</span>
        </span>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[220px] gap-3">
          <Loader2 size={26} className="animate-spin text-emerald-400" />
          <p className="text-sm text-slate-400">Loading {granularity} data…</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
          <TrendingDown size={36} className="text-slate-200 mb-2" />
          <p className="text-sm font-semibold">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `LKR${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="revenue"   name="revenue"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost"      name="cost"      fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="netProfit" name="netProfit" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ProfitTrendsChart;
