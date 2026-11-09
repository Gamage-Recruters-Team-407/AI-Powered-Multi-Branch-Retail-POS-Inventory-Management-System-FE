import { Lightbulb, TrendingUp, TrendingDown, Star, CreditCard, RotateCcw, Package, ShoppingCart } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';

const ICONS = {
  revenue: TrendingUp,
  transactions: ShoppingCart,
  avgOrderValue: TrendingUp,
  inventory: Package,
  topProduct: Star,
  paymentPreference: CreditCard,
  returns: RotateCcw,
};

const SEVERITY_COLORS = {
  high: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: 'text-rose-500', badge: 'bg-rose-100 text-rose-700' },
  medium: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  low: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
};

function AutomatedInsights({ data, loading }) {
  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[380px]">
        <Lightbulb size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No analytical insights available</p>
      </div>
    );
  }

  const insights = Array.isArray(data) ? data : [];

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[200px]">
        <Lightbulb size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No insights generated yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb size={18} className="text-amber-500" />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Analytical Insights</h2>
          <p className="text-xs text-slate-500">Automated business intelligence</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = ICONS[insight.type] || Lightbulb;
          const severity = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.low;

          return (
            <div key={i} className={`rounded-xl border ${severity.bg} p-3.5 transition hover:shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${severity.icon}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{insight.label}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severity.badge}`}>
                      {insight.severity}
                    </span>
                    {insight.direction === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
                    {insight.direction === 'down' && <TrendingDown size={14} className="text-red-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AutomatedInsights;
