import { useState, useEffect } from 'react';
import { Download, Eye, FileText, ChevronUp, ChevronDown, Database, AlertCircle, Filter } from 'lucide-react';
import { exportPDF } from '../../services/reportService';

const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Review: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Scheduled: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  Pending: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_DOT = {
  Completed: 'bg-emerald-500',
  Review: 'bg-amber-500',
  Scheduled: 'bg-blue-500',
  Pending: 'bg-slate-400',
};

function ReportPreviewTable({ reports, loading, source, isFiltered }) {
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [reports]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-slate-300 animate-none" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-blue-600" />
    ) : (
      <ChevronDown size={12} className="text-blue-600" />
    );
  };

  const thClass =
    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors';

  if (loading && (!reports || reports.length === 0)) {
    return (
      <section
        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        aria-label="Loading Reports Table"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <FileText size={16} className="text-blue-600" />
          <div>
            <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-40 rounded bg-slate-50 animate-pulse mt-1" />
          </div>
        </div>
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-8 bg-slate-50 rounded-xl" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Unified mapping to handle both DB schemas and static fallback schemas
  const mappedReports = (reports || []).map((r) => {
    const rawAmount =
      r.amount !== undefined
        ? r.amount
        : r.finalAmount !== undefined
        ? r.finalAmount
        : r.totalAmount !== undefined
        ? r.totalAmount
        : 0;

    return {
      id: r.invoiceNumber || r.id || r._id || '',
      branch: r.branch?.name || r.branch || 'Unknown',
      type: r.type || 'POS Sale',
      period:
        r.period ||
        (r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Unknown'),
      amountVal:
        typeof rawAmount === 'number'
          ? rawAmount
          : parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, '')) || 0,
      amountStr:
        typeof rawAmount === 'number'
          ? `LKR ${rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : String(rawAmount),
      status: r.status || 'Completed',
      raw: r,
    };
  });

  // Client-side sort
  const sortedReports = [...mappedReports].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'amount') {
      valA = a.amountVal;
      valB = b.amountVal;
    }

    if (typeof valA === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
  });

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Report Preview Table"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Report Preview</h2>
            <p className="text-xs text-slate-500">
              {source === 'api'
                ? 'Live sales records fetched from database'
                : source === 'api-sample'
                ? 'Sample records generated by backend'
                : 'Offline fallback static data'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {isFiltered && (
            <span className="flex items-center gap-1 w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200">
              <Filter size={12} />
              Filtered Results
            </span>
          )}
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
            {sortedReports.length} Reports
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                { label: 'Report ID', field: 'id' },
                { label: 'Branch', field: 'branch' },
                { label: 'Type', field: 'type' },
                { label: 'Period', field: 'period' },
                { label: 'Amount', field: 'amount' },
                { label: 'Status', field: 'status' },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  className={thClass}
                  onClick={() => handleSort(field)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                  No sales reports found matching current filters.
                </td>
              </tr>
            ) : (
              (showAll ? sortedReports : sortedReports.slice(0, 10)).map((report) => (
                <tr
                  key={report.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-semibold text-blue-600">
                      {report.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {report.branch}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{report.type}</td>
                  <td className="px-4 py-3.5 text-slate-600">{report.period}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {report.amountStr}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[report.status] ?? STATUS_STYLES.Completed
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          STATUS_DOT[report.status] ?? STATUS_DOT.Completed
                        }`}
                      />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="View Report"
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 active:scale-95 cursor-pointer"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        title="Export Report"
                        onClick={async () => {
                          try {
                            const res = await exportPDF({
                              reportType: 'Single Invoice',
                              invoiceNumber: report.id,
                            });
                            if (!res.success) {
                              alert(`PDF export failed: ${res.error || 'Server error'}`);
                            }
                          } catch (err) {
                            alert(`PDF export failed: ${err.message}`);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer"
                      >
                        <Download size={13} />
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span>Showing {Math.min(sortedReports.length, showAll ? sortedReports.length : 10)} of {sortedReports.length} reports</span>
          {sortedReports.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-600 hover:bg-blue-100 transition"
            >
              {showAll ? 'Show Less' : 'View More'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {source === 'api' ? (
            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
              <Database size={10} /> Live Data
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <AlertCircle size={10} /> Sample Fallback
            </span>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Report / Invoice Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 space-y-3.5 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Report / Invoice ID</span>
                <span className="font-mono font-semibold text-blue-600">{selectedReport.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Branch</span>
                <span className="font-semibold text-slate-800">{selectedReport.branch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Report Type</span>
                <span className="text-slate-800 font-semibold">{selectedReport.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Period / Date</span>
                <span className="text-slate-800">{selectedReport.period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="font-bold text-slate-800">{selectedReport.amountStr}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Status</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[selectedReport.status] || STATUS_STYLES.Completed}`}>
                  {selectedReport.status}
                </span>
              </div>
              {selectedReport.raw.cashier && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Cashier</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedReport.raw.cashier.firstName} {selectedReport.raw.cashier.lastName}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export default ReportPreviewTable;
