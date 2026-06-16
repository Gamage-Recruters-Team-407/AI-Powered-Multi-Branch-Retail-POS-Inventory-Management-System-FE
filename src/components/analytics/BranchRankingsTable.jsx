import { useState } from 'react';
import { Trophy, TrendingUp, DollarSign, Hash } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';

const METRICS = [
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'transactions', label: 'Transactions', icon: Hash },
  { key: 'avgOrderValue', label: 'Avg Order Value', icon: TrendingUp },
];

function BranchRankingsTable({ data, loading }) {
  const [metric, setMetric] = useState('revenue');

  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[320px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[320px]">
        <Trophy size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No branch rankings available</p>
      </div>
    );
  }

  const rankings = data.rankings || [];

  if (rankings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[320px]">
        <Trophy size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No branch rankings available</p>
      </div>
    );
  }

  const sorted = [...rankings].sort((a, b) => {
    if (metric === 'transactions') return b.transactionCount - a.transactionCount;
    if (metric === 'avgOrderValue') return b.avgOrderValue - a.avgOrderValue;
    return b.revenue - a.revenue;
  });

  const getValue = (item) => {
    if (metric === 'transactions') return formatNumber(item.transactionCount);
    if (metric === 'avgOrderValue') return formatLKR(item.avgOrderValue);
    return formatLKR(item.revenue);
  };

  const getShare = (item) => {
    if (metric === 'avgOrderValue') return '-';
    return `${item.share || 0}%`;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Branch Rankings</h2>
            <p className="text-xs text-slate-500">Ranked by {metric}</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  metric === m.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={12} /> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((item, i) => {
          const isTop3 = i < 3;
          return (
            <div
              key={item.branchId || i}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm ${
                isTop3 ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-slate-200 text-slate-700' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {item.rank || i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.branchName}</p>
                  <p className="text-xs text-slate-400">{item.city || ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{getValue(item)}</p>
                <p className="text-xs text-slate-400">{getShare(item)} share</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BranchRankingsTable;
