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
    addLoyaltyPoints,
  } = useCustomers();

  const [keyword, setKeyword]           = useState("");
  const [message, setMessage]           = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loyaltyTarget, setLoyaltyTarget] = useState(null);
  
  // View state: 'list' or 'loyalty'
  const [currentView, setCurrentView] = useState('list');
  
  // Loyalty-specific state
  const [loyaltyKeyword, setLoyaltyKeyword] = useState("");
  const [loyaltySortBy, setLoyaltySortBy] = useState("points-desc");
  const [loyaltyCurrentPage, setLoyaltyCurrentPage] = useState(1);
  
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

    // Sort
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

  useEffect(() => { 
    setLoyaltyCurrentPage(1); 
  }, [loyaltyKeyword, loyaltySortBy]);

  // ── Flash helper ──────────────────────────────────────────────────────────
  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages       = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfFirst     = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  const loyaltyTotalPages       = Math.ceil(filteredLoyaltyCustomers.length / itemsPerPage);
  const loyaltyIndexOfFirst     = (loyaltyCurrentPage - 1) * itemsPerPage;
  const loyaltyCurrentCustomers = filteredLoyaltyCustomers.slice(loyaltyIndexOfFirst, loyaltyIndexOfFirst + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const goToLoyaltyPage = (page) => {
    if (page < 1 || page > loyaltyTotalPages) return;
    setLoyaltyCurrentPage(page);
  };

  // ── Badge helpers ─────────────────────────────────────────────────────────
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
    if (amt >= 1000000)  return { color: "#b45309" };
    if (amt >= 200000)  return { color: "#0369a1" };
    return { color: "#047857" };
  };

  // Loyalty Stats
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const avgPoints   = customers.length ? Math.round(totalPoints / customers.length) : 0;
  const topTierCount = customers.filter(c =>
    c.customerType === "PLATINUM" || c.customerType === "GOLD"
  ).length;

  // ── Render Customer List View ──────────────────────────────────────────
  const renderCustomerListView = () => (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
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

      {/* ── Quick Nav Actions ───────────────────────────────────────── */}
      <div className="cust-actions-bar">
        <button className="cust-quick-btn" onClick={() => setCurrentView('loyalty')}>
          <span className="quick-btn-icon">⭐</span>
          <span className="quick-btn-content">
            <span className="quick-btn-label">Star Points</span>
            <span className="quick-btn-desc">Manage loyalty rewards</span>
          </span>
          <span className="quick-btn-arrow">→</span>
        </button>
        <button className="cust-quick-btn" onClick={() => navigate("/customers/analytics")}>
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

      {/* ── Search Bar ─────────────────────────────────────────────── */}
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

      {/* ── Flash Message ──────────────────────────────────────────── */}
      {message && (
        <div className="cust-flash">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {message}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────── */}
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
                            {/* View */}
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="icon-btn view"
                              title="View customer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => setEditTarget(c)}
                              className="icon-btn edit"
                              title="Edit customer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="icon-btn delete"
                              title="Delete customer"
                            >
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

            {/* ── Pagination ────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="cust-pagination">
                <span className="pg-info">
                  Page {currentPage} of {totalPages}
                  &nbsp;·&nbsp;
                  Showing {indexOfFirst + 1}–{Math.min(indexOfFirst + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
                <div className="pg-btns">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="pg-btn">← Prev</button>
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
                        <button key={p} onClick={() => goToPage(p)} className={`pg-btn ${currentPage === p ? "active" : ""}`}>{p}</button>
                      )
                    )}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="pg-btn">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  // ── Render Loyalty Points View ────────────────────────────────────────
  const renderLoyaltyView = () => (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="loyalty-header">
        <div className="loyalty-header-left">
          <button className="loyalty-back-btn" onClick={() => setCurrentView('list')} title="Back to Customers">
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

      {/* ── Stats Cards ────────────────────────────────────────────── */}
      <div className="loyalty-stats-grid">
        <div className="loyalty-stat-card stat-purple">
          <div className="stat-icon-wrap">
            <span className="stat-icon">⭐</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalPoints.toLocaleString()}</span>
            <span className="stat-label">Total Points Awarded</span>
          </div>
        </div>
        <div className="loyalty-stat-card stat-blue">
          <div className="stat-icon-wrap">
            <span className="stat-icon">📊</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{avgPoints.toLocaleString()}</span>
            <span className="stat-label">Avg Points / Customer</span>
          </div>
        </div>
        <div className="loyalty-stat-card stat-amber">
          <div className="stat-icon-wrap">
            <span className="stat-icon">🏆</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{topTierCount}</span>
            <span className="stat-label">Gold / Platinum Members</span>
          </div>
        </div>
        <div className="loyalty-stat-card stat-emerald">
          <div className="stat-icon-wrap">
            <span className="stat-icon">👥</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{customers.length}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>
      </div>

      {/* ── Search & Sort Bar ──────────────────────────────────────── */}
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
            <button onClick={() => setLoyaltyKeyword("")} className="loyalty-search-clear" title="Clear search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="loyalty-sort-wrap">
          <label className="loyalty-sort-label">Sort by</label>
          <select
            value={loyaltySortBy}
            onChange={(e) => setLoyaltySortBy(e.target.value)}
            className="loyalty-sort-select"
          >
            <option value="points-desc">Points: High → Low</option>
            <option value="points-asc">Points: Low → High</option>
            <option value="purchases-desc">Purchases: High → Low</option>
            <option value="purchases-asc">Purchases: Low → High</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>
        <div className="loyalty-search-meta">
          {loyaltyKeyword
            ? `${filteredLoyaltyCustomers.length} result${filteredLoyaltyCustomers.length !== 1 ? "s" : ""} for "${loyaltyKeyword}"`
            : `${customers.length} customer${customers.length !== 1 ? "s" : ""} total`}
        </div>
      </div>

      {/* ── Flash Message ──────────────────────────────────────────── */}
      {message && (
        <div className="loyalty-flash">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {message}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="loyalty-table-card">
        <div className="loyalty-table-topbar">
          <span className="loyalty-table-title">Customer Loyalty List</span>
          <span className="loyalty-badge-count">
            {loyaltyKeyword ? `${filteredLoyaltyCustomers.length} / ${customers.length}` : `${customers.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="loyalty-state-center">
            <div className="loyalty-spinner" />
            <p>Loading customers…</p>
          </div>
        ) : filteredLoyaltyCustomers.length === 0 ? (
          <div className="loyalty-state-center">
            <span style={{ fontSize: "2.2rem" }}>🔍</span>
            <p>{loyaltyKeyword ? `No customers match "${loyaltyKeyword}"` : "No customers found"}</p>
          </div>
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
                            {/* View */}
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="icon-btn view"
                              title="View customer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            {/* Add Points */}
                            <button
                              onClick={() => setLoyaltyTarget(c)}
                              className="icon-btn add-points"
                              title="Add loyalty points"
                            >
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

            {/* ── Pagination ────────────────────────────────────── */}
            {loyaltyTotalPages > 1 && (
              <div className="loyalty-pagination">
                <span className="pg-info">
                  Page {loyaltyCurrentPage} of {loyaltyTotalPages}
                  &nbsp;·&nbsp;
                  Showing {loyaltyIndexOfFirst + 1}–{Math.min(loyaltyIndexOfFirst + itemsPerPage, filteredLoyaltyCustomers.length)} of {filteredLoyaltyCustomers.length}
                </span>
                <div className="pg-btns">
                  <button onClick={() => goToLoyaltyPage(loyaltyCurrentPage - 1)} disabled={loyaltyCurrentPage === 1} className="pg-btn">← Prev</button>
                  {Array.from({ length: loyaltyTotalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === loyaltyTotalPages || Math.abs(p - loyaltyCurrentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`el-${i}`} className="pg-ellipsis">…</span>
                      ) : (
                        <button key={p} onClick={() => goToLoyaltyPage(p)} className={`pg-btn ${loyaltyCurrentPage === p ? "active" : ""}`}>{p}</button>
                      )
                    )}
                  <button onClick={() => goToLoyaltyPage(loyaltyCurrentPage + 1)} disabled={loyaltyCurrentPage === loyaltyTotalPages} className="pg-btn">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="cust-panel">
      <div className="cust-wrapper">
        {currentView === 'list' ? renderCustomerListView() : renderLoyaltyView()}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
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

        /* Header */
        .cust-header {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 14px; padding: 22px 26px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        .cust-title { font-size: 1.5rem; font-weight: 850; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 4px; line-height: 1.2; }
        .cust-subtitle { font-size: 0.8rem; font-weight: 550; color: #64748b; margin: 0; }
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
        .cust-search-card {
          padding: 14px 18px; background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .cust-search-field {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.78); border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 11px; padding: 0 14px; transition: all 0.2s ease;
        }
        .cust-search-field:focus-within { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .cust-search-input { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 0.84rem; font-weight: 600; color: #0f172a; outline: none; font-family: inherit; }
        .cust-search-input::placeholder { color: #94a3b8; font-weight: 500; }
        .cust-search-clear { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: color 0.15s; flex-shrink: 0; }
        .cust-search-clear:hover { color: #ef4444; }
        .cust-search-meta { font-size: 0.75rem; font-weight: 700; color: #64748b; white-space: nowrap; }

        /* Flash */
        .cust-flash {
          padding: 11px 18px; border-radius: 12px; background: rgba(236,253,245,0.92);
          color: #065f46; font-size: 0.82rem; font-weight: 700; border: 1px solid #a7f3d0;
          backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px;
        }

        /* Table card */
        .cust-table-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04); overflow: hidden;
        }
        .cust-table-topbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.45);
        }
        .cust-table-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; }
        .cust-badge-count { font-size: 0.72rem; font-weight: 750; padding: 3px 10px; border-radius: 20px; background: rgba(59,130,246,0.1); color: #2563eb; border: 1px solid rgba(59,130,246,0.18); }
        .cust-state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 60px 20px; color: #64748b; font-size: 0.85rem; font-weight: 600; }
        .cust-spinner { width: 30px; height: 30px; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cust-scroll { overflow-x: auto; }
        .cust-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .cust-table thead tr { background: rgba(255,255,255,0.52); }
        .cust-table th { padding: 11px 14px; text-align: left; font-size: 0.67rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.35); white-space: nowrap; }
        .cust-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.22); color: #0f172a; vertical-align: middle; }
        .cust-tr:hover td { background: rgba(255,255,255,0.38); }
        .cust-table tbody tr:last-child td { border-bottom: none; }
        .td-bold   { font-weight: 700; }
        .td-muted  { color: #64748b; }
        .td-center { text-align: center; }

        .cust-type-pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.63rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-width: 1px; border-style: solid; }
        .data-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 750; }
        .data-value { font-weight: 750; font-size: 0.8rem; }

        /* Icon buttons */
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

        /* Pagination */
        .cust-pagination { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 13px 20px; border-top: 1px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.38); }
        .pg-info { font-size: 0.74rem; font-weight: 700; color: #64748b; }
        .pg-btns { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
        .pg-btn { padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.65); font-size: 0.72rem; font-weight: 750; color: #0f172a; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; font-family: inherit; }
        .pg-btn:hover:not(:disabled) { background: #fff; border-color: rgba(0,0,0,0.15); }
        .pg-btn.active { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; border: none; box-shadow: 0 3px 8px rgba(37,99,235,0.2); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-ellipsis { padding: 0 4px; font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

        /* Loyalty View Styles */
        .loyalty-header {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 14px; padding: 22px 26px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        .loyalty-header-left {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .loyalty-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          background: rgba(59,130,246,0.08); color: #2563eb;
          border: 1px solid rgba(59,130,246,0.18);
          font-size: 0.78rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .loyalty-back-btn:hover {
          background: #2563eb; color: #fff; transform: translateX(-2px);
        }
        .loyalty-title { font-size: 1.5rem; font-weight: 850; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 4px; line-height: 1.2; }
        .loyalty-subtitle { font-size: 0.8rem; font-weight: 550; color: #64748b; margin: 0; }

        /* Stats Grid */
        .loyalty-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
        }
        .loyalty-stat-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: 16px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          transition: all 0.22s ease;
        }
        .loyalty-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .stat-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-purple .stat-icon-wrap { background: rgba(126,34,206,0.1); }
        .stat-blue .stat-icon-wrap   { background: rgba(59,130,246,0.1); }
        .stat-amber .stat-icon-wrap  { background: rgba(180,83,9,0.1); }
        .stat-emerald .stat-icon-wrap{ background: rgba(4,120,87,0.1); }
        .stat-icon { font-size: 1.3rem; }
        .stat-info { display: flex; flex-direction: column; min-width: 0; }
        .stat-value { font-size: 1.15rem; font-weight: 850; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; }
        .stat-label { font-size: 0.68rem; font-weight: 650; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Loyalty Search */
        .loyalty-search-card {
          padding: 14px 18px; background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .loyalty-search-field {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.78); border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 11px; padding: 0 14px; transition: all 0.2s ease;
        }
        .loyalty-search-field:focus-within { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .loyalty-search-input { flex: 1; border: none; background: transparent; padding: 10px 0; font-size: 0.84rem; font-weight: 600; color: #0f172a; outline: none; font-family: inherit; }
        .loyalty-search-input::placeholder { color: #94a3b8; font-weight: 500; }
        .loyalty-search-clear { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: color 0.15s; flex-shrink: 0; }
        .loyalty-search-clear:hover { color: #ef4444; }

        .loyalty-sort-wrap {
          display: flex; align-items: center; gap: 8px;
        }
        .loyalty-sort-label {
          font-size: 0.72rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .loyalty-sort-select {
          padding: 8px 12px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.78);
          font-size: 0.78rem; font-weight: 650; color: #0f172a;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s ease;
        }
        .loyalty-sort-select:focus {
          outline: none; border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .loyalty-search-meta { font-size: 0.75rem; font-weight: 700; color: #64748b; white-space: nowrap; }

        /* Loyalty Flash */
        .loyalty-flash {
          padding: 11px 18px; border-radius: 12px; background: rgba(236,253,245,0.92);
          color: #065f46; font-size: 0.82rem; font-weight: 700; border: 1px solid #a7f3d0;
          backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px;
        }

        /* Loyalty Table card */
        .loyalty-table-card {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.5); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04); overflow: hidden;
        }
        .loyalty-table-topbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.45);
        }
        .loyalty-table-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; }
        .loyalty-badge-count { font-size: 0.72rem; font-weight: 750; padding: 3px 10px; border-radius: 20px; background: rgba(126,34,206,0.1); color: #7e22ce; border: 1px solid rgba(126,34,206,0.18); }
        .loyalty-state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 60px 20px; color: #64748b; font-size: 0.85rem; font-weight: 600; }
        .loyalty-spinner { width: 30px; height: 30px; border: 3px solid rgba(126,34,206,0.15); border-top-color: #7e22ce; border-radius: 50%; animation: loyaltySpin 0.75s linear infinite; }
        @keyframes loyaltySpin { to { transform: rotate(360deg); } }

        .loyalty-scroll { overflow-x: auto; }
        .loyalty-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .loyalty-table thead tr { background: rgba(255,255,255,0.52); }
        .loyalty-table th { padding: 11px 14px; text-align: left; font-size: 0.67rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.35); white-space: nowrap; }
        .loyalty-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.22); color: #0f172a; vertical-align: middle; }
        .loyalty-tr:hover td { background: rgba(255,255,255,0.38); }
        .loyalty-table tbody tr:last-child td { border-bottom: none; }

        /* Customer cell */
        .customer-cell {
          display: flex; align-items: center; gap: 10px;
        }
        .customer-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 850; letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .customer-info { display: flex; flex-direction: column; min-width: 0; }
        .customer-name { font-size: 0.82rem; font-weight: 750; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .customer-id { font-size: 0.65rem; font-weight: 600; color: #94a3b8; font-family: monospace; }

        /* Contact cell */
        .contact-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .contact-email { font-size: 0.78rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .contact-phone { font-size: 0.70rem; font-weight: 600; color: #94a3b8; }

        .loyalty-type-pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.63rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-width: 1px; border-style: solid; }
        .loyalty-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.74rem; font-weight: 750; }
        .loyalty-value { font-weight: 750; font-size: 0.8rem; }

        /* Icon buttons */
        .icon-btn.add-points { background: rgba(126,34,206,0.1);  color: #7e22ce; border-color: rgba(126,34,206,0.18); }
        .icon-btn.add-points:hover { background: #7e22ce; color: #fff; border-color: #7e22ce; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(126,34,206,0.28); }

        /* Loyalty Pagination */
        .loyalty-pagination { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 13px 20px; border-top: 1px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.38); }
        .loyalty-pagination .pg-btn.active { background: linear-gradient(135deg,#7e22ce,#6d28d9); color: #fff; border: none; box-shadow: 0 3px 8px rgba(126,34,206,0.2); }

        @media (max-width: 900px) {
          .loyalty-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .cust-actions-bar { grid-template-columns: 1fr; }
          .cust-panel { padding: 14px; }
          .quick-btn-desc { display: none; }
          .loyalty-stats-grid { grid-template-columns: 1fr 1fr; }
          .loyalty-sort-wrap { width: 100%; }
          .loyalty-sort-select { flex: 1; }
        }
        @media (max-width: 480px) {
          .loyalty-stats-grid { grid-template-columns: 1fr; }
          .loyalty-header-left { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

export default CustomerListPage;