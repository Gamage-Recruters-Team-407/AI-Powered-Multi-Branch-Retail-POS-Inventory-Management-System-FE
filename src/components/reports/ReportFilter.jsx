import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const REPORT_TYPES = [
  'All Types',
  'Sales Report',
  'Inventory Report',
  'Customer Report',
  'Supplier Report',
  'Branch Performance Report',
  'Business Summary',
];

const STATUSES = ['All Statuses', 'Completed', 'Review', 'Scheduled', 'Pending'];

function ReportFilter({ onFilterChange, filters = {}, branches = [] }) {
  const [type, setType] = useState('All Types');
  const [branch, setBranch] = useState('All Branches');
  const [status, setStatus] = useState('All Statuses');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setType(filters.type || 'All Types');
    setBranch(filters.branch || 'All Branches');
    setStatus(filters.status || 'All Statuses');
    setFromDate(filters.fromDate || '');
    setToDate(filters.toDate || '');
    setSearch(filters.search || '');
  }, [filters]);

  const handleReset = () => {
    setType('All Types');
    setBranch('All Branches');
    setStatus('All Statuses');
    setFromDate('');
    setToDate('');
    setSearch('');
    onFilterChange?.({ type: 'All Types', branch: 'All Branches', status: 'All Statuses', fromDate: '', toDate: '', search: '' });
  };

  const hasActiveFilters =
    type !== 'All Types' ||
    branch !== 'All Branches' ||
    status !== 'All Statuses' ||
    fromDate ||
    toDate ||
    search;

  const handleApply = () => {
    onFilterChange?.({ type, branch, status, fromDate, toDate, search });
  };

  const selectClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer';

  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Report Filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Report Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={12} /> Reset
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5">
          {/* Search */}
          <div className="mb-4">
            <label className={labelClass}>Search</label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by report ID, branch, type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Grid filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {/* Report Type */}
            <div>
              <label className={labelClass}>Report Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectClass}
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className={labelClass}>Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={selectClass}
              >
                <option value="All Branches">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id || b.id || b.name} value={b._id || b.id || b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClass}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className={labelClass}>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={selectClass}
              />
            </div>

            {/* To Date */}
            <div>
              <label className={labelClass}>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={selectClass}
              />
            </div>
          </div>

          {/* Apply button row */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApply}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
export default ReportFilter;