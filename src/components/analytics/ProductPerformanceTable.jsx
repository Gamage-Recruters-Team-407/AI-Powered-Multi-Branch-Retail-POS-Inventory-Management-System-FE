import { useState } from 'react';
import { Package, ArrowUpDown, Search } from 'lucide-react';
import { formatLKR, formatNumber, formatPercent } from '../../services/analyticsService';

const SORT_OPTIONS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'margin', label: 'Margin' },
];

function ProductPerformanceTable({ data, loading }) {
  const [sortBy, setSortBy] = useState('revenue');
  const [search, setSearch] = useState('');

  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[320px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[320px]">
        <Package size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No product performance data available</p>
      </div>
    );
  }

  const products = data.products || [];
  const summary = data.summary || {};

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[320px]">
        <Package size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No product performance data available</p>
      </div>
    );
  }

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'quantity') return (b.quantitySold || 0) - (a.quantitySold || 0);
    if (sortBy === 'margin') return (b.profitMargin || 0) - (a.profitMargin || 0);
    return (b.revenue || 0) - (a.revenue || 0);
  });

  const filtered = search
    ? sorted.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()))
    : sorted;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Product Performance</h2>
            <p className="text-xs text-slate-500">{summary.totalProducts || 0} products</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-32 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  sortBy === s.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ArrowUpDown size={10} /> {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="py-2 pr-2 text-left font-semibold">Product</th>
              <th className="py-2 px-2 text-right font-semibold">Revenue</th>
              <th className="py-2 px-2 text-right font-semibold">Qty</th>
              <th className="py-2 px-2 text-right font-semibold">Avg Price</th>
              <th className="py-2 px-2 text-right font-semibold">Margin</th>
              <th className="py-2 pl-2 text-right font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p._id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-2">
                  <p className="font-semibold text-slate-800 truncate max-w-[160px]">{p.name || 'Unnamed'}</p>
                  <p className="text-slate-400">{p.category || ''}</p>
                </td>
                <td className="py-2.5 px-2 text-right font-semibold text-slate-800">{formatLKR(p.revenue)}</td>
                <td className="py-2.5 px-2 text-right text-slate-600">{formatNumber(p.quantitySold)}</td>
                <td className="py-2.5 px-2 text-right text-slate-600">{formatLKR(p.avgUnitPrice)}</td>
                <td className="py-2.5 px-2 text-right">
                  <span className={`font-semibold ${(p.profitMargin || 0) >= 30 ? 'text-emerald-600' : (p.profitMargin || 0) >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                    {formatPercent(p.profitMargin)}
                  </span>
                </td>
                <td className="py-2.5 pl-2 text-right font-semibold text-slate-800">{formatLKR(p.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No matching products</p>
        )}
      </div>
    </div>
  );
}

export default ProductPerformanceTable;
