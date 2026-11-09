import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Users, RotateCcw, Building2 } from 'lucide-react';
import { formatLKR, formatNumber, formatPercent } from '../../services/analyticsService';

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
      <DollarSign size={40} className="text-slate-300 mb-3" />
      <p className="text-sm font-semibold text-slate-500">There is no data</p>
      <p className="text-xs text-slate-400 mt-1">No KPI data available to display</p>
    </div>
  );
}

function AnalyticsKPICards({ data, loading }) {
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[130px]" />
        ))}
      </div>
    );
  }

  if (!data) return <EmptyState />;

  const cards = [
    { id: 'revenue', title: 'Total Revenue', value: formatLKR(data.revenue), icon: DollarSign, color: 'bg-blue-50 text-blue-600', accent: 'from-blue-600 to-blue-500' },
    { id: 'transactions', title: 'Transactions', value: formatNumber(data.transactions), icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600', accent: 'from-emerald-600 to-emerald-500' },
    { id: 'net-profit', title: 'Net Profit', value: formatLKR(data.netProfit), sub: `Margin ${formatPercent(data.profitMargin)}`, icon: TrendingUp, color: 'bg-violet-50 text-violet-600', accent: 'from-violet-600 to-violet-500' },
    { id: 'avg-order', title: 'Avg Order Value', value: formatLKR(data.avgOrderValue), icon: DollarSign, color: 'bg-sky-50 text-sky-600', accent: 'from-sky-600 to-sky-500' },
    { id: 'products', title: 'Active Products', value: formatNumber(data.activeProducts), sub: `${formatNumber(data.totalStock)} units in stock`, icon: Package, color: 'bg-orange-50 text-orange-600', accent: 'from-orange-600 to-orange-500' },
    { id: 'customers', title: 'Active Customers', value: formatNumber(data.activeCustomers), icon: Users, color: 'bg-cyan-50 text-cyan-600', accent: 'from-cyan-600 to-cyan-500' },
    { id: 'returns', title: 'Returns', value: formatNumber(data.totalReturns), sub: `${formatPercent(data.refundRate)} refund rate`, icon: RotateCcw, color: 'bg-rose-50 text-rose-600', accent: 'from-rose-600 to-rose-500' },
    { id: 'branches', title: 'Active Branches', value: String(data.activeBranches).padStart(2, '0'), sub: `${data.lowStockItems > 0 ? `${data.lowStockItems} low stock` : 'All healthy'}`, icon: Building2, color: 'bg-indigo-50 text-indigo-600', accent: 'from-indigo-600 to-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${card.accent}`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{card.value}</p>
              </div>
              <div className={`rounded-xl ${card.color} p-2.5`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnalyticsKPICards;
