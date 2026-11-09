import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCustomers } from "../../context/CustomerContext";

export default function CustomerDeleteModal({ customer, onClose, onSuccess }) {
  const { removeCustomer } = useCustomers();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    if (loading) return;
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await removeCustomer(customer._id);
      setVisible(false);
      setTimeout(() => { onSuccess?.("Customer deleted successfully"); onClose(); }, 280);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete customer. Please try again.");
      setLoading(false);
    }
  };

  const initials = `${(customer.firstName || "?")[0]}${(customer.lastName || "?")[0]}`.toUpperCase();

  const typeColor = {
    PLATINUM: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    GOLD:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    SILVER:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
    BRONZE:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  }[customer.customerType] || { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" };

  const modal = (
    <>
      {/* ── Backdrop ── */}
      <div
        className="cdm-backdrop"
        onClick={handleClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99998,
          background: "rgba(10,18,35,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      {/* ── Modal centered in middle of screen ── */}
      <div
        className="cdm-modal-wrapper"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          className="cdm-modal"
          style={{
            pointerEvents: "all",
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "24px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
            padding: "32px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.93) translateY(22px)",
            transition: "opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.50,0.64,1)",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
          }}
        >
          {/* Close */}
          <button className="cdm-x" onClick={handleClose} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Warning icon */}
          <div className="cdm-icon-wrap">
            <div className="cdm-ring-outer">
              <div className="cdm-ring-inner">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="cdm-title-block">
            <h2 className="cdm-title">Delete Customer?</h2>
            <p className="cdm-sub">
              This action is permanent and cannot be undone. The following
              customer record will be permanently removed.
            </p>
          </div>

          {/* Customer preview */}
          <div className="cdm-preview">
            <div className="cdm-preview-avatar">{initials}</div>
            <div className="cdm-preview-info">
              <span className="cdm-preview-name">{customer.firstName} {customer.lastName}</span>
              <span className="cdm-preview-email">{customer.email}</span>
              <span className="cdm-preview-phone">{customer.phone}</span>
            </div>
            <span
              className="cdm-type-pill"
              style={{
                background:   typeColor.bg,
                color:        typeColor.color,
                borderColor:  typeColor.border,
              }}
            >
              {customer.customerType || "BRONZE"}
            </span>
          </div>

          {/* Stats */}
          <div className="cdm-stats">
            <div className="cdm-stat">
              <span className="cdm-stat-val" style={{ color: "#7c3aed" }}>
                {(customer.loyaltyPoints || 0).toLocaleString()}
              </span>
              <span className="cdm-stat-lbl">Loyalty Pts</span>
            </div>
            <div className="cdm-stat-sep" />
            <div className="cdm-stat">
              <span className="cdm-stat-val" style={{ color: "#0369a1" }}>
                Rs.{(customer.totalPurchases || 0).toLocaleString()}
              </span>
              <span className="cdm-stat-lbl">Total Purchases</span>
            </div>
            <div className="cdm-stat-sep" />
            <div className="cdm-stat">
              <span
                className={`cdm-stat-status ${
                  customer.status === "ACTIVE" ? "cdm-s-active" : "cdm-s-inactive"
                }`}
              >
                {customer.status || "ACTIVE"}
              </span>
              <span className="cdm-stat-lbl">Status</span>
            </div>
          </div>

          {/* Error */}
          {error && <div className="cdm-error">⚠ {error}</div>}

          {/* Buttons */}
          <div className="cdm-btns">
            <button className="cdm-btn-cancel" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button className="cdm-btn-delete" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <><span className="cdm-spin" /> Deleting…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Yes, Delete Customer
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Close btn */
        .cdm-x {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.8);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s ease;
          z-index: 2;
        }
        .cdm-x:hover:not(:disabled) {
          background: #fff;
          color: #ef4444;
          border-color: rgba(220,38,38,0.2);
          transform: rotate(90deg);
        }
        .cdm-x:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Icon rings */
        .cdm-icon-wrap {
          display: flex;
          justify-content: center;
        }
        .cdm-ring-outer {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(220,38,38,0.06);
          border: 1.5px solid rgba(220,38,38,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cdm-ring-inner {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(220,38,38,0.10);
          border: 1.5px solid rgba(220,38,38,0.20);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Title */
        .cdm-title-block {
          text-align: center;
        }
        .cdm-title {
          font-size: 1.12rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .cdm-sub {
          font-size: 0.79rem;
          font-weight: 500;
          color: #64748b;
          margin: 0;
          line-height: 1.55;
        }

        /* Preview card */
        .cdm-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(248,250,252,0.85);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 14px;
          flex-wrap: wrap;
        }
        .cdm-preview-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg,#94a3b8,#64748b);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }
        .cdm-preview-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .cdm-preview-name {
          font-size: 0.87rem;
          font-weight: 800;
          color: #0f172a;
        }
        .cdm-preview-email {
          font-size: 0.73rem;
          font-weight: 600;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cdm-preview-phone {
          font-size: 0.70rem;
          font-weight: 600;
          color: #94a3b8;
        }
        .cdm-type-pill {
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 0.60rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-width: 1px;
          border-style: solid;
          white-space: nowrap;
          flex-shrink: 0;
          margin-left: auto;
        }

        /* Stats */
        .cdm-stats {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: rgba(248,250,252,0.7);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 12px;
          gap: 4px;
        }
        .cdm-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .cdm-stat-sep {
          width: 1px;
          height: 30px;
          background: rgba(226,232,240,0.9);
          flex-shrink: 0;
        }
        .cdm-stat-val {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .cdm-stat-lbl {
          font-size: 0.60rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }
        .cdm-stat-status {
          font-size: 0.60rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid transparent;
        }
        .cdm-s-active {
          background: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
        }
        .cdm-s-inactive {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        /* Error */
        .cdm-error {
          padding: 10px 14px;
          border-radius: 10px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 0.78rem;
          font-weight: 700;
          animation: cdmShake 0.32s ease;
        }
        @keyframes cdmShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        /* Buttons */
        .cdm-btns {
          display: flex;
          gap: 10px;
        }
        .cdm-btn-cancel {
          flex: 1;
          padding: 11px 0;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .cdm-btn-cancel:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .cdm-btn-cancel:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .cdm-btn-delete {
          flex: 1.6;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 0;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(220,38,38,0.30);
          font-family: inherit;
          white-space: nowrap;
        }
        .cdm-btn-delete:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(220,38,38,0.42);
        }
        .cdm-btn-delete:active:not(:disabled) {
          transform: translateY(0);
        }
        .cdm-btn-delete:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* Spinner */
        .cdm-spin {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cdmSpin 0.65s linear infinite;
          flex-shrink: 0;
          vertical-align: middle;
          margin-right: 4px;
        }
        @keyframes cdmSpin {
          to { transform: rotate(360deg); }
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .cdm-modal {
            border-radius: 20px;
            max-height: calc(100vh - 32px);
            padding: 24px 18px 18px;
          }
          .cdm-btns {
            flex-direction: column-reverse;
          }
          .cdm-btn-cancel,
          .cdm-btn-delete {
            flex: unset;
            width: 100%;
          }
          .cdm-preview {
            flex-wrap: wrap;
          }
          .cdm-type-pill {
            margin-left: auto;
          }
          .cdm-stats {
            gap: 4px;
          }
          .cdm-stat-val {
            font-size: 0.75rem;
          }
          .cdm-title {
            font-size: 1rem;
          }
          .cdm-sub {
            font-size: 0.72rem;
          }
          .cdm-ring-outer {
            width: 64px;
            height: 64px;
          }
          .cdm-ring-inner {
            width: 46px;
            height: 46px;
          }
        }
      `}</style>
    </>
  );

  return createPortal(modal, document.body);
}