import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart3, RefreshCw, AlertCircle, Filter, Clock } from "lucide-react";

import AnalyticsKPICards from "../../components/analytics/AnalyticsKPICards";
import SalesTrendsChart from "../../components/analytics/SalesTrendsChart";
import ProfitTrendsChart from "../../components/analytics/ProfitTrendsChart";
import BranchPerformancePanel from "../../components/analytics/BranchPerformancePanel";
import BranchRankingsTable from "../../components/analytics/BranchRankingsTable";
import RevenueBreakdownChart from "../../components/analytics/RevenueBreakdownChart";
import DrillDownAnalysis from "../../components/analytics/DrillDownAnalysis";
import ProductPerformanceTable from "../../components/analytics/ProductPerformanceTable";
import CategoryAnalysisChart from "../../components/analytics/CategoryAnalysisChart";
import CustomerInsightsPanel from "../../components/analytics/CustomerInsightsPanel";
import AutomatedInsights from "../../components/analytics/AutomatedInsights";

import {
  fetchKPISummary,
  fetchSalesTrends,
  fetchProfitTrends,
  fetchBranchPerformance,
  fetchBranchRankings,
  fetchRevenueBreakdown,
  fetchDrillDown,
  fetchProductPerformance,
  fetchCategoryAnalysis,
  fetchCustomerInsights,
  fetchInsights,
  fetchAllBranches,
} from "../../services/analyticsService";

function AnalyticsPage() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    branchId: "",
  });

  const [data, setData] = useState({
    kpi: null,
    sales: null,
    profit: null,
    branchPerf: null,
    branchRank: null,
    revenueBreak: null,
    drillDown: null,
    products: null,
    categories: null,
    customers: null,
    insights: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [branchList, setBranchList] = useState([]);
  // Debounce ref: filter changes wait 600ms before triggering a fetch
  const debounceTimer = useRef(null);
  const pendingFilters = useRef(filters);

  const hasActiveFilters =
    filters.fromDate || filters.toDate || filters.branchId;

  // Keep pendingFilters in sync so the debounced callback always sees latest
  pendingFilters.current = filters;

  // getData: extract payload from a settled promise result
  const getData = (res) =>
    res.status === "fulfilled" ? res.value.data : null;

  // getError: capture both network rejections AND HTTP-level errors returned
  // as fulfilled { data: null, error: "..." } from the service layer
  const getError = (res) => {
    if (res.status === "rejected") return res.reason?.message;
    // fulfilled but the service returned an error string
    if (res.value?.error) return res.value.error;
    return null;
  };

  const loadAll = useCallback(
    async (filterObj) => {
      setLoading(true);
      setErrors([]);
      const f = filterObj || pendingFilters.current;
      try {
        const params = {};
        if (f.fromDate) params.fromDate = f.fromDate;
        if (f.toDate) params.toDate = f.toDate;
        if (f.branchId) params.branchId = f.branchId;

        const [
          kpiRes,
          salesRes,
          profitRes,
          bpRes,
          brRes,
          rbRes,
          ddRes,
          prodRes,
          catRes,
          custRes,
          insRes,
        ] = await Promise.allSettled([
          fetchKPISummary(params),
          fetchSalesTrends(params),
          fetchProfitTrends(params),
          fetchBranchPerformance(params),
          fetchBranchRankings(params),
          fetchRevenueBreakdown(params),
          fetchDrillDown(params),
          fetchProductPerformance(params),
          fetchCategoryAnalysis(params),
          fetchCustomerInsights(params),
          fetchInsights(params),
        ]);

        const errs = [
          kpiRes,
          salesRes,
          profitRes,
          bpRes,
          brRes,
          rbRes,
          ddRes,
          prodRes,
          catRes,
          custRes,
          insRes,
        ]
          .map(getError)
          .filter(Boolean);

        // Show partial errors as a warning banner but DO NOT hide the data
        setErrors(errs);

        setData({
          kpi: getData(kpiRes),
          sales: getData(salesRes),
          profit: getData(profitRes),
          branchPerf: getData(bpRes),
          branchRank: getData(brRes),
          revenueBreak: getData(rbRes),
          drillDown: getData(ddRes),
          products: getData(prodRes),
          categories: getData(catRes),
          customers: getData(custRes),
          insights: getData(insRes),
        });

        setLastRefreshed(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (err) {
        setErrors([err.message || "Failed to load analytics data"]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Load ALL branches on mount for the branch filter dropdown
  // (fetchBranchPerformance only returns branches that have sales data,
  //  so we use fetchAllBranches to show every branch including ones with no revenue)
  useEffect(() => {
    fetchAllBranches().then((res) => {
      if (res.data?.length) setBranchList(res.data);
    });
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch whenever filters change (600 ms)
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadAll(pendingFilters.current);
    }, 600);
    return () => clearTimeout(debounceTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleResetFilters = () =>
    setFilters({ fromDate: "", toDate: "", branchId: "" });

  // Dismiss individual error entries
  const dismissError = (idx) =>
    setErrors((prev) => prev.filter((_, i) => i !== idx));

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products & Categories" },
    { key: "drilldown", label: "Drill-Down" },
  ];

  const glassCard = {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 4px 24px rgba(15,23,42,0.07)",
    border: "1px solid rgba(148,163,184,0.18)",
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header card – glassmorphism to match the dashboard sky background */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(148,163,184,0.25)",
          borderRadius: "0 0 20px 20px",
          boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
        }}
      >
        <div style={{ maxWidth: "1536px", margin: "0 auto", padding: "16px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
                }}
              >
                <BarChart3 size={22} color="#fff" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Business Analytics
                  </h1>
                  <span
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    Analytics Module
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                  Advanced analytics, KPIs, and drill-down analysis
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {lastRefreshed && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                  <Clock size={11} />
                  Updated {lastRefreshed}
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.9)", border: "1.5px solid #e2e8f0",
                    borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                    color: "#475569", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => loadAll()}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  border: "none", borderRadius: 12, padding: "8px 18px",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                  transition: "all 0.2s",
                }}
              >
                <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginTop: 14, borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "9px 18px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: "10px 10px 0 0",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === t.key ? "rgba(124,58,237,0.1)" : "transparent",
                  color: activeTab === t.key ? "#7c3aed" : "#64748b",
                  borderBottom: activeTab === t.key ? "2.5px solid #7c3aed" : "2.5px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1536px", margin: "0 auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Filter bar */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            background: "rgba(255,255,255,0.88)", backdropFilter: "blur(10px)",
            borderRadius: 16, padding: "14px 20px",
            boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
            border: "1px solid rgba(148,163,184,0.2)",
          }}
        >
          <Filter size={14} color="#94a3b8" />
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px",
              fontSize: 12, outline: "none", background: "white",
            }}
          />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>to</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px",
              fontSize: 12, outline: "none", background: "white",
            }}
          />
          <select
            value={filters.branchId}
            onChange={(e) => setFilters((p) => ({ ...p, branchId: e.target.value }))}
            style={{
              border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px",
              fontSize: 12, outline: "none", background: "white", cursor: "pointer",
            }}
          >
            <option value="">All Branches</option>
            {branchList.map((b) => (
              <option key={String(b._id)} value={String(b._id)}>
                {b.name || String(b._id)}
              </option>
            ))}
          </select>
        </div>

        {/* Error banners */}
        {errors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {errors.map((errMsg, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 16, border: "1px solid #fcd34d",
                  background: "rgba(254,243,199,0.95)", padding: "12px 20px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                <AlertCircle size={15} style={{ marginTop: 2, color: "#f59e0b", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: 0 }}>
                    Partial data fetch warning
                  </p>
                  <p style={{ fontSize: 12, color: "#b45309", margin: "2px 0 0" }}>{errMsg}</p>
                </div>
                <button
                  onClick={() => dismissError(idx)}
                  style={{ background: "none", border: "none", color: "#d97706", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab content – wrapped in glassmorphic cards */}
        {activeTab === "overview" && (
          <>
            <div style={glassCard}>
              <AnalyticsKPICards data={data.kpi} loading={loading} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20 }}>
              <div style={glassCard}><SalesTrendsChart params={filters} /></div>
              <div style={glassCard}><ProfitTrendsChart params={filters} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div style={{ ...glassCard, gridColumn: "span 2" }}>
                <BranchPerformancePanel data={data.branchPerf} loading={loading} />
              </div>
              <div style={glassCard}>
                <AutomatedInsights data={data.insights} loading={loading} />
              </div>
            </div>
          </>
        )}

        {activeTab === "products" && (
          <>
            <div style={glassCard}><CategoryAnalysisChart data={data.categories} loading={loading} /></div>
            <div style={glassCard}><ProductPerformanceTable data={data.products} loading={loading} /></div>
          </>
        )}

        {activeTab === "drilldown" && (
          <div style={glassCard}><DrillDownAnalysis params={filters} /></div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .analytics-three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default AnalyticsPage;
