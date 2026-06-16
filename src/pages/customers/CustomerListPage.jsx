import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../../context/CustomerContext";
import CustomerViewModal   from "./CustomerViewModal";
import CustomerAddModal    from "./CustomerAddModal";
import CustomerEditModal   from "./CustomerEditModal";
import CustomerDeleteModal from "./CustomerDeleteModal";
import AddLoyaltyPointsModal from "./AddLoyaltyPointsModal";

function CustomerListPage() {
  const navigate = useNavigate();

  const {
    customers,
    loading,
    fetchCustomers,
    setSelectedCustomer,
    selectedCustomer,
  } = useCustomers();

  const [keyword, setKeyword]           = useState("");
  const [message, setMessage]           = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loyaltyTarget, setLoyaltyTarget] = useState(null);
  
  // View state: 'list' | 'loyalty' | 'analytics'
  const [currentView, setCurrentView] = useState('list');
  
  // Loyalty state
  const [loyaltyKeyword, setLoyaltyKeyword] = useState("");
  const [loyaltySortBy, setLoyaltySortBy] = useState("points-desc");
  const [loyaltyCurrentPage, setLoyaltyCurrentPage] = useState(1);

  // Analytics state
  const [analyticsKeyword, setAnalyticsKeyword] = useState("");
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState("all");
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState("all");
  const [analyticsBranchFilter, setAnalyticsBranchFilter] = useState("all");
  const [analyticsSortBy, setAnalyticsSortBy] = useState("purchases-desc");
  const [analyticsCurrentPage, setAnalyticsCurrentPage] = useState(1);
  const [analyticsDetailCustomer, setAnalyticsDetailCustomer] = useState(null);
  
  const itemsPerPage = 6;

  useEffect(() => { fetchCustomers(); }, []);

  // ── Regular Customer List Filter ───────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return customers;
    return customers.filter((c) =>
      (c.firstName || "").toLowerCase().includes(k) ||
      (c.lastName  || "").toLowerCase().includes(k) ||
      (c.email     || "").toLowerCase().includes(k) ||
      (c.phone     || "").toLowerCase().includes(k)
    );
  }, [customers, keyword]);

  useEffect(() => { setCurrentPage(1); }, [keyword]);

  // ── Loyalty Customer List Filter & Sort ────────────────────────────────
  const filteredLoyaltyCustomers = useMemo(() => {
    const k = loyaltyKeyword.trim().toLowerCase();
    let list = customers;
    
    if (k) {
      list = list.filter((c) =>
        (c.firstName || "").toLowerCase().includes(k) ||
        (c.lastName  || "").toLowerCase().includes(k) ||
        (c.email     || "").toLowerCase().includes(k) ||
        (c.phone     || "").toLowerCase().includes(k)
      );
    }

    const sorted = [...list];
    switch (loyaltySortBy) {
      case "points-desc":
        sorted.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
        break;
      case "points-asc":
        sorted.sort((a, b) => (a.loyaltyPoints || 0) - (b.loyaltyPoints || 0));
        break;
      case "purchases-desc":
        sorted.sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0));
        break;
      case "purchases-asc":
        sorted.sort((a, b) => (a.totalPurchases || 0) - (b.totalPurchases || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => (a.firstName || "").localeCompare(b.firstName || ""));
        break;
      default:
        break;
    }
    return sorted;
  }, [customers, loyaltyKeyword, loyaltySortBy]);

  useEffect(() => { setLoyaltyCurrentPage(1); }, [loyaltyKeyword, loyaltySortBy]);

  // ── Analytics Filter & Sort ─────────────────────────────────────────────
  const analyticsStats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalLoyaltyUsers = customers.filter(c => (c.loyaltyPoints || 0) > 0).length;
    const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const avgPurchases = totalCustomers ? Math.round(totalPurchases / totalCustomers) : 0;
    const avgPoints = totalCustomers ? Math.round(totalPoints / totalCustomers) : 0;

    const typeDist = { BRONZE: 0, SILVER: 0, GOLD: 0, PLATINUM: 0 };
    customers.forEach(c => {
      const type = c.customerType || "BRONZE";
      if (typeDist[type] !== undefined) typeDist[type]++;
    });

    const statusDist = { ACTIVE: 0, INACTIVE: 0 };
    customers.forEach(c => {
      const s = c.status || "ACTIVE";
      if (statusDist[s] !== undefined) statusDist[s]++;
    });

    const topCustomers = [...customers]
      .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
      .slice(0, 5);

    const topLoyalty = [...customers]
      .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
      .slice(0, 5);

    // Branch distribution
    const branchDist = {};
    customers.forEach(c => {
      const name = c.preferredBranch?.name || "Unassigned";
      branchDist[name] = (branchDist[name] || 0) + 1;
    });

    return {
      totalCustomers, totalLoyaltyUsers, totalPurchases, totalPoints,
      avgPurchases, avgPoints, typeDist, statusDist,
      topCustomers, topLoyalty, branchDist
    };
  }, [customers]);

  const filteredAnalyticsCustomers = useMemo(() => {
    const k = analyticsKeyword.trim().toLowerCase();
    let list = customers;

    if (k) {
      list = list.filter(c =>
        (c.firstName || "").toLowerCase().includes(k) ||
        (c.lastName  || "").toLowerCase().includes(k) ||
        (c.email     || "").toLowerCase().includes(k) ||
        (c.phone     || "").toLowerCase().includes(k)
      );
    }

    if (analyticsTypeFilter !== "all") {
      list = list.filter(c => (c.customerType || "BRONZE") === analyticsTypeFilter);
    }
    if (analyticsStatusFilter !== "all") {
      list = list.filter(c => (c.status || "ACTIVE") === analyticsStatusFilter);
    }
    if (analyticsBranchFilter !== "all") {
      list = list.filter(c => {
        const name = c.preferredBranch?.name || "Unassigned";
        return name === analyticsBranchFilter;
      });
    }

    const sorted = [...list];
    switch (analyticsSortBy) {
      case "purchases-desc":
        sorted.sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0));
        break;
      case "purchases-asc":
        sorted.sort((a, b) => (a.totalPurchases || 0) - (b.totalPurchases || 0));
        break;
      case "points-desc":
        sorted.sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
        break;
      case "points-asc":
        sorted.sort((a, b) => (a.loyaltyPoints || 0) - (b.loyaltyPoints || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => (a.firstName || "").localeCompare(b.firstName || ""));
        break;
      default:
        break;
    }
    return sorted;
  }, [customers, analyticsKeyword, analyticsTypeFilter, analyticsStatusFilter, analyticsBranchFilter, analyticsSortBy]);

  useEffect(() => { setAnalyticsCurrentPage(1); }, [analyticsKeyword, analyticsTypeFilter, analyticsStatusFilter, analyticsBranchFilter, analyticsSortBy]);

  // ── Flash helper ──────────────────────────────────────────────────────
  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ── Pagination helpers ─────────────────────────────────────────────────
  const totalPages       = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfFirst     = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const loyaltyTotalPages       = Math.ceil(filteredLoyaltyCustomers.length / itemsPerPage);
  const loyaltyIndexOfFirst     = (loyaltyCurrentPage - 1) * itemsPerPage;
  const loyaltyCurrentCustomers = filteredLoyaltyCustomers.slice(loyaltyIndexOfFirst, loyaltyIndexOfFirst + itemsPerPage);

  const analyticsTotalPages       = Math.ceil(filteredAnalyticsCustomers.length / itemsPerPage);
  const analyticsIndexOfFirst     = (analyticsCurrentPage - 1) * itemsPerPage;
  const analyticsCurrentCustomers = filteredAnalyticsCustomers.slice(analyticsIndexOfFirst, analyticsIndexOfFirst + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const goToLoyaltyPage = (page) => {
    if (page < 1 || page > loyaltyTotalPages) return;
    setLoyaltyCurrentPage(page);
  };
  const goToAnalyticsPage = (page) => {
    if (page < 1 || page > analyticsTotalPages) return;
    setAnalyticsCurrentPage(page);
  };

  // ── Badge helpers ─────────────────────────────────────────────────────
  const typeColor = (type) => ({
    PLATINUM: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    GOLD:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    SILVER:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
    BRONZE:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  }[type] || { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" });

  const loyaltyColor = (pts) => {
    if (pts >= 2500) return { color: "#7e22ce", bg: "rgba(126,34,206,0.08)" };
    if (pts >= 1000) return { color: "#b45309", bg: "rgba(180,83,9,0.08)" };
    if (pts >= 200)  return { color: "#0369a1", bg: "rgba(3,105,161,0.08)" };
    return { color: "#047857", bg: "rgba(4,120,87,0.08)" };
  };

  const purchaseColor = (amt) => {
    if (amt >= 2500000) return { color: "#7e22ce" };
    if (amt >= 1000000) return { color: "#b45309" };
    if (amt >= 200000)  return { color: "#0369a1" };
    return { color: "#047857" };
  };

  // ── CSV Export ──────────────────────────────────────────────────────────
  const exportCSV = (data, filename) => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Type", "Status", "Loyalty Points", "Total Purchases", "Branch"];
    const rows = data.map(c => [
      c.firstName || "",
      c.lastName || "",
      c.email || "",
      c.phone || "",
      c.customerType || "BRONZE",
      c.status || "ACTIVE",
      c.loyaltyPoints || 0,
      c.totalPurchases || 0,
      c.preferredBranch?.name || "Unassigned"
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash(`Exported ${data.length} records to CSV`);
  };

  // ── Shared Pagination Component ─────────────────────────────────────
  const Pagination = ({ totalPages, currentPage, onPageChange, activeClass = "" }) => (
    <div className="cust-pagination">
      <span className="pg-info">
        Page {currentPage} of {totalPages}
      </span>
      <div className="pg-btns">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="pg-btn">← Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`el-${i}`} className="pg-ellipsis">…</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p)} className={`pg-btn ${currentPage === p ? `active ${activeClass}` : ""}`}>{p}</button>
            )
          )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pg-btn">Next →</button>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: Customer List View
  // ═════════════════════════════════════════════════════════════════════
  const renderCustomerListView = () => (
    <>
      <div className="cust-header">
        <div>
          <h1 className="cust-title">👥 Customer Management</h1>
          <p className="cust-subtitle">
            Manage customers, loyalty points, and purchase analytics across all branches.
          </p>
        </div>
        <button className="cust-add-btn" onClick={() => setShowAddModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      </div>

      <div className="cust-actions-bar">
        <button className="cust-quick-btn" onClick={() => setCurrentView('loyalty')}>
          <span className="quick-btn-icon">⭐</span>
          <span className="quick-btn-content">
            <span className="quick-btn-label">Star Points</span>
            <span className="quick-btn-desc">Manage loyalty rewards</span>
          </span>
          <span className="quick-btn-arrow">→</span>
        </button>
        <button className="cust-quick-btn" onClick={() => setCurrentView('analytics')}>
          <span className="quick-btn-icon">📊</span>
          <span className="quick-btn-content">
            <span className="quick-btn-label">Analytics</span>
            <span className="quick-btn-desc">View customer insights</span>
          </span>
          <span className="quick-btn-arrow">→</span>
        </button>
        <button className="cust-quick-btn" onClick={() => navigate("/customers/purchases")}>
          <span className="quick-btn-icon">🧾</span>
          <span className="quick-btn-content">
            <span className="quick-btn-label">Purchase History</span>
            <span className="quick-btn-desc">Browse transaction records</span>
          </span>
          <span className="quick-btn-arrow">→</span>
        </button>
      </div>

      <div className="cust-search-card">
        <div className="cust-search-field">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by first name, last name, email or phone..."
            className="cust-search-input"
          />
          {keyword && (
            <button onClick={() => setKeyword("")} className="cust-search-clear" title="Clear search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="cust-search-meta">
          {keyword
            ? `${filteredCustomers.length} result${filteredCustomers.length !== 1 ? "s" : ""} for "${keyword}"`
            : `${customers.length} customer${customers.length !== 1 ? "s" : ""} total`}
        </div>
      </div>

      {message && (
        <div className="cust-flash">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {message}
        </div>
      )}

      <div className="cust-table-card">
        <div className="cust-table-topbar">
          <span className="cust-table-title">Customer List</span>
          <span className="cust-badge-count">
            {keyword ? `${filteredCustomers.length} / ${customers.length}` : `${customers.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="cust-state-center">
            <div className="cust-spinner" />
            <p>Loading customers…</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="cust-state-center">
            <span style={{ fontSize: "2.2rem" }}>🔍</span>
            <p>{keyword ? `No customers match "${keyword}"` : "No customers found"}</p>
          </div>
        ) : (
          <>
            <div className="cust-scroll">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Loyalty Pts</th>
                    <th>Total Purchases</th>
                    <th>Preferred Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((c) => {
                    const tc = typeColor(c.customerType);
                    const lc = loyaltyColor(c.loyaltyPoints || 0);
                    const pc = purchaseColor(c.totalPurchases || 0);
                    return (
                      <tr key={c._id} className="cust-tr">
                        <td className="td-bold">{c.firstName}</td>
                        <td>{c.lastName}</td>
                        <td className="td-muted">{c.email}</td>
                        <td className="td-muted">{c.phone}</td>
                        <td>
                          <span className="cust-type-pill" style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                            {c.customerType || "BRONZE"}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className="data-chip" style={{ color: lc.color, background: lc.bg }}>
                            ⭐ {(c.loyaltyPoints || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className="data-value" style={{ color: pc.color }}>
                            Rs.&nbsp;{(c.totalPurchases || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>{c.preferredBranch?.name || "N/A"}</td>
                        <td>
                          <div className="td-actions">
                            <button onClick={() => setSelectedCustomer(c)} className="icon-btn view" title="View customer">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button onClick={() => setEditTarget(c)} className="icon-btn edit" title="Edit customer">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => setDeleteTarget(c)} className="icon-btn delete" title="Delete customer">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={goToPage} />
            )}
          </>
        )}
      </div>
    </>
  );

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: Loyalty View
  // ═════════════════════════════════════════════════════════════════════
  const renderLoyaltyView = () => {
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const avgPoints   = customers.length ? Math.round(totalPoints / customers.length) : 0;
    const topTierCount = customers.filter(c => c.customerType === "PLATINUM" || c.customerType === "GOLD").length;

    return (
      <>
        <div className="loyalty-header">
          <div className="loyalty-header-left">
            <button className="loyalty-back-btn" onClick={() => setCurrentView('list')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Customers
            </button>
            <div>
              <h1 className="loyalty-title">⭐ Loyalty Points Management</h1>
              <p className="loyalty-subtitle">
                Award loyalty points to customers based on their purchases. 1 point per Rs. 1,000 spent.
              </p>
            </div>
          </div>
        </div>

        <div className="loyalty-stats-grid">
          <div className="loyalty-stat-card stat-purple">
            <div className="stat-icon-wrap"><span className="stat-icon">⭐</span></div>
            <div className="stat-info">
              <span className="stat-value">{totalPoints.toLocaleString()}</span>
              <span className="stat-label">Total Points Awarded</span>
            </div>
          </div>
          <div className="loyalty-stat-card stat-blue">
            <div className="stat-icon-wrap"><span className="stat-icon">📊</span></div>
            <div className="stat-info">
              <span className="stat-value">{avgPoints.toLocaleString()}</span>
              <span className="stat-label">Avg Points / Customer</span>
            </div>
          </div>
          <div className="loyalty-stat-card stat-amber">
            <div className="stat-icon-wrap"><span className="stat-icon">🏆</span></div>
            <div className="stat-info">
              <span className="stat-value">{topTierCount}</span>
              <span className="stat-label">Gold / Platinum Members</span>
            </div>
          </div>
          <div className="loyalty-stat-card stat-emerald">
            <div className="stat-icon-wrap"><span className="stat-icon">👥</span></div>
            <div className="stat-info">
              <span className="stat-value">{customers.length}</span>
              <span className="stat-label">Total Customers</span>
            </div>
          </div>
        </div>

        <div className="loyalty-search-card">
          <div className="loyalty-search-field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={loyaltyKeyword}
              onChange={(e) => setLoyaltyKeyword(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="loyalty-search-input"
            />
            {loyaltyKeyword && (
              <button onClick={() => setLoyaltyKeyword("")} className="loyalty-search-clear">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <div className="loyalty-sort-wrap">
            <label className="loyalty-sort-label">Sort by</label>
            <select value={loyaltySortBy} onChange={(e) => setLoyaltySortBy(e.target.value)} className="loyalty-sort-select">
              <option value="points-desc">Points: High → Low</option>
              <option value="points-asc">Points: Low → High</option>
              <option value="purchases-desc">Purchases: High → Low</option>
              <option value="purchases-asc">Purchases: Low → High</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
          </div>
          <div className="loyalty-search-meta">
            {loyaltyKeyword
              ? `${filteredLoyaltyCustomers.length} result${filteredLoyaltyCustomers.length !== 1 ? "s" : ""}`
              : `${customers.length} customer${customers.length !== 1 ? "s" : ""} total`}
          </div>
        </div>

        {message && (
          <div className="loyalty-flash">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {message}
          </div>
        )}

        <div className="loyalty-table-card">
          <div className="loyalty-table-topbar">
            <span className="loyalty-table-title">Customer Loyalty List</span>
            <span className="loyalty-badge-count">
              {loyaltyKeyword ? `${filteredLoyaltyCustomers.length} / ${customers.length}` : `${customers.length} total`}
            </span>
          </div>

          {loading ? (
            <div className="loyalty-state-center"><div className="loyalty-spinner" /><p>Loading customers…</p></div>
          ) : filteredLoyaltyCustomers.length === 0 ? (
            <div className="loyalty-state-center"><span style={{ fontSize: "2.2rem" }}>🔍</span><p>No customers found</p></div>
          ) : (
            <>
              <div className="loyalty-scroll">
                <table className="loyalty-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Loyalty Points</th>
                      <th>Total Purchases</th>
                      <th>Preferred Branch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyCurrentCustomers.map((c, idx) => {
                      const tc = typeColor(c.customerType);
                      const lc = loyaltyColor(c.loyaltyPoints || 0);
                      const pc = purchaseColor(c.totalPurchases || 0);
                      const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();
                      return (
                        <tr key={c._id} className="loyalty-tr">
                          <td className="td-muted">{loyaltyIndexOfFirst + idx + 1}</td>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-avatar" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)`, color: tc.color, border: `1.5px solid ${tc.border}` }}>
                                {initials}
                              </div>
                              <div className="customer-info">
                                <span className="customer-name">{c.firstName} {c.lastName}</span>
                                <span className="customer-id">ID: {c._id?.slice(-6) || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-cell">
                              <span className="contact-email">{c.email || "—"}</span>
                              <span className="contact-phone">{c.phone || "—"}</span>
                            </div>
                          </td>
                          <td>
                            <span className="loyalty-type-pill" style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                              {c.customerType || "BRONZE"}
                            </span>
                          </td>
                          <td className="td-center">
                            <span className="loyalty-chip" style={{ color: lc.color, background: lc.bg }}>
                              ⭐ {(c.loyaltyPoints || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="td-center">
                            <span className="loyalty-value" style={{ color: pc.color }}>
                              Rs.&nbsp;{(c.totalPurchases || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="td-muted">{c.preferredBranch?.name || "N/A"}</td>
                          <td>
                            <div className="td-actions">
                              <button onClick={() => setSelectedCustomer(c)} className="icon-btn view" title="View customer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              </button>
                              <button onClick={() => setLoyaltyTarget(c)} className="icon-btn add-points" title="Add loyalty points">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {loyaltyTotalPages > 1 && (
                <Pagination totalPages={loyaltyTotalPages} currentPage={loyaltyCurrentPage} onPageChange={goToLoyaltyPage} activeClass="active-loyalty" />
              )}
            </>
          )}
        </div>
      </>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: Analytics View
  // ═════════════════════════════════════════════════════════════════════
  const renderAnalyticsView = () => {
    const {
      totalCustomers, totalLoyaltyUsers, totalPurchases, totalPoints,
      avgPurchases, avgPoints, typeDist, statusDist,
      topCustomers, topLoyalty, branchDist
    } = analyticsStats;

    // Compute bar chart percentages
    const maxType = Math.max(...Object.values(typeDist), 1);
    const branchEntries = Object.entries(branchDist).sort((a, b) => b[1] - a[1]);
    const maxBranch = Math.max(...Object.values(branchDist), 1);

    const typeBarColors = {
      BRONZE:   "#c2410c",
      SILVER:   "#475569",
      GOLD:     "#b45309",
      PLATINUM: "#7e22ce",
    };

    const clearFilters = () => {
      setAnalyticsKeyword("");
      setAnalyticsTypeFilter("all");
      setAnalyticsStatusFilter("all");
      setAnalyticsBranchFilter("all");
      setAnalyticsSortBy("purchases-desc");
    };

    const hasFilters = analyticsKeyword || analyticsTypeFilter !== "all" || analyticsStatusFilter !== "all" || analyticsBranchFilter !== "all";

    return (
      <>
        {/* Header */}
        <div className="ana-header">
          <div className="ana-header-left">
            <button className="ana-back-btn" onClick={() => setCurrentView('list')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Customers
            </button>
            <div>
              <h1 className="ana-title">📊 Customer Analytics & Insights</h1>
              <p className="ana-subtitle">
                Deep insights into customer behavior, performance, and loyalty distribution.
              </p>
            </div>
          </div>
          <div className="ana-header-actions">
            <button
              className="ana-export-btn"
              onClick={() => exportCSV(filteredAnalyticsCustomers, "customer_analytics")}
              disabled={filteredAnalyticsCustomers.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button
              className="ana-export-btn export-all"
              onClick={() => exportCSV(customers, "all_customers")}
              disabled={customers.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Full Report
            </button>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="ana-kpi-grid">
          <div className="ana-kpi-card kpi-blue">
            <div className="ana-kpi-icon-wrap"><span className="ana-kpi-icon">👥</span></div>
            <div className="ana-kpi-info">
              <span className="ana-kpi-value">{totalCustomers}</span>
              <span className="ana-kpi-label">Total Customers</span>
            </div>
          </div>
          <div className="ana-kpi-card kpi-emerald">
            <div className="ana-kpi-icon-wrap"><span className="ana-kpi-icon">⭐</span></div>
            <div className="ana-kpi-info">
              <span className="ana-kpi-value">{totalLoyaltyUsers}</span>
              <span className="ana-kpi-label">Loyalty Members</span>
              <span className="ana-kpi-sub">
                {totalCustomers ? Math.round((totalLoyaltyUsers / totalCustomers) * 100) : 0}% adoption
              </span>
            </div>
          </div>
          <div className="ana-kpi-card kpi-purple">
            <div className="ana-kpi-icon-wrap"><span className="ana-kpi-icon">💰</span></div>
            <div className="ana-kpi-info">
              <span className="ana-kpi-value">Rs. {totalPurchases.toLocaleString()}</span>
              <span className="ana-kpi-label">Total Revenue</span>
              <span className="ana-kpi-sub">Avg Rs. {avgPurchases.toLocaleString()}</span>
            </div>
          </div>
          <div className="ana-kpi-card kpi-amber">
            <div className="ana-kpi-icon-wrap"><span className="ana-kpi-icon">🏆</span></div>
            <div className="ana-kpi-info">
              <span className="ana-kpi-value">{totalPoints.toLocaleString()}</span>
              <span className="ana-kpi-label">Total Points</span>
              <span className="ana-kpi-sub">Avg {avgPoints} / customer</span>
            </div>
          </div>
        </div>

        {/* Two-column: Distribution Charts */}
        <div className="ana-charts-row">
          {/* Customer Type Distribution */}
          <div className="ana-chart-card">
            <div className="ana-chart-header">
              <h3 className="ana-chart-title">Customer Type Distribution</h3>
              <span className="ana-chart-badge">{totalCustomers} total</span>
            </div>
            <div className="ana-chart-body">
              {Object.entries(typeDist).map(([type, count]) => {
                const pct = totalCustomers ? Math.round((count / totalCustomers) * 100) : 0;
                const barPct = maxType ? (count / maxType) * 100 : 0;
                return (
                  <div key={type} className="ana-bar-row">
                    <div className="ana-bar-label">
                      <span className="ana-bar-type-pill" style={{ background: typeBarColors[type] }}>
                        {type}
                      </span>
                      <span className="ana-bar-count">{count}</span>
                    </div>
                    <div className="ana-bar-track">
                      <div
                        className="ana-bar-fill"
                        style={{
                          width: `${barPct}%`,
                          background: `linear-gradient(90deg, ${typeBarColors[type]}, ${typeBarColors[type]}aa)`,
                        }}
                      />
                    </div>
                    <span className="ana-bar-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="ana-chart-card">
            <div className="ana-chart-header">
              <h3 className="ana-chart-title">Branch Distribution</h3>
              <span className="ana-chart-badge">{branchEntries.length} branches</span>
            </div>
            <div className="ana-chart-body">
              {branchEntries.length === 0 ? (
                <p className="ana-empty">No branch data</p>
              ) : (
                branchEntries.map(([name, count]) => {
                  const pct = totalCustomers ? Math.round((count / totalCustomers) * 100) : 0;
                  const barPct = maxBranch ? (count / maxBranch) * 100 : 0;
                  return (
                    <div key={name} className="ana-bar-row">
                      <div className="ana-bar-label">
                        <span className="ana-bar-name">{name}</span>
                        <span className="ana-bar-count">{count}</span>
                      </div>
                      <div className="ana-bar-track">
                        <div
                          className="ana-bar-fill"
                          style={{
                            width: `${barPct}%`,
                            background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                          }}
                        />
                      </div>
                      <span className="ana-bar-pct">{pct}%</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Top Customers Leaderboard */}
        <div className="ana-leaderboard-row">
          <div className="ana-leaderboard-card">
            <div className="ana-chart-header">
              <h3 className="ana-chart-title">💰 Top Revenue Customers</h3>
              <span className="ana-chart-badge">Top 5</span>
            </div>
            <div className="ana-leaderboard-list">
              {topCustomers.length === 0 ? (
                <p className="ana-empty">No data</p>
              ) : (
                topCustomers.map((c, i) => {
                  const tc = typeColor(c.customerType);
                  const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div
                      key={c._id}
                      className="ana-leaderboard-item"
                      onClick={() => setAnalyticsDetailCustomer(c)}
                    >
                      <span className="ana-rank">{medals[i] || `#${i+1}`}</span>
                      <div className="ana-lb-avatar" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)`, color: tc.color, border: `1.5px solid ${tc.border}` }}>
                        {initials}
                      </div>
                      <div className="ana-lb-info">
                        <span className="ana-lb-name">{c.firstName} {c.lastName}</span>
                        <span className="ana-lb-email">{c.email || "—"}</span>
                      </div>
                      <div className="ana-lb-value">
                        <span className="ana-lb-amount" style={{ color: purchaseColor(c.totalPurchases || 0).color }}>
                          Rs. {(c.totalPurchases || 0).toLocaleString()}
                        </span>
                        <span className="ana-lb-type" style={{ color: tc.color }}>{c.customerType || "BRONZE"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="ana-leaderboard-card">
            <div className="ana-chart-header">
              <h3 className="ana-chart-title">⭐ Top Loyalty Members</h3>
              <span className="ana-chart-badge">Top 5</span>
            </div>
            <div className="ana-leaderboard-list">
              {topLoyalty.length === 0 ? (
                <p className="ana-empty">No data</p>
              ) : (
                topLoyalty.map((c, i) => {
                  const tc = typeColor(c.customerType);
                  const lc = loyaltyColor(c.loyaltyPoints || 0);
                  const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div
                      key={c._id}
                      className="ana-leaderboard-item"
                      onClick={() => setAnalyticsDetailCustomer(c)}
                    >
                      <span className="ana-rank">{medals[i] || `#${i+1}`}</span>
                      <div className="ana-lb-avatar" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)`, color: tc.color, border: `1.5px solid ${tc.border}` }}>
                        {initials}
                      </div>
                      <div className="ana-lb-info">
                        <span className="ana-lb-name">{c.firstName} {c.lastName}</span>
                        <span className="ana-lb-email">{c.email || "—"}</span>
                      </div>
                      <div className="ana-lb-value">
                        <span className="ana-lb-amount" style={{ color: lc.color }}>
                          ⭐ {(c.loyaltyPoints || 0).toLocaleString()}
                        </span>
                        <span className="ana-lb-type" style={{ color: tc.color }}>{c.customerType || "BRONZE"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ana-filters-card">
          <div className="ana-filters-header">
            <h3 className="ana-filters-title">🔍 Customer Analytics Search</h3>
            {hasFilters && (
              <button className="ana-clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
          <div className="ana-filters-grid">
            <div className="ana-filter-field">
              <label>Search</label>
              <div className="ana-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={analyticsKeyword}
                  onChange={(e) => setAnalyticsKeyword(e.target.value)}
                  placeholder="Name, email, phone..."
                  className="ana-search-input"
                />
                {analyticsKeyword && (
                  <button onClick={() => setAnalyticsKeyword("")} className="ana-search-clear">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="ana-filter-field">
              <label>Customer Type</label>
              <select value={analyticsTypeFilter} onChange={(e) => setAnalyticsTypeFilter(e.target.value)} className="ana-filter-select">
                <option value="all">All Types</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </div>
            <div className="ana-filter-field">
              <label>Status</label>
              <select value={analyticsStatusFilter} onChange={(e) => setAnalyticsStatusFilter(e.target.value)} className="ana-filter-select">
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="ana-filter-field">
              <label>Branch</label>
              <select value={analyticsBranchFilter} onChange={(e) => setAnalyticsBranchFilter(e.target.value)} className="ana-filter-select">
                <option value="all">All Branches</option>
                {branchEntries.map(([name]) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="ana-filter-field">
              <label>Sort By</label>
              <select value={analyticsSortBy} onChange={(e) => setAnalyticsSortBy(e.target.value)} className="ana-filter-select">
                <option value="purchases-desc">Purchases: High → Low</option>
                <option value="purchases-asc">Purchases: Low → High</option>
                <option value="points-desc">Points: High → Low</option>
                <option value="points-asc">Points: Low → High</option>
                <option value="name-asc">Name: A → Z</option>
              </select>
            </div>
          </div>
          <div className="ana-filter-summary">
            Showing <strong>{filteredAnalyticsCustomers.length}</strong> of <strong>{totalCustomers}</strong> customers
          </div>
        </div>

        {/* Flash */}
        {message && (
          <div className="ana-flash">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {message}
          </div>
        )}

        {/* Analytics Table */}
        <div className="ana-table-card">
          <div className="ana-table-topbar">
            <span className="ana-table-title">Detailed Customer Analytics</span>
            <div className="ana-table-actions">
              <button
                className="ana-export-small"
                onClick={() => exportCSV(filteredAnalyticsCustomers, "filtered_analytics")}
                disabled={filteredAnalyticsCustomers.length === 0}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Filtered
              </button>
            </div>
          </div>

          {loading ? (
            <div className="ana-state-center"><div className="ana-spinner" /><p>Loading analytics…</p></div>
          ) : filteredAnalyticsCustomers.length === 0 ? (
            <div className="ana-state-center">
              <span style={{ fontSize: "2.2rem" }}>🔍</span>
              <p>No customers match your filters</p>
              {hasFilters && (
                <button className="ana-clear-filters-inline" onClick={clearFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="ana-scroll">
                <table className="ana-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Loyalty Points</th>
                      <th>Total Purchases</th>
                      <th>Branch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsCurrentCustomers.map((c, idx) => {
                      const tc = typeColor(c.customerType);
                      const lc = loyaltyColor(c.loyaltyPoints || 0);
                      const pc = purchaseColor(c.totalPurchases || 0);
                      const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();
                      return (
                        <tr key={c._id} className="ana-tr">
                          <td className="td-muted">{analyticsIndexOfFirst + idx + 1}</td>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-avatar" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)`, color: tc.color, border: `1.5px solid ${tc.border}` }}>
                                {initials}
                              </div>
                              <div className="customer-info">
                                <span className="customer-name">{c.firstName} {c.lastName}</span>
                                <span className="customer-id">{c.email || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="cust-type-pill" style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                              {c.customerType || "BRONZE"}
                            </span>
                          </td>
                          <td>
                            <span className={`ana-status-pill ${(c.status || "ACTIVE") === "ACTIVE" ? "active" : "inactive"}`}>
                              {c.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="td-center">
                            <span className="data-chip" style={{ color: lc.color, background: lc.bg }}>
                              ⭐ {(c.loyaltyPoints || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="td-center">
                            <span className="data-value" style={{ color: pc.color }}>
                              Rs.&nbsp;{(c.totalPurchases || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="td-muted">{c.preferredBranch?.name || "N/A"}</td>
                          <td>
                            <div className="td-actions">
                              <button
                                onClick={() => setAnalyticsDetailCustomer(c)}
                                className="icon-btn view"
                                title="View analytics"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="20" x2="18" y2="10"/>
                                  <line x1="12" y1="20" x2="12" y2="4"/>
                                  <line x1="6" y1="20" x2="6" y2="14"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => exportCSV([c], `customer_${c._id}`)}
                                className="icon-btn export"
                                title="Export customer"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {analyticsTotalPages > 1 && (
                <Pagination totalPages={analyticsTotalPages} currentPage={analyticsCurrentPage} onPageChange={goToAnalyticsPage} activeClass="active-analytics" />
              )}
            </>
          )}
        </div>

        {/* Per-user Analytics Detail Modal */}
        {analyticsDetailCustomer && (
          <div className="ana-modal-backdrop" onClick={() => setAnalyticsDetailCustomer(null)}>
            <div className="ana-modal" onClick={(e) => e.stopPropagation()}>
              <button className="ana-modal-close" onClick={() => setAnalyticsDetailCustomer(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              {(() => {
                const c = analyticsDetailCustomer;
                const tc = typeColor(c.customerType);
                const lc = loyaltyColor(c.loyaltyPoints || 0);
                const pc = purchaseColor(c.totalPurchases || 0);
                const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();
                const rank = [...customers].sort((a,b) => (b.totalPurchases||0) - (a.totalPurchases||0)).findIndex(x => x._id === c._id) + 1;
                return (
                  <>
                    <div className="ana-modal-hero" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)` }}>
                      <div className="ana-modal-avatar" style={{ color: tc.color, border: `2px solid ${tc.border}` }}>
                        {initials}
                      </div>
                      <div className="ana-modal-hero-info">
                        <h2 className="ana-modal-name">{c.firstName} {c.lastName}</h2>
                        <div className="ana-modal-meta">
                          <span className="ana-modal-email">{c.email || "—"}</span>
                          <span className="ana-modal-phone">{c.phone || "—"}</span>
                        </div>
                        <div className="ana-modal-badges">
                          <span className="cust-type-pill" style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                            {c.customerType || "BRONZE"}
                          </span>
                          <span className={`ana-status-pill ${(c.status||"ACTIVE") === "ACTIVE" ? "active" : "inactive"}`}>
                            {c.status || "ACTIVE"}
                          </span>
                          <span className="ana-rank-badge">🏆 Rank #{rank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ana-modal-stats">
                      <div className="ana-modal-stat">
                        <span className="ana-modal-stat-icon">⭐</span>
                        <span className="ana-modal-stat-value" style={{ color: lc.color }}>
                          {(c.loyaltyPoints || 0).toLocaleString()}
                        </span>
                        <span className="ana-modal-stat-label">Loyalty Points</span>
                      </div>
                      <div className="ana-modal-stat-sep" />
                      <div className="ana-modal-stat">
                        <span className="ana-modal-stat-icon">💰</span>
                        <span className="ana-modal-stat-value" style={{ color: pc.color }}>
                          Rs. {(c.totalPurchases || 0).toLocaleString()}
                        </span>
                        <span className="ana-modal-stat-label">Total Purchases</span>
                      </div>
                    </div>

                    <div className="ana-modal-grid">
                      <div className="ana-modal-cell">
                        <span className="ana-modal-cell-lbl">📍 Branch</span>
                        <span className="ana-modal-cell-val">{c.preferredBranch?.name || "Unassigned"}</span>
                      </div>
                      <div className="ana-modal-cell">
                        <span className="ana-modal-cell-lbl">🪪 Gender</span>
                        <span className="ana-modal-cell-val">{c.gender || "Not specified"}</span>
                      </div>
                      <div className="ana-modal-cell">
                        <span className="ana-modal-cell-lbl">📊 Avg. Purchase</span>
                        <span className="ana-modal-cell-val">
                          Rs. {(c.loyaltyPoints || 0) > 0 ? Math.round((c.totalPurchases || 0) / (c.loyaltyPoints || 1) * 1000).toLocaleString() : "—"}
                        </span>
                      </div>
                      <div className="ana-modal-cell">
                        <span className="ana-modal-cell-lbl">📅 Member Since</span>
                        <span className="ana-modal-cell-val">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="ana-modal-footer">
                      <button className="ana-modal-close-btn" onClick={() => setAnalyticsDetailCustomer(null)}>
                        Close
                      </button>
                      <button
                        className="ana-modal-export-btn"
                        onClick={() => exportCSV([c], `customer_${c._id}`)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export Customer
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="cust-panel">
      <div className="cust-wrapper">
        {currentView === 'list' && renderCustomerListView()}
        {currentView === 'loyalty' && renderLoyaltyView()}
        {currentView === 'analytics' && renderAnalyticsView()}
      </div>

      {selectedCustomer && <CustomerViewModal />}

      {showAddModal && (
        <CustomerAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={flash}
        />
      )}

      {editTarget && (
        <CustomerEditModal
          customer={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={flash}
        />
      )}

      {deleteTarget && (
        <CustomerDeleteModal
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={flash}
        />
      )}

      {loyaltyTarget && (
        <AddLoyaltyPointsModal
          customer={loyaltyTarget}
          onClose={() => setLoyaltyTarget(null)}
          onSuccess={flash}
        />
      )}

      {/* ── Scoped Styles ─────────────────────────────────────────────── */}
      <style>{`
        .cust-panel {
          animation: custIn 0.4s ease-out both;
          padding: 24px;
        }
        @keyframes custIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cust-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── SHARED HEADER STYLES ── */
        .cust-header, .loyalty-header, .ana-header {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 14px; padding: 22px 26px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        .cust-title, .loyalty-title, .ana-title { font-size: 1.5rem; font-weight: 850; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 4px; line-height: 1.2; }
        .cust-subtitle, .loyalty-subtitle, .ana-subtitle { font-size: 0.8rem; font-weight: 550; color: #64748b; margin: 0; }
        .cust-add-btn {
          background: linear-gradient(135deg,#1e3a5f,#1e40af);
          color: #fff; font-weight: 750; padding: 10px 22px; border-radius: 12px; border: none;
          font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.22s ease; box-shadow: 0 4px 14px rgba(30,58,95,0.25);
          white-space: nowrap; font-family: inherit;
        }
        .cust-add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(30,58,95,0.35); background: linear-gradient(135deg,#1e40af,#1d4ed8); }

        /* Quick nav */
        .cust-actions-bar { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .cust-quick-btn {
          display: flex; align-items: center; gap: 14px; padding: 16px 20px;
          background: rgba(255,255,255,0.62); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.48); border-radius: 16px;
          cursor: pointer; transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03); text-align: left;
          position: relative; overflow: hidden; font-family: inherit;
        }
        .cust-quick-btn:hover { background: rgba(255,255,255,0.90); transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); border-color: rgba(37,99,235,0.18); }
        .quick-btn-icon { font-size: 1.6rem; flex-shrink: 0; line-height: 1; }
        .quick-btn-content { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .quick-btn-label { font-size: 0.84rem; font-weight: 800; color: #0f172a; }
        .quick-btn-desc  { font-size: 0.7rem; font-weight: 550; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .quick-btn-arrow { font-size: 0.9rem; color: #cbd5e1; font-weight: 700; flex-shrink: 0; transition: all 0.2s ease; }
        .cust-quick-btn:hover .quick-btn-arrow { color: #2563eb; transform: translateX(3px); }

        /* Search */
        .cust-search-card, .loyalty-search-card {
          padding: 14px 18px; background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .cust-search-field, .loyalty-search-field {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.78); border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 11px; padding: 0 14px; transition: all 0.2s ease;
        }
        .cust-search-field:focus-within, .loyalty-search-field:focus-within { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .cust-search-input, .loyalty-search-input { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 0.84rem; font-weight: 600; color: #0f172a; outline: none; font-family: inherit; }
        .cust-search-input::placeholder, .loyalty-search-input::placeholder { color: #94a3b8; font-weight: 500; }
        .cust-search-clear, .loyalty-search-clear { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: color 0.15s; flex-shrink: 0; }
        .cust-search-clear:hover, .loyalty-search-clear:hover { color: #ef4444; }
        .cust-search-meta, .loyalty-search-meta { font-size: 0.75rem; font-weight: 700; color: #64748b; white-space: nowrap; }

        /* Flash */
        .cust-flash, .loyalty-flash, .ana-flash {
          padding: 11px 18px; border-radius: 12px; background: rgba(236,253,245,0.92);
          color: #065f46; font-size: 0.82rem; font-weight: 700; border: 1px solid #a7f3d0;
          backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px;
        }

        /* Table card */
        .cust-table-card, .loyalty-table-card, .ana-table-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04); overflow: hidden;
        }
        .cust-table-topbar, .loyalty-table-topbar, .ana-table-topbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.45);
        }
        .cust-table-title, .loyalty-table-title, .ana-table-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; }
        .cust-badge-count, .loyalty-badge-count { font-size: 0.72rem; font-weight: 750; padding: 3px 10px; border-radius: 20px; background: rgba(59,130,246,0.1); color: #2563eb; border: 1px solid rgba(59,130,246,0.18); }
        .cust-state-center, .loyalty-state-center, .ana-state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 60px 20px; color: #64748b; font-size: 0.85rem; font-weight: 600; }
        .cust-spinner, .loyalty-spinner, .ana-spinner { width: 30px; height: 30px; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cust-scroll, .loyalty-scroll, .ana-scroll { overflow-x: auto; }
        .cust-table, .loyalty-table, .ana-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .cust-table thead tr, .loyalty-table thead tr, .ana-table thead tr { background: rgba(255,255,255,0.52); }
        .cust-table th, .loyalty-table th, .ana-table th { padding: 11px 14px; text-align: left; font-size: 0.67rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.35); white-space: nowrap; }
        .cust-table td, .loyalty-table td, .ana-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.22); color: #0f172a; vertical-align: middle; }
        .cust-tr:hover td, .loyalty-tr:hover td, .ana-tr:hover td { background: rgba(255,255,255,0.38); }
        .cust-table tbody tr:last-child td, .loyalty-table tbody tr:last-child td, .ana-table tbody tr:last-child td { border-bottom: none; }
        .td-bold   { font-weight: 700; }
        .td-muted  { color: #64748b; }
        .td-center { text-align: center; }

        .cust-type-pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.63rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-width: 1px; border-style: solid; }
        .data-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 750; }
        .data-value { font-weight: 750; font-size: 0.8rem; }

        .td-actions { display: flex; gap: 5px; align-items: center; }
        .icon-btn {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid transparent;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; text-decoration: none; transition: all 0.18s ease; flex-shrink: 0;
          background: none;
        }
        .icon-btn.view   { background: rgba(59,130,246,0.1);  color: #2563eb; border-color: rgba(59,130,246,0.18); }
        .icon-btn.view:hover   { background: #2563eb; color: #fff; border-color: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37,99,235,0.28); }
        .icon-btn.edit   { background: rgba(16,185,129,0.1);  color: #059669; border-color: rgba(16,185,129,0.18); }
        .icon-btn.edit:hover   { background: #059669; color: #fff; border-color: #059669; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(5,150,105,0.28); }
        .icon-btn.delete { background: rgba(239,68,68,0.08);  color: #dc2626; border-color: rgba(239,68,68,0.15); }
        .icon-btn.delete:hover { background: #dc2626; color: #fff; border-color: #dc2626; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(220,38,38,0.28); }
        .icon-btn.export { background: rgba(124,58,237,0.1); color: #7c3aed; border-color: rgba(124,58,237,0.18); }
        .icon-btn.export:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(124,58,237,0.28); }

        /* Pagination */
        .cust-pagination { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 13px 20px; border-top: 1px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.38); }
        .pg-info { font-size: 0.74rem; font-weight: 700; color: #64748b; }
        .pg-btns { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
        .pg-btn { padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.65); font-size: 0.72rem; font-weight: 750; color: #0f172a; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; font-family: inherit; }
        .pg-btn:hover:not(:disabled) { background: #fff; border-color: rgba(0,0,0,0.15); }
        .pg-btn.active { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; border: none; box-shadow: 0 3px 8px rgba(37,99,235,0.2); }
        .pg-btn.active.active-loyalty { background: linear-gradient(135deg,#7e22ce,#6d28d9); box-shadow: 0 3px 8px rgba(126,34,206,0.2); }
        .pg-btn.active.active-analytics { background: linear-gradient(135deg,#0369a1,#075985); box-shadow: 0 3px 8px rgba(3,105,161,0.2); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-ellipsis { padding: 0 4px; font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

        /* ── Loyalty Specific ── */
        .loyalty-header-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .loyalty-back-btn, .ana-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          background: rgba(59,130,246,0.08); color: #2563eb;
          border: 1px solid rgba(59,130,246,0.18);
          font-size: 0.78rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .loyalty-back-btn:hover, .ana-back-btn:hover { background: #2563eb; color: #fff; transform: translateX(-2px); }

        .loyalty-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .loyalty-stat-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: 16px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          transition: all 0.22s ease;
        }
        .loyalty-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .stat-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-purple .stat-icon-wrap { background: rgba(126,34,206,0.1); }
        .stat-blue .stat-icon-wrap   { background: rgba(59,130,246,0.1); }
        .stat-amber .stat-icon-wrap  { background: rgba(180,83,9,0.1); }
        .stat-emerald .stat-icon-wrap{ background: rgba(4,120,87,0.1); }
        .stat-icon { font-size: 1.3rem; }
        .stat-info { display: flex; flex-direction: column; min-width: 0; }
        .stat-value { font-size: 1.15rem; font-weight: 850; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; }
        .stat-label { font-size: 0.68rem; font-weight: 650; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        .loyalty-sort-wrap { display: flex; align-items: center; gap: 8px; }
        .loyalty-sort-label { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .loyalty-sort-select {
          padding: 8px 12px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.78);
          font-size: 0.78rem; font-weight: 650; color: #0f172a;
          cursor: pointer; font-family: inherit; transition: all 0.2s ease;
        }
        .loyalty-sort-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        .loyalty-type-pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.63rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-width: 1px; border-style: solid; }
        .loyalty-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.74rem; font-weight: 750; }
        .loyalty-value { font-weight: 750; font-size: 0.8rem; }

        .icon-btn.add-points { background: rgba(126,34,206,0.1);  color: #7e22ce; border-color: rgba(126,34,206,0.18); }
        .icon-btn.add-points:hover { background: #7e22ce; color: #fff; border-color: #7e22ce; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(126,34,206,0.28); }

        .customer-cell { display: flex; align-items: center; gap: 10px; }
        .customer-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 850; letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .customer-info { display: flex; flex-direction: column; min-width: 0; }
        .customer-name { font-size: 0.82rem; font-weight: 750; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .customer-id { font-size: 0.65rem; font-weight: 600; color: #94a3b8; font-family: monospace; }
        .contact-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .contact-email { font-size: 0.78rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .contact-phone { font-size: 0.70rem; font-weight: 600; color: #94a3b8; }

        /* ──────────────────────────────────────────────────────────────── */
        /* ── ANALYTICS VIEW STYLES ── */
        /* ──────────────────────────────────────────────────────────────── */
        .ana-header-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .ana-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .ana-export-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; border: none; font-size: 0.78rem; font-weight: 750;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
          box-shadow: 0 4px 12px rgba(16,185,129,0.25);
        }
        .ana-export-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16,185,129,0.35); }
        .ana-export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ana-export-btn.export-all { background: linear-gradient(135deg, #7c3aed, #6d28d9); box-shadow: 0 4px 12px rgba(124,58,237,0.25); }
        .ana-export-btn.export-all:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(124,58,237,0.35); }

        /* KPI Grid */
        .ana-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ana-kpi-card {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; border-radius: 16px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          transition: all 0.22s ease;
        }
        .ana-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .ana-kpi-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ana-kpi-icon { font-size: 1.4rem; }
        .kpi-blue .ana-kpi-icon-wrap   { background: rgba(59,130,246,0.1); }
        .kpi-emerald .ana-kpi-icon-wrap{ background: rgba(16,185,129,0.1); }
        .kpi-purple .ana-kpi-icon-wrap { background: rgba(126,34,206,0.1); }
        .kpi-amber .ana-kpi-icon-wrap  { background: rgba(180,83,9,0.1); }
        .ana-kpi-info { display: flex; flex-direction: column; min-width: 0; }
        .ana-kpi-value { font-size: 1.2rem; font-weight: 850; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ana-kpi-label { font-size: 0.68rem; font-weight: 650; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .ana-kpi-sub { font-size: 0.65rem; font-weight: 600; color: #64748b; margin-top: 2px; }

        /* Charts Row */
        .ana-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ana-chart-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        .ana-chart-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.4);
        }
        .ana-chart-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; margin: 0; }
        .ana-chart-badge {
          font-size: 0.68rem; font-weight: 750;
          padding: 2px 9px; border-radius: 20px;
          background: rgba(59,130,246,0.1); color: #2563eb;
          border: 1px solid rgba(59,130,246,0.18);
        }
        .ana-chart-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
        .ana-empty { color: #94a3b8; font-size: 0.8rem; text-align: center; padding: 20px; }

        /* Bar Chart */
        .ana-bar-row { display: flex; align-items: center; gap: 10px; }
        .ana-bar-label { display: flex; align-items: center; gap: 8px; min-width: 120px; flex-shrink: 0; }
        .ana-bar-type-pill {
          display: inline-block; padding: 2px 9px; border-radius: 20px;
          font-size: 0.62rem; font-weight: 800; color: #fff;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ana-bar-name { font-size: 0.78rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
        .ana-bar-count { font-size: 0.72rem; font-weight: 750; color: #64748b; }
        .ana-bar-track {
          flex: 1; height: 18px; background: rgba(226,232,240,0.6);
          border-radius: 10px; overflow: hidden; position: relative;
        }
        .ana-bar-fill {
          height: 100%; border-radius: 10px;
          transition: width 0.6s ease;
        }
        .ana-bar-pct { font-size: 0.72rem; font-weight: 800; color: #0f172a; min-width: 32px; text-align: right; }

        /* Leaderboard Row */
        .ana-leaderboard-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ana-leaderboard-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        .ana-leaderboard-list { padding: 8px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
        .ana-leaderboard-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 12px;
          background: rgba(248,250,252,0.6);
          border: 1px solid rgba(226,232,240,0.5);
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .ana-leaderboard-item:hover {
          background: rgba(59,130,246,0.05);
          border-color: rgba(59,130,246,0.25);
          transform: translateX(2px);
        }
        .ana-rank { font-size: 1.1rem; width: 28px; text-align: center; flex-shrink: 0; }
        .ana-lb-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 850;
          flex-shrink: 0;
        }
        .ana-lb-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .ana-lb-name { font-size: 0.82rem; font-weight: 750; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ana-lb-email { font-size: 0.66rem; font-weight: 600; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ana-lb-value { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
        .ana-lb-amount { font-size: 0.82rem; font-weight: 800; letter-spacing: -0.01em; }
        .ana-lb-type { font-size: 0.60rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Filters Card */
        .ana-filters-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .ana-filters-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .ana-filters-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; margin: 0; }
        .ana-clear-filters {
          padding: 6px 12px; border-radius: 8px;
          background: rgba(239,68,68,0.08); color: #dc2626;
          border: 1px solid rgba(239,68,68,0.18);
          font-size: 0.72rem; font-weight: 750; cursor: pointer;
          transition: all 0.18s ease; font-family: inherit;
        }
        .ana-clear-filters:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
        .ana-clear-filters-inline {
          margin-top: 8px; padding: 6px 14px; border-radius: 8px;
          background: rgba(239,68,68,0.08); color: #dc2626;
          border: 1px solid rgba(239,68,68,0.18);
          font-size: 0.72rem; font-weight: 750; cursor: pointer;
          transition: all 0.18s ease; font-family: inherit;
        }
        .ana-clear-filters-inline:hover { background: #dc2626; color: #fff; border-color: #dc2626; }

        .ana-filters-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 12px; }
        .ana-filter-field { display: flex; flex-direction: column; gap: 5px; }
        .ana-filter-field label {
          font-size: 0.66rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ana-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.78); border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 10px; padding: 0 12px; transition: all 0.2s ease;
        }
        .ana-search-wrap:focus-within { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .ana-search-input {
          flex: 1; border: none; background: transparent;
          padding: 9px 0; font-size: 0.82rem; font-weight: 600;
          color: #0f172a; outline: none; font-family: inherit;
        }
        .ana-search-input::placeholder { color: #94a3b8; font-weight: 500; }
        .ana-search-clear { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center; flex-shrink: 0; }
        .ana-search-clear:hover { color: #ef4444; }
        .ana-filter-select {
          padding: 9px 12px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.78);
          font-size: 0.78rem; font-weight: 650; color: #0f172a;
          cursor: pointer; font-family: inherit; transition: all 0.2s ease;
        }
        .ana-filter-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        .ana-filter-summary {
          padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.3);
          font-size: 0.72rem; font-weight: 700; color: #64748b;
        }
        .ana-filter-summary strong { color: #0f172a; }

        /* Analytics Table specific */
        .ana-table-topbar { display: flex; justify-content: space-between; align-items: center; }
        .ana-table-actions { display: flex; gap: 8px; }
        .ana-export-small {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px;
          background: rgba(16,185,129,0.1); color: #059669;
          border: 1px solid rgba(16,185,129,0.2);
          font-size: 0.70rem; font-weight: 750; cursor: pointer;
          transition: all 0.18s ease; font-family: inherit;
        }
        .ana-export-small:hover:not(:disabled) { background: #059669; color: #fff; border-color: #059669; }
        .ana-export-small:disabled { opacity: 0.5; cursor: not-allowed; }

        .ana-status-pill {
          display: inline-block; padding: 2px 9px; border-radius: 20px;
          font-size: 0.62rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .ana-status-pill.active { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .ana-status-pill.inactive { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

        /* ── Analytics Detail Modal ── */
        .ana-modal-backdrop {
          position: fixed; inset: 0; z-index: 99998;
          background: rgba(10,18,35,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: anaFade 0.22s ease;
        }
        @keyframes anaFade { from { opacity: 0; } to { opacity: 1; } }
        .ana-modal {
          width: 100%; max-width: 520px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.22);
          padding: 28px 24px 24px;
          display: flex; flex-direction: column; gap: 16px;
          position: relative;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          animation: anaModalIn 0.3s cubic-bezier(0.34,1.50,0.64,1);
          pointer-events: all;
        }
        @keyframes anaModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ana-modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.9); color: #64748b;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.18s ease; z-index: 2;
        }
        .ana-modal-close:hover { background: #fee2e2; color: #dc2626; border-color: rgba(220,38,38,0.2); transform: rotate(90deg); }

        .ana-modal-hero {
          display: flex; align-items: center; gap: 16px;
          padding: 16px; border-radius: 16px;
        }
        .ana-modal-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; font-weight: 900;
          flex-shrink: 0; background: rgba(255,255,255,0.8);
        }
        .ana-modal-hero-info { flex: 1; min-width: 0; }
        .ana-modal-name { font-size: 1.15rem; font-weight: 850; color: #0f172a; margin: 0 0 4px; letter-spacing: -0.02em; }
        .ana-modal-meta { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
        .ana-modal-email { font-size: 0.78rem; font-weight: 650; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ana-modal-phone { font-size: 0.70rem; font-weight: 600; color: #94a3b8; }
        .ana-modal-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .ana-rank-badge {
          padding: 3px 9px; border-radius: 20px;
          font-size: 0.62rem; font-weight: 800;
          background: rgba(251,191,36,0.12); color: #b45309;
          border: 1px solid rgba(251,191,36,0.3);
        }

        .ana-modal-stats {
          display: flex; align-items: stretch;
          background: rgba(248,250,252,0.85);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 14px;
          overflow: hidden;
        }
        .ana-modal-stat {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 14px 12px;
        }
        .ana-modal-stat-sep { width: 1px; background: rgba(226,232,240,0.7); }
        .ana-modal-stat-icon { font-size: 1rem; }
        .ana-modal-stat-value { font-size: 1.1rem; font-weight: 850; letter-spacing: -0.02em; line-height: 1; }
        .ana-modal-stat-label { font-size: 0.64rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        .ana-modal-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .ana-modal-cell {
          padding: 10px 12px;
          background: rgba(248,250,252,0.7);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 12px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .ana-modal-cell-lbl { font-size: 0.64rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .ana-modal-cell-val { font-size: 0.82rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .ana-modal-footer {
          display: flex; gap: 10px; padding-top: 8px;
          border-top: 1px solid rgba(226,232,240,0.5);
        }
        .ana-modal-close-btn {
          flex: 1; padding: 11px 0; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s ease; font-family: inherit;
        }
        .ana-modal-close-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .ana-modal-export-btn {
          flex: 1.4;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 11px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
          box-shadow: 0 4px 12px rgba(124,58,237,0.25);
        }
        .ana-modal-export-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,0.35); }

        /* Responsive */
        @media (max-width: 1100px) {
          .ana-filters-grid { grid-template-columns: 1fr 1fr 1fr; }
          .ana-filters-grid .ana-filter-field:first-child { grid-column: span 3; }
        }
        @media (max-width: 900px) {
          .loyalty-stats-grid, .ana-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .ana-charts-row, .ana-leaderboard-row { grid-template-columns: 1fr; }
          .ana-filters-grid { grid-template-columns: 1fr 1fr; }
          .ana-filters-grid .ana-filter-field:first-child { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .cust-actions-bar { grid-template-columns: 1fr; }
          .cust-panel { padding: 14px; }
          .quick-btn-desc { display: none; }
          .ana-filters-grid { grid-template-columns: 1fr; }
          .ana-filters-grid .ana-filter-field:first-child { grid-column: span 1; }
          .ana-header { flex-direction: column; align-items: flex-start; }
          .ana-header-actions { width: 100%; }
          .ana-export-btn { flex: 1; justify-content: center; }
        }
        @media (max-width: 480px) {
          .loyalty-stats-grid, .ana-kpi-grid { grid-template-columns: 1fr; }
          .loyalty-header-left, .ana-header-left { flex-direction: column; align-items: flex-start; }
          .ana-modal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default CustomerListPage;