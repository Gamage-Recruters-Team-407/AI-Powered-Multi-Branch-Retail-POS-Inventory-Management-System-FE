import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Building2,
  DollarSign,
  X,
  Info
} from 'lucide-react';
import { fetchBranchPerformance, fetchInventoryReport, fetchSalesReport } from '../../services/reportService';
import { fetchAllBranches } from '../../services/analyticsService';

const formatLKR = (val) => {
  if (val === undefined || val === null) return 'LKR 0.00';
  return `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val) => {
  if (val === undefined || val === null) return '0';
  return val.toLocaleString();
};

function ReportSummaryCards({ data, loading }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!selectedCard) {
      setDetailsData(null);
      return;
    }

    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        if (selectedCard.id === 'active-branches') {
          const { data } = await fetchAllBranches();
          if (data && Array.isArray(data)) {
            setDetailsData(data.filter(b => b.isActive));
          }
        } else if (selectedCard.id === 'low-stock') {
          const { data } = await fetchInventoryReport();
          if (data && data.lowStockItems) {
            setDetailsData(data.lowStockItems);
          }
        } else if (selectedCard.id === 'total-sales' || selectedCard.id === 'total-orders') {
          const { data } = await fetchSalesReport();
          if (data && Array.isArray(data)) {
            setDetailsData(data.slice(0, 15));
          }
        } else if (selectedCard.id === 'net-revenue') {
          const { data } = await fetchBranchPerformance();
          if (data && Array.isArray(data)) {
            setDetailsData(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch detailed data:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [selectedCard]);

  if (loading && !data) {
    return (
      <section aria-label="Loading Summary Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[142px] flex flex-col justify-between"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="space-y-2 mt-4">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-5 w-28 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Fallback to defaults if data is partially missing
  const stats = data || {
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    activeBranches: 0,
    netRevenue: 0,
  };

  const cards = [
    {
      id: 'total-sales',
      title: 'Total Sales',
      value: formatLKR(stats.totalSales),
      sub: '+12.4% vs last month',
      trend: 'up',
      icon: DollarSign,
      accent: 'from-blue-600 to-blue-500',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      sub: '+8.1% vs last month',
      trend: 'up',
      icon: ShoppingCart,
      accent: 'from-emerald-600 to-emerald-500',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Items',
      value: formatNumber(stats.lowStockItems),
      sub: stats.lowStockItems > 0 ? 'Needs immediate attention' : 'Inventory healthy',
      trend: stats.lowStockItems > 0 ? 'down' : 'neutral',
      icon: AlertTriangle,
      accent: 'from-amber-500 to-amber-400',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badgeColor: stats.lowStockItems > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'active-branches',
      title: 'Active Branches',
      value: String(stats.activeBranches).padStart(2, '0'),
      sub: 'All branches reporting',
      trend: 'neutral',
      icon: Building2,
      accent: 'from-violet-600 to-violet-500',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      badgeColor: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'net-revenue',
      title: 'Net Revenue',
      value: formatLKR(stats.netRevenue),
      sub: 'After taxes & deductions',
      trend: 'neutral',
      icon: TrendingUp,
      accent: 'from-sky-600 to-sky-500',
      bg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      badgeColor: 'bg-sky-100 text-sky-700',
    },
  ];

  const getDetailedDescription = (id) => {
    switch (id) {
      case 'total-sales':
        return 'Total gross sales collected from all branches over the selected period. This figure includes all applicable taxes but does not account for product costs or operating expenses. The 12.4% increase indicates strong performance compared to the previous period.';
      case 'total-orders':
        const aov = stats.totalOrders ? (stats.totalSales / stats.totalOrders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
        return `The total number of completed transactions across the system. The Average Order Value (AOV) currently stands at LKR ${aov}. Monitor this metric to gauge foot traffic and checkout frequency.`;
      case 'low-stock':
        return 'These items have fallen below their designated minimum threshold level. It is highly recommended to generate purchase orders for these items to avoid stockouts which may lead to lost sales.';
      case 'active-branches':
        return 'Number of branch locations that are currently online, processing transactions, and actively syncing data with the central headquarters database. Ensure all intended branches are operational.';
      case 'net-revenue':
        return 'Estimated final profit after deducting product costs, discounts, and standard operating deductions. This serves as the primary indicator for the business\'s bottom line health.';
      default:
        return 'Detailed metrics and historical context for this Key Performance Indicator.';
    }
  };

  return (
    <section aria-label="Report Summary KPI Cards">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
            >
              {/* Top accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${card.accent}`}
              />

              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
              >
                <Icon size={20} className={card.iconColor} strokeWidth={2} />
              </div>

              {/* Value */}
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
                {card.value}
              </p>

              {/* Sub / trend */}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${card.badgeColor}`}
                >
                  {card.trend === 'up' && '↑'}
                  {card.trend === 'down' && '↓'}
                  {card.sub}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Detailed Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedCard(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Header with accent color */}
            <div className={`relative flex items-center justify-between px-6 py-5 border-b border-slate-100`}>
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${selectedCard.accent}`} />
              
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedCard.bg}`}>
                  <selectedCard.icon size={20} className={selectedCard.iconColor} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{selectedCard.title}</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Detailed Insight</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedCard(null)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition p-1.5 rounded-full"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl mb-6 border border-slate-100/60 shadow-inner">
                <p className="text-sm text-slate-500 font-medium mb-1">Current Value</p>
                <p className={`text-4xl font-bold tracking-tight bg-gradient-to-br ${selectedCard.accent} text-transparent bg-clip-text`}>
                  {selectedCard.value}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${selectedCard.badgeColor}`}>
                    {selectedCard.trend === 'up' && '↑'}
                    {selectedCard.trend === 'down' && '↓'}
                    {selectedCard.sub}
                  </span>
                </div>
              </div>
              
              <div className="bg-white">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Info size={16} className="text-blue-500" />
                  What does this mean?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3 py-1 mb-2">
                  {getDetailedDescription(selectedCard.id)}
                </p>

                {/* Real-time Detailed List */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Real-Time Data List</h4>
                  {loadingDetails ? (
                    <div className="flex justify-center p-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCard.id === 'active-branches' && detailsData?.map((branch, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{branch.name || 'Unknown Branch'}</p>
                            <p className="text-xs text-slate-400">{branch.city || branch.location || 'No Location Data'}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs font-semibold">Active</span>
                        </div>
                      ))}
                      
                      {selectedCard.id === 'low-stock' && detailsData?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-700 truncate w-40" title={item.product?.name}>{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-slate-400">SKU: {item.product?.sku || 'N/A'}</p>
                          </div>
                          <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-semibold">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}

                      {(selectedCard.id === 'total-sales' || selectedCard.id === 'total-orders') && detailsData?.map((sale, i) => {
                        const branchName = typeof sale.branch === 'object' ? sale.branch?.name : sale.branch;
                        const amount = sale.amount ?? sale.totalAmount ?? sale.finalAmount ?? 0;
                        const saleId = sale.id || sale.invoiceNumber || sale._id;
                        
                        return (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{saleId || 'Unknown Sale'}</p>
                              <p className="text-xs text-slate-400">{branchName || 'Unknown'} • {sale.status || 'Completed'}</p>
                            </div>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                              {formatLKR(amount)}
                            </span>
                          </div>
                        );
                      })}

                      {selectedCard.id === 'net-revenue' && detailsData?.map((branch, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{branch.branch || branch.name || 'Unknown Branch'}</p>
                            <p className="text-xs text-slate-400">Orders: {branch.orders || 0}</p>
                          </div>
                          <span className="px-2 py-1 bg-sky-50 text-sky-700 rounded-md text-xs font-semibold">
                            {formatLKR(branch.revenue)}
                          </span>
                        </div>
                      ))}

                      {(!detailsData || detailsData.length === 0) && (
                        <p className="text-xs text-slate-500 italic">No real-time data found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button 
                onClick={() => setSelectedCard(null)}
                className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition shadow-sm active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReportSummaryCards;
