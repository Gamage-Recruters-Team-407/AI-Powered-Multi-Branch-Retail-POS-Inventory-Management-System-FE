import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ExternalLink, X, Receipt, Calendar, Building2, Tag, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';
import { fetchDrillDown, fetchDrillDownTransactions } from '../../services/analyticsService';

const GROUP_OPTIONS = [
  { key: 'day',      label: 'Day',      icon: Calendar  },
  { key: 'month',    label: 'Month',    icon: Calendar  },
  { key: 'year',     label: 'Year',     icon: Calendar  },
  { key: 'branch',   label: 'Branch',   icon: Building2 },
  { key: 'category', label: 'Category', icon: Tag       },
  { key: 'product',  label: 'Product',  icon: Package   },
];

const COL_LABEL = {
  day: 'Date', month: 'Month', year: 'Year',
  branch: 'Branch', category: 'Category', product: 'Product',
};

/* ─── Modal ─────────────────────────────────────────────────────────────── */
function TransactionModal({ groupBy, groupValue, params, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const LIMIT = 10;

  const load = useCallback(async (pg) => {
    setLoading(true);
    try {
      const res = await fetchDrillDownTransactions({
        ...params,
        groupBy: groupBy === 'day' ? 'date' : groupBy,
        groupValue,
        page: pg,
        limit: LIMIT,
      });
      setTransactions(res.data?.transactions || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch {
      setTransactions([]);
    }
    setLoading(false);
  }, [groupBy, groupValue, params]);

  useEffect(() => { load(page); }, [load, page]);

  const pages = Math.ceil(total / LIMIT);

  return createPortal(
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 25px 80px rgba(15,23,42,0.35)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Transactions</h3>
              <p className="text-xs text-white/70">
                {COL_LABEL[groupBy]}: <span className="font-semibold text-white">{groupValue ?? '—'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-violet-500" />
              <p className="text-sm text-slate-400">Loading transactions…</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Receipt size={36} className="text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">No transactions found</p>
              <p className="text-xs text-slate-300">Try a different group or date range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => {
                const cashier = tx.cashier
                  ? `${tx.cashier.firstName || ''} ${tx.cashier.lastName || ''}`.trim()
                  : null;
                const customer = tx.customer
                  ? `${tx.customer.firstName || ''} ${tx.customer.lastName || ''}`.trim()
                  : null;
                const branchName = tx.branch?.name || null;
                const date = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleString('en-US', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—';

                return (
                  <div
                    key={i}
                    className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      {/* Invoice + date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">
                          #{tx.invoiceNumber || tx._id?.slice(-8)?.toUpperCase() || `TX-${i + 1}`}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {date}
                        </span>
                        {tx.paymentMethod && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 uppercase">
                            {tx.paymentMethod}
                          </span>
                        )}
                        {tx.status && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-600'
                              : tx.status === 'REFUNDED'
                              ? 'bg-red-100 text-red-500'
                              : 'bg-amber-100 text-amber-600'
                          }`}>
                            {tx.status}
                          </span>
                        )}
                      </div>
                      {/* Meta row */}
                      <div className="flex items-center gap-3 flex-wrap mt-0.5">
                        {branchName && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Building2 size={10} className="text-slate-400" />
                            {branchName}
                          </span>
                        )}
                        {cashier && (
                          <span className="text-[11px] text-slate-500">
                            Cashier: <span className="font-medium text-slate-600">{cashier}</span>
                          </span>
                        )}
                        {customer && (
                          <span className="text-[11px] text-slate-500">
                            Customer: <span className="font-medium text-slate-600">{customer}</span>
                          </span>
                        )}
                        {tx.items?.length > 0 && (
                          <span className="text-[11px] text-slate-500">
                            {tx.items.length} item{tx.items.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Amount */}
                    <div className="ml-4 shrink-0 text-right">
                      <p className="font-bold text-slate-800 text-sm">{formatLKR(tx.totalAmount)}</p>
                      {tx.discountAmount > 0 && (
                        <p className="text-[10px] text-red-400">-{formatLKR(tx.discountAmount)} disc.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — pagination + summary */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 bg-slate-50">
            <p className="text-xs text-slate-500">
              {total} transaction{total !== 1 ? 's' : ''} total
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="px-2 text-xs font-semibold text-slate-600">
                  {page} / {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
function DrillDownAnalysis({ params }) {
  const [groupBy, setGroupBy] = useState('month');
  const [drillData, setDrillData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalRow, setModalRow] = useState(null); // { _id, name } of clicked row

  /* Re-fetch whenever groupBy or parent filters change */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const p = { ...(params || {}), groupBy };
      try {
        const res = await fetchDrillDown(p);
        if (cancelled) return;
        setDrillData(res.data?.data || []);
        setPagination(res.data?.pagination || {});
      } catch {
        if (!cancelled) { setDrillData([]); setPagination({}); }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [groupBy, params]);

  const handleGroupChange = (key) => {
    setGroupBy(key);
    setModalRow(null);
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-violet-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Drill-Down Analysis</h2>
              <p className="text-xs text-slate-500">Hierarchical data exploration — click <strong>View</strong> for transaction details</p>
            </div>
          </div>

          {/* Group-by toggle */}
          <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-0.5">
            {GROUP_OPTIONS.map((g) => (
              <button
                key={g.key}
                onClick={() => handleGroupChange(g.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  groupBy === g.key
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 size={26} className="animate-spin text-violet-400" />
            <p className="text-sm text-slate-400">Loading {groupBy} data…</p>
          </div>
        ) : drillData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No data available for this grouping</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-2 pr-2 text-left font-semibold">{COL_LABEL[groupBy]}</th>
                  <th className="py-2 px-2 text-right font-semibold">Revenue</th>
                  <th className="py-2 px-2 text-right font-semibold">Transactions</th>
                  <th className="py-2 px-2 text-right font-semibold">Avg Value</th>
                  <th className="py-2 px-2 text-right font-semibold">Items</th>
                  <th className="py-2 pl-2 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {drillData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-2 font-semibold text-slate-800">
                      {row._id || row.name || 'N/A'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-800">
                      {formatLKR(row.revenue)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      {formatNumber(row.transactionCount)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      {formatLKR(row.avgOrderValue)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      {formatNumber(row.totalItems || row.itemCount || row.quantitySold || 0)}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <button
                        onClick={() => setModalRow(row)}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-100 transition"
                      >
                        <ExternalLink size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total > 0 && (
          <div className="mt-3 text-xs text-slate-400 text-center">
            Showing {drillData.length} of {pagination.total} groups
          </div>
        )}
      </div>

      {/* Transaction modal */}
      {modalRow && (
        <TransactionModal
          groupBy={groupBy}
          groupValue={modalRow._id || modalRow.name}
          params={params}
          onClose={() => setModalRow(null)}
        />
      )}
    </>
  );
}

export default DrillDownAnalysis;
