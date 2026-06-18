import { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet, BarChart2, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportPreviewTable from '../../components/reports/ReportPreviewTable';
import SalesTrendChart from '../../components/reports/SalesTrendChart';
import BranchPerformanceChart from '../../components/reports/BranchPerformanceChart';
import ScheduledReports from '../../components/reports/ScheduledReports';
import ReportHistory from '../../components/reports/ReportHistory';

import { getAllBranches } from '../../services/branchApi';
import {
  fetchReportSummary,
  fetchSalesReport,
  fetchInventoryReport,
  fetchBranchPerformance,
  fetchReportHistory,
  fetchScheduledReports,
  exportPDF,
  exportExcel,
} from '../../services/reportService';

function ReportsPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    type: 'All Types',
    branch: 'All Branches',
    status: 'All Statuses',
    fromDate: '',
    toDate: '',
    search: '',
  });

  const [lastRefreshed, setLastRefreshed] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );

  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [branchPerf, setBranchPerf] = useState([]);
  const [history, setHistory] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('fallback');
  const [error, setError] = useState(null);

  const handleNavigate = (pathId) => {
    if (pathId === 'reports') return;
    if (pathId === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${pathId}`);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await getAllBranches();
        if (res.data) setBranches(res.data);
      } catch (err) {
        console.error('Error fetching branches in ReportsPage:', err);
      }
    };
    fetchBranches();
  }, []);

  const getBranchName = (branchIdOrName) => {
    const found = branches.find(b => b._id === branchIdOrName || b.id === branchIdOrName);
    return found ? found.name : branchIdOrName;
  };

  const hasActiveFilters =
    (filters.type && filters.type !== 'All Types') ||
    (filters.branch && filters.branch !== 'All Branches') ||
    (filters.status && filters.status !== 'All Statuses') ||
    filters.fromDate ||
    filters.toDate ||
    filters.search;

  const getFiltersSummary = () => {
    const parts = [];
    if (filters.type && filters.type !== 'All Types') parts.push(filters.type);
    if (filters.branch && filters.branch !== 'All Branches') parts.push(getBranchName(filters.branch));
    if (filters.status && filters.status !== 'All Statuses') parts.push(filters.status);
    if (filters.fromDate || filters.toDate) {
      parts.push(`${filters.fromDate || 'Start'} to ${filters.toDate || 'End'}`);
    }
    if (filters.search) parts.push(`"${filters.search}"`);
    return parts.length > 0 ? parts.join(' • ') : 'None';
  };

  const handleRemoveFilter = (key) => {
    const defaults = {
      type: 'All Types',
      branch: 'All Branches',
      status: 'All Statuses',
      fromDate: '',
      toDate: '',
      search: '',
    };
    setFilters(prev => ({
      ...prev,
      [key]: defaults[key]
    }));
  };

  const handleGlobalReset = () => {
    setFilters({
      type: 'All Types',
      branch: 'All Branches',
      status: 'All Statuses',
      fromDate: '',
      toDate: '',
      search: '',
    });
  };

  const loadData = async (filterObj = filters) => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, salesRes, invRes, branchRes, histRes, schedRes] = await Promise.all([
        fetchReportSummary(),
        fetchSalesReport(filterObj),
        fetchInventoryReport(),
        fetchBranchPerformance(filterObj),
        fetchReportHistory(),
        fetchScheduledReports(),
      ]);

      if (sumRes.data) setSummary(sumRes.data);
      if (salesRes.data) setSales(salesRes.data);
      if (invRes.data) setInventory(invRes.data);
      if (branchRes.data) setBranchPerf(branchRes.data);
      if (histRes.data) setHistory(histRes.data);
      if (schedRes.data) setScheduled(schedRes.data);

      // Determine cumulative source
      const sources = [
        sumRes.source,
        salesRes.source,
        invRes.source,
        branchRes.source,
        histRes.source,
        schedRes.source,
      ];
      if (sources.includes('api')) {
        setSource('api');
      } else if (sources.includes('api-sample')) {
        setSource('api-sample');
      } else {
        setSource('fallback');
      }

      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err.message || 'Failed to load reports data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const handleExportPDF = async () => {
    try {
      const res = await exportPDF({
        reportType: filters.type,
        branch: filters.branch,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        status: filters.status,
      });
      if (!res.success) {
        alert(`PDF export failed: ${res.error || 'Server rejected the request.'}`);
      }
    } catch (err) {
      alert(`PDF export failed: ${err.message}`);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await exportExcel({
        reportType: filters.type,
        branch: filters.branch,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        status: filters.status,
      });
      if (!res.success) {
        alert(`Excel export failed: ${res.error || 'Server rejected the request.'}`);
      }
    } catch (err) {
      alert(`Excel export failed: ${err.message}`);
    }
  };

  const getSourceBadge = () => {
    if (source === 'api') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <Database size={12} />
          Live MongoDB
        </span>
      );
    }
    if (source === 'api-sample') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <Database size={12} />
          API (Sample Data)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
        <AlertCircle size={12} />
        Offline Fallback
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* ── Page Header ── */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Title block */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
                  <BarChart2 size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900">
                      Reports &amp; Analytics
                    </h1>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      Reporting Module
                    </span>
                    {getSourceBadge()}
                  </div>
                  <p className="text-xs text-slate-500">
                    AI-Powered Multi-Branch Retail POS · Last refreshed {lastRefreshed}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => loadData(filters)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95"
                >
                  <FileSpreadsheet size={14} />
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
                >
                  <FileDown size={14} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Body ── */}
        <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Active Filter Chips and Summary */}
          {hasActiveFilters && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Filters Applied: {getFiltersSummary()}
                </span>
                <button
                  onClick={handleGlobalReset}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    Search: "{filters.search}"
                    <button onClick={() => handleRemoveFilter('search')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
                {filters.type && filters.type !== 'All Types' && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    Type: {filters.type}
                    <button onClick={() => handleRemoveFilter('type')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
                {filters.branch && filters.branch !== 'All Branches' && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    Branch: {getBranchName(filters.branch)}
                    <button onClick={() => handleRemoveFilter('branch')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
                {filters.status && filters.status !== 'All Statuses' && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    Status: {filters.status}
                    <button onClick={() => handleRemoveFilter('status')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
                {filters.fromDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    From: {filters.fromDate}
                    <button onClick={() => handleRemoveFilter('fromDate')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
                {filters.toDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    To: {filters.toDate}
                    <button onClick={() => handleRemoveFilter('toDate')} className="hover:text-blue-900 font-bold ml-1">×</button>
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 flex gap-3 items-start">
              <span className="text-rose-500 font-bold">⚠️</span>
              <div>
                <p className="font-semibold">Backend Error</p>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* 1 — KPI Summary Cards */}
          <ReportSummaryCards data={summary} loading={loading} />

          {/* 2 — Filters */}
          <ReportFilter onFilterChange={setFilters} filters={filters} branches={branches} />

          {/* 3 — Charts row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesTrendChart salesData={sales} />
            <BranchPerformanceChart branchData={branchPerf} />
          </div>

          {/* 4 — Report Preview Table */}
          <ReportPreviewTable reports={sales} loading={loading} source={source} isFiltered={hasActiveFilters} />

          {/* 5 — Scheduled + History row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ScheduledReports scheduled={scheduled} />
            <ReportHistory history={history} />
          </div>

          {/* 6 — API Integration Status info */}
          {source !== 'api' && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <div className="flex gap-3">
                <span className="mt-0.5 text-blue-500">ℹ️</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    {source === 'api-sample' ? 'Connected to Backend (Empty Database fallback)' : 'Offline / Static Fallback Active'}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600">
                    {source === 'api-sample' 
                      ? 'The backend is active but the MongoDB database is empty or disconnected. The page is rendering mock data generated by the backend API.'
                      : 'The backend development server at http://localhost:5000 is unreachable. The frontend is rendering local static fallback mock data.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default ReportsPage;