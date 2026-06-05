import { useCustomers } from "../../context/CustomerContext";

export default function CustomerViewModal() {
  const { selectedCustomer, setSelectedCustomer } = useCustomers();

  if (!selectedCustomer) return null;

  const c = selectedCustomer;

  const typeStyles = {
    PLATINUM: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff", glow: "rgba(126,34,206,0.12)" },
    GOLD:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a", glow: "rgba(180,83,9,0.12)" },
    SILVER:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", glow: "rgba(71,85,105,0.10)" },
    BRONZE:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", glow: "rgba(194,65,12,0.10)" },
  };
  const tc = typeStyles[c.customerType] || typeStyles.BRONZE;

  const initials = `${(c.firstName || "?")[0]}${(c.lastName || "?")[0]}`.toUpperCase();

  const loyaltyColor =
    (c.loyaltyPoints || 0) >= 5000 ? "#7e22ce" :
    (c.loyaltyPoints || 0) >= 2000 ? "#b45309" :
    (c.loyaltyPoints || 0) >= 500  ? "#0369a1" : "#047857";

  const purchaseColor =
    (c.totalPurchases || 0) >= 100000 ? "#7e22ce" :
    (c.totalPurchases || 0) >= 50000  ? "#b45309" :
    (c.totalPurchases || 0) >= 10000  ? "#0369a1" : "#047857";

  return (
    <>
      {/* Backdrop */}
      <div className="cvm-backdrop" onClick={() => setSelectedCustomer(null)} />

      {/* Modal */}
      <div className="cvm-modal">

        {/* Close button */}
        <button className="cvm-close" onClick={() => setSelectedCustomer(null)} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Hero / Avatar strip ── */}
        <div className="cvm-hero" style={{ background: `linear-gradient(135deg, ${tc.glow}, transparent)`, borderBottom: `1px solid ${tc.border}` }}>
          <div className="cvm-avatar" style={{ background: tc.bg, color: tc.color, border: `2px solid ${tc.border}` }}>
            {initials}
          </div>
          <div className="cvm-hero-info">
            <h2 className="cvm-name">{c.firstName} {c.lastName}</h2>
            <span className="cvm-type-pill" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
              {c.customerType || "BRONZE"}
            </span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="cvm-stats-row">
          <div className="cvm-stat">
            <span className="cvm-stat-label">⭐ Loyalty Points</span>
            <span className="cvm-stat-value" style={{ color: loyaltyColor }}>
              {(c.loyaltyPoints || 0).toLocaleString()}
            </span>
          </div>
          <div className="cvm-stat-divider" />
          <div className="cvm-stat">
            <span className="cvm-stat-label">💰 Total Purchases</span>
            <span className="cvm-stat-value" style={{ color: purchaseColor }}>
              Rs. {(c.totalPurchases || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Detail rows ── */}
        <div className="cvm-details">

          {/* First Name */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">First Name</span>
              <span className="cvm-row-value">{c.firstName || "—"}</span>
            </div>
          </div>

          {/* Last Name */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Last Name</span>
              <span className="cvm-row-value">{c.lastName || "—"}</span>
            </div>
          </div>

          {/* Email */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Email</span>
              <span className="cvm-row-value">{c.email || "—"}</span>
            </div>
          </div>

          {/* Phone */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.35 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Phone</span>
              <span className="cvm-row-value">{c.phone || "—"}</span>
            </div>
          </div>

          {/* Customer Type */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Customer Type</span>
              <span className="cvm-row-value">
                <span
                  className="cvm-inline-pill"
                  style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
                >
                  {c.customerType || "BRONZE"}
                </span>
              </span>
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Loyalty Points</span>
              <span className="cvm-row-value" style={{ color: loyaltyColor, fontWeight: 800 }}>
                {(c.loyaltyPoints || 0).toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Total Purchases */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Total Purchases</span>
              <span className="cvm-row-value" style={{ color: purchaseColor, fontWeight: 800 }}>
                Rs. {(c.totalPurchases || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Preferred Branch */}
          <div className="cvm-row">
            <span className="cvm-row-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <div className="cvm-row-body">
              <span className="cvm-row-label">Preferred Branch</span>
              <span className="cvm-row-value">{c.preferredBranch?.name || "N/A"}</span>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="cvm-footer">
          <button className="cvm-close-btn" onClick={() => setSelectedCustomer(null)}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .cvm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(4px);
          z-index: 50;
          animation: cvmFadeIn 0.2s ease-out both;
        }
        @keyframes cvmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .cvm-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 51;
          width: 460px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          box-shadow:
            0 24px 64px rgba(0,0,0,0.12),
            0 4px 16px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,0.8);
          animation: cvmSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
          scrollbar-width: thin;
          scrollbar-color: rgba(203,213,225,0.6) transparent;
        }
        .cvm-modal::-webkit-scrollbar { width: 4px; }
        .cvm-modal::-webkit-scrollbar-track { background: transparent; }
        .cvm-modal::-webkit-scrollbar-thumb { background: rgba(203,213,225,0.6); border-radius: 4px; }

        @keyframes cvmSlideUp {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Close button */
        .cvm-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.8);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s ease;
          z-index: 2;
        }
        .cvm-close:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: rgba(220,38,38,0.2);
          transform: rotate(90deg);
        }

        /* Hero */
        .cvm-hero {
          padding: 28px 24px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cvm-avatar {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .cvm-hero-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .cvm-name {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 850;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .cvm-type-pill {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          width: fit-content;
        }

        /* Stats row */
        .cvm-stats-row {
          display: flex;
          align-items: stretch;
          margin: 0 20px 16px;
          background: rgba(248,250,252,0.8);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 14px;
          overflow: hidden;
        }
        .cvm-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 14px 12px;
        }
        .cvm-stat-divider {
          width: 1px;
          background: rgba(226,232,240,0.8);
          margin: 10px 0;
        }
        .cvm-stat-label {
          font-size: 0.67rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .cvm-stat-value {
          font-size: 1.05rem;
          font-weight: 850;
          letter-spacing: -0.02em;
          text-align: center;
        }

        /* Details */
        .cvm-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 20px 16px;
        }
        .cvm-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 11px;
          transition: background 0.15s ease;
        }
        .cvm-row:hover { background: rgba(248,250,252,0.9); }
        .cvm-row-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(241,245,249,0.9);
          border: 1px solid rgba(226,232,240,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cvm-row-body {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .cvm-row-label {
          font-size: 0.66rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cvm-row-value {
          font-size: 0.83rem;
          font-weight: 650;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cvm-inline-pill {
          display: inline-block;
          padding: 1px 8px;
          border-radius: 20px;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Footer */
        .cvm-footer {
          padding: 14px 20px 20px;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(226,232,240,0.5);
          background: rgba(248,250,252,0.5);
        }
        .cvm-close-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border: none;
          padding: 9px 24px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .cvm-close-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,0.35);
        }
        .cvm-close-btn:active { transform: translateY(0); }
      `}</style>
    </>
  );
}