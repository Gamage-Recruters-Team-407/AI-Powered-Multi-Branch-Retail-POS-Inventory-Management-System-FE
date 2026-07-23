import { useState } from 'react';
import { History, FileDown, FileSpreadsheet, FileText, ChevronDown, ChevronUp, Eye, Download, X } from 'lucide-react';
import { exportPDF, exportExcel } from '../../services/reportService';

const FORMAT_ICONS = {
  PDF: <FileText size={14} className="text-red-500" />,
  Excel: <FileSpreadsheet size={14} className="text-emerald-600" />,
  View: <FileDown size={14} className="text-blue-500" />,
  Scheduled: <History size={14} className="text-violet-500" />,
};

const FORMAT_COLORS = {
  PDF: 'bg-red-50 text-red-600 ring-1 ring-red-100',
  Excel: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  View: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
  Scheduled: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
};

const DEFAULT_HISTORY = [
  {
    id: 'h-1',
    action: 'Sales Report exported as PDF',
    user: 'Amal Perera',
    date: '02 Jun 2026',
    time: '4:35 PM',
    format: 'PDF',
  },
  {
    id: 'h-2',
    action: 'Inventory Summary exported as Excel',
    user: 'Nimal Silva',
    date: '01 Jun 2026',
    time: '11:20 AM',
    format: 'Excel',
  },
  {
    id: 'h-3',
    action: 'Branch Performance Report generated',
    user: 'Amal Perera',
    date: '31 May 2026',
    time: '9:05 AM',
    format: 'View',
  },
  {
    id: 'h-4',
    action: 'Business Summary Q2 2026 scheduled',
    user: 'System',
    date: '30 May 2026',
    time: '8:00 PM',
    format: 'Scheduled',
  },
  {
    id: 'h-5',
    action: 'Customer Report exported as PDF',
    user: 'Ravi Kumar',
    date: '29 May 2026',
    time: '2:15 PM',
    format: 'PDF',
  },
  {
    id: 'h-6',
    action: 'Monthly Inventory Report generated',
    user: 'System',
    date: '28 May 2026',
    time: '12:00 AM',
    format: 'Scheduled',
  },
  {
    id: 'h-7',
    action: 'Branch Performance Report exported as Excel',
    user: 'Nimal Silva',
    date: '27 May 2026',
    time: '3:45 PM',
    format: 'Excel',
  },
  {
    id: 'h-8',
    action: 'Weekly Sales Summary exported as PDF',
    user: 'Amal Perera',
    date: '26 May 2026',
    time: '9:00 AM',
    format: 'PDF',
  },
];

const PREVIEW_COUNT = 5;

const processHistory = (historyArray) => {
  if (!historyArray || historyArray.length === 0) return DEFAULT_HISTORY;

  return historyArray.map((item, idx) => {
    // Already flat UI schema
    if (item.action && item.user && item.format) {
      return {
        id: item.id || `h-${idx}`,
        action: item.action,
        user: item.user,
        date: item.date,
        time: item.time,
        format: item.format,
        filters: item.filters || {},
        type: item.type || 'Sales',
      };
    }

    // Backend Report Schema mapping
    const created = item.generatedAt || item.createdAt || new Date();
    const dateObj = new Date(created);
    const dateStr = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let formatVal = 'View';
    if (item.fileUrl) {
      const url = item.fileUrl.toLowerCase();
      if (url.endsWith('.pdf')) formatVal = 'PDF';
      else if (url.endsWith('.xlsx') || url.endsWith('.xls') || url.endsWith('.csv'))
        formatVal = 'Excel';
    } else if (item.type === 'Scheduled') {
      formatVal = 'Scheduled';
    }

    return {
      id: item._id || `h-${idx}`,
      action: item.title || `${item.type || 'Report'} generated`,
      user: item.generatedBy
        ? `${item.generatedBy.firstName || ''} ${item.generatedBy.lastName || ''}`.trim() ||
          item.generatedBy.email ||
          'User'
        : 'System',
      date: dateStr,
      time: timeStr,
      format: formatVal,
      filters: item.filters || {},
      type: item.type || 'Sales',
    };
  });
};

function HistoryRow({ item, onView }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/60">
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        {FORMAT_ICONS[item.format] ?? FORMAT_ICONS.View}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{item.action}</p>
        <p className="text-xs text-slate-500">
          by <span className="font-medium text-slate-600">{item.user}</span>
        </p>
      </div>

      {/* Format badge */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          FORMAT_COLORS[item.format] ?? FORMAT_COLORS.View
        }`}
      >
        {item.format}
      </span>

      {/* View Button */}
      <button 
        onClick={() => onView(item)}
        className="shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition"
      >
        <Eye size={14} />
        View
      </button>

      {/* Date */}
      <div className="shrink-0 text-right w-20">
        <p className="text-xs font-medium text-slate-600">{item.date}</p>
        <p className="text-xs text-slate-400">{item.time}</p>
      </div>
    </div>
  );
}

function ReportHistory({ history }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const historyList = processHistory(history);

  const visibleItems = showAll ? historyList : historyList.slice(0, PREVIEW_COUNT);
  const hasMore = historyList.length > PREVIEW_COUNT;

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Report History"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <History size={16} className="text-blue-600" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-800">Report History</h2>
          <p className="text-xs text-slate-500">Recent report activity and exports</p>
        </div>
        {/* Count badge */}
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
          {historyList.length} records
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleItems.map((item) => (
          <HistoryRow key={item.id} item={item} onView={setSelectedReport} />
        ))}
      </div>

      {hasMore && (
        <div className="border-t border-slate-100 px-5 py-3">
          <button
            id="btn-view-full-history"
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform"
          >
            {showAll ? (
              <>
                <ChevronUp size={13} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={13} />
                View Full History ({historyList.length - PREVIEW_COUNT} more)
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && historyList.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Showing all {historyList.length} records
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Report Details
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Report Title / Action</p>
                <p className="text-sm text-slate-800 font-semibold">{selectedReport.action}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Generated By</p>
                  <p className="text-sm text-slate-700">{selectedReport.user}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Format</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${FORMAT_COLORS[selectedReport.format] ?? FORMAT_COLORS.View}`}>
                    {selectedReport.format}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Date</p>
                  <p className="text-sm text-slate-700">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Time</p>
                  <p className="text-sm text-slate-700">{selectedReport.time}</p>
                </div>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2">
                <p className="text-xs text-slate-600 mb-3">You can download or view this report again using the export option below.</p>
                <button 
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  onClick={async () => {
                    try {
                      if (selectedReport.format === 'Excel') {
                        await exportExcel({ reportType: selectedReport.type || 'Sales', ...selectedReport.filters });
                      } else {
                        await exportPDF({ reportType: selectedReport.type || 'Sales', ...selectedReport.filters });
                      }
                    } catch (e) {
                      console.error('Failed to download report', e);
                    }
                  }}
                >
                  <Download size={16} />
                  Export {selectedReport.format !== 'View' && selectedReport.format !== 'Scheduled' ? selectedReport.format : 'Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReportHistory;
