import { useCustomers } from "../../context/CustomerContext";

export default function CustomerViewModal() {
  const { selectedCustomer, setSelectedCustomer } = useCustomers();
  if (!selectedCustomer) return null;
  const c = selectedCustomer;

  const typeStyles = {
    PLATINUM: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff", accent: "#7e22ce", glow: "rgba(126,34,206,0.08)" },
    GOLD:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a", accent: "#b45309", glow: "rgba(180,83,9,0.08)" },
    SILVER:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", accent: "#475569", glow: "rgba(71,85,105,0.07)" },
    BRONZE:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", accent: "#c2410c", glow: "rgba(194,65,12,0.08)" },
  };
  const tc = typeStyles[c.customerType] || typeStyles.BRONZE;

  const initials = `${(c.firstName||"?")[0]}${(c.lastName||"?")[0]}`.toUpperCase();

  const loyaltyColor =
    (c.loyaltyPoints||0)>=5000 ? "#7e22ce" :
    (c.loyaltyPoints||0)>=2000 ? "#b45309" :
    (c.loyaltyPoints||0)>=500  ? "#0369a1" : "#047857";

  const purchaseColor =
    (c.totalPurchases||0)>=100000 ? "#7e22ce" :
    (c.totalPurchases||0)>=50000  ? "#b45309" :
    (c.totalPurchases||0)>=10000  ? "#0369a1" : "#047857";

  const rows = [
    { label:"First Name",   icon:"👤", value: c.firstName||"—" },
    { label:"Last Name",    icon:"👤", value: c.lastName||"—" },
    { label:"Email",        icon:"✉️",  value: c.email||"—" },
    { label:"Phone",        icon:"📱", value: c.phone||"—" },
    { label:"Gender",       icon:"🪪",  value: c.gender||"—" },
    { label:"Status",       icon:"🔘", value: c.status||"ACTIVE", isStatus: true },
    { label:"Branch",       icon:"🏢", value: c.preferredBranch?.name||"N/A" },
  ];

  return (
    <>
      <div className="cvm-backdrop" onClick={() => setSelectedCustomer(null)} />

      <div className="cvm-modal">
        {/* Close */}
        <button className="cvm-x" onClick={() => setSelectedCustomer(null)} title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── Hero ── */}
        <div className="cvm-hero" style={{ background: `linear-gradient(150deg, ${tc.glow} 0%, rgba(248,250,252,0.4) 100%)` }}>
          <div className="cvm-avatar" style={{ background: `linear-gradient(135deg, ${tc.bg}, white)`, color: tc.color, border: `2px solid ${tc.border}`, boxShadow: `0 0 0 4px ${tc.glow}` }}>
            {initials}
          </div>
          <div className="cvm-hero-text">
            <h2 className="cvm-name">{c.firstName} {c.lastName}</h2>
            <div className="cvm-hero-meta">
              <span className="cvm-type-badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                {c.customerType || "BRONZE"}
              </span>
              {c.status && (
                <span className={`cvm-status-dot ${c.status === "ACTIVE" ? "cvm-active" : "cvm-inactive"}`}>
                  {c.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="cvm-stats">
          <div className="cvm-stat-item">
            <span className="cvm-stat-icon">⭐</span>
            <span className="cvm-stat-val" style={{ color: loyaltyColor }}>
              {(c.loyaltyPoints||0).toLocaleString()}
            </span>
            <span className="cvm-stat-lbl">Loyalty Points</span>
          </div>
          <div className="cvm-stat-sep" />
          <div className="cvm-stat-item">
            <span className="cvm-stat-icon">💰</span>
            <span className="cvm-stat-val" style={{ color: purchaseColor }}>
              Rs.{(c.totalPurchases||0).toLocaleString()}
            </span>
            <span className="cvm-stat-lbl">Total Purchases</span>
          </div>
        </div>

        {/* ── Detail grid: 2 columns ── */}
        <div className="cvm-detail-grid">
          {rows.map(({ label, icon, value, isStatus }) => (
            <div key={label} className="cvm-detail-cell">
              <span className="cvm-detail-lbl">{icon} {label}</span>
              {isStatus ? (
                <span className={`cvm-status-pill ${value === "ACTIVE" ? "cvm-active-pill" : "cvm-inactive-pill"}`}>
                  {value}
                </span>
              ) : (
                <span className="cvm-detail-val">{value}</span>
              )}
            </div>
          ))}
          {/* Customer type cell */}
          <div className="cvm-detail-cell">
            <span className="cvm-detail-lbl">🏅 Customer Type</span>
            <span className="cvm-type-inline" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
              {c.customerType || "BRONZE"}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="cvm-footer">
          <button className="cvm-btn-close" onClick={() => setSelectedCustomer(null)}>
            Close Profile
          </button>
        </div>
      </div>

      <style>{`
        /* Backdrop */
        .cvm-backdrop {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(10,18,35,0.48);
          backdrop-filter: blur(6px);
          animation: cvmFade 0.22s ease both;
        }
        @keyframes cvmFade { from { opacity:0; } to { opacity:1; } }

        /* Modal — centred, fixed layout */
        .cvm-modal {
          position: fixed;
          inset: 0;
          z-index: 51;
          margin: auto;
          width: calc(100% - 32px);
          max-width: 480px;
          height: fit-content;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06);
          animation: cvmUp 0.30s cubic-bezier(0.34,1.50,0.64,1) both;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
          /* key: use inset+margin:auto instead of transform:translate(-50%,-50%) */
          display: flex;
          flex-direction: column;
          align-self: center;
        }
        @keyframes cvmUp {
          from { opacity:0; transform:scale(0.94) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .cvm-modal::-webkit-scrollbar { width:4px; }
        .cvm-modal::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }

        /* Close button */
        .cvm-x {
          position: absolute; top:14px; right:14px;
          width:30px; height:30px; border-radius:50%;
          border:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.9);
          color:#64748b; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.18s ease; z-index:2;
        }
        .cvm-x:hover { background:#fee2e2; color:#dc2626; border-color:rgba(220,38,38,0.2); transform:rotate(90deg); }

        /* Hero */
        .cvm-hero {
          padding: 28px 24px 20px;
          display: flex;
          align-items: center;
          gap: 18px;
          border-radius: 24px 24px 0 0;
          flex-shrink: 0;
        }
        .cvm-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; font-weight: 900; letter-spacing: -0.03em;
          flex-shrink: 0;
        }
        .cvm-hero-text { flex: 1; min-width: 0; }
        .cvm-name {
          margin: 0 0 8px;
          font-size: 1.18rem; font-weight: 850; color: #0f172a;
          letter-spacing: -0.025em; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cvm-hero-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .cvm-type-badge {
          padding: 3px 10px; border-radius: 20px;
          font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .cvm-status-dot {
          padding: 3px 10px; border-radius: 20px;
          font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .cvm-active   { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .cvm-inactive { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

        /* Stats */
        .cvm-stats {
          display: flex; align-items: stretch;
          margin: 0 20px 16px;
          background: rgba(248,250,252,0.85);
          border: 1px solid #e8edf5;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cvm-stat-item {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 14px 12px;
        }
        .cvm-stat-sep { width:1px; background:#e8edf5; margin: 10px 0; }
        .cvm-stat-icon { font-size: 1rem; }
        .cvm-stat-val  { font-size: 1.0rem; font-weight: 850; letter-spacing: -0.02em; line-height:1; }
        .cvm-stat-lbl  { font-size: 0.64rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Detail grid — 2 columns */
        .cvm-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 0 20px 16px;
          flex-shrink: 0;
        }
        .cvm-detail-cell {
          display: flex; flex-direction: column; gap: 4px;
          padding: 10px 12px;
          background: rgba(248,250,252,0.7);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 12px;
          transition: background 0.15s;
          min-width: 0;
        }
        .cvm-detail-cell:hover { background: rgba(241,245,249,0.9); }
        .cvm-detail-lbl {
          font-size: 0.64rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .cvm-detail-val {
          font-size: 0.82rem; font-weight: 650; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cvm-type-inline {
          padding: 2px 8px; border-radius: 20px; width: fit-content;
          font-size: 0.60rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .cvm-status-pill {
          padding: 2px 8px; border-radius: 20px; width: fit-content;
          font-size: 0.60rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .cvm-active-pill   { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
        .cvm-inactive-pill { background:#fef2f2; color:#dc2626; border-color:#fecaca; }

        /* Footer */
        .cvm-footer {
          padding: 14px 20px 20px;
          border-top: 1px solid rgba(226,232,240,0.5);
          background: rgba(248,250,252,0.5);
          border-radius: 0 0 24px 24px;
          flex-shrink: 0;
        }
        .cvm-btn-close {
          width: 100%;
          padding: 11px 0;
          border-radius: 12px; border: none;
          background: linear-gradient(135deg,#2563eb,#1d4ed8);
          color: #fff; font-size: 0.84rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37,99,235,0.25);
          font-family: inherit;
        }
        .cvm-btn-close:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.35); }
        .cvm-btn-close:active { transform:translateY(0); }

        /* Mobile */
        @media (max-width: 480px) {
          .cvm-modal { border-radius:20px; max-height:calc(100vh - 24px); }
          .cvm-detail-grid { grid-template-columns: 1fr; }
          .cvm-hero { padding: 22px 18px 16px; gap:14px; }
          .cvm-avatar { width:52px; height:52px; font-size:1.1rem; }
          .cvm-name { font-size:1rem; }
        }
      `}</style>
    </>
  );
}