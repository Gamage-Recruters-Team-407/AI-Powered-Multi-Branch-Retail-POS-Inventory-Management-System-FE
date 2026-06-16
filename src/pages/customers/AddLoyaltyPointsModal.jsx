import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCustomers } from "../../context/CustomerContext";

export default function AddLoyaltyPointsModal({ customer, onClose, onSuccess }) {
  const { addLoyaltyPoints } = useCustomers();

  const [amount, setAmount]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [visible, setVisible]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

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

  // Calculate points: 1 point per Rs. 1,000
  const numericAmount = parseFloat(amount) || 0;
  const calculatedPoints = Math.floor(numericAmount / 1000);
  const currentPoints = customer.loyaltyPoints || 0;
  const projectedPoints = currentPoints + calculatedPoints;

  // ✅ FIXED: Backend uses totalPurchases (Rs.) for tier, NOT points
  const currentTotalPurchases = customer.totalPurchases || 0;
  const projectedTotalPurchases = currentTotalPurchases + numericAmount;

  // ✅ FIXED: Matches ORIGINAL backend addLoyaltyPoints thresholds
  // PLATINUM ≥ 2,500,000 | GOLD ≥ 1,000,000 | SILVER ≥ 200,000 | BRONZE < 200,000
  const getNextTier = (totalPurchases) => {
    if (totalPurchases < 200000)   return { name: "SILVER",   threshold: 200000,  color: "#475569" };
    if (totalPurchases < 1000000)  return { name: "GOLD",     threshold: 1000000, color: "#b45309" };
    if (totalPurchases < 2500000)  return { name: "PLATINUM", threshold: 2500000, color: "#7e22ce" };
    return null;
  };

  const currentTier = customer.customerType || "BRONZE";
  const nextTier = getNextTier(projectedTotalPurchases);

  // ✅ Calculate progress within current tier range
  const getTierFloor = (totalPurchases) => {
    if (totalPurchases >= 1000000) return 1000000;
    if (totalPurchases >= 200000)  return 200000;
    return 0;
  };
  const tierFloor = getTierFloor(projectedTotalPurchases);
  const tierProgress = nextTier
    ? Math.min(100, Math.round(((projectedTotalPurchases - tierFloor) / (nextTier.threshold - tierFloor)) * 100))
    : 100;

  const typeColor = {
    PLATINUM: { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
    GOLD:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    SILVER:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
    BRONZE:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  }[currentTier] || { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" };

  const initials = `${(customer.firstName || "?")[0]}${(customer.lastName || "?")[0]}`.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (numericAmount <= 0) {
      setError("Please enter a valid purchase amount greater than 0");
      return;
    }

    if (calculatedPoints === 0) {
      setError("Purchase amount must be at least Rs. 1,000 to earn points");
      return;
    }

    setLoading(true);
    try {
      await addLoyaltyPoints(customer._id, numericAmount);
      setAwardedPoints(calculatedPoints);
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onSuccess?.(`${calculatedPoints} loyalty points added successfully!`);
          onClose();
        }, 280);
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add loyalty points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const modal = (
    <>
      {/* ── Backdrop ── */}
      <div
        className="alp-backdrop"
        onClick={handleClose}
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* ── Centring shell ── */}
      <div className="alp-shell">
        {/* ── Modal card ── */}
        <div
          className="alp-modal"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.93) translateY(22px)",
          }}
        >
          {/* Close */}
          <button className="alp-x" onClick={handleClose} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {success ? (
            /* ── Success State ── */
            <div className="alp-success">
              <div className="alp-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="alp-success-title">Points Awarded!</h2>
              <p className="alp-success-sub">
                <strong style={{ color: "#7e22ce" }}>⭐ {awardedPoints.toLocaleString()}</strong> loyalty points
                have been added to <strong>{customer.firstName} {customer.lastName}</strong>'s account.
              </p>
              <div className="alp-success-summary">
                <div className="alp-success-row">
                  <span>Previous Points</span>
                  <span>{currentPoints.toLocaleString()}</span>
                </div>
                <div className="alp-success-row">
                  <span>Points Added</span>
                  <span style={{ color: "#10b981" }}>+{awardedPoints.toLocaleString()}</span>
                </div>
                <div className="alp-success-row total">
                  <span>New Balance</span>
                  <span>{projectedPoints.toLocaleString()}</span>
                </div>
                <div className="alp-success-row">
                  <span>Total Purchases</span>
                  <span style={{ color: "#0369a1" }}>Rs. {projectedTotalPurchases.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              {/* Icon */}
              <div className="alp-icon-wrap">
                <div className="alp-ring-outer">
                  <div className="alp-ring-inner">
                    <span style={{ fontSize: "26px" }}>⭐</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="alp-title-block">
                <h2 className="alp-title">Add Loyalty Points</h2>
                <p className="alp-sub">
                  Enter the purchase amount to calculate and award loyalty points.
                  <br />
                  <strong>1 point = Rs. 1,000 spent</strong>
                </p>
              </div>

              {/* Customer preview */}
              <div className="alp-preview">
                <div className="alp-preview-avatar" style={{ background: `linear-gradient(135deg, ${typeColor.bg}, white)`, color: typeColor.color, border: `1.5px solid ${typeColor.border}` }}>
                  {initials}
                </div>
                <div className="alp-preview-info">
                  <span className="alp-preview-name">{customer.firstName} {customer.lastName}</span>
                  <span className="alp-preview-meta">
                    {customer.email || "—"} • Current: <strong style={{ color: "#7e22ce" }}>⭐ {currentPoints.toLocaleString()}</strong>
                  </span>
                </div>
                <span
                  className="alp-type-pill"
                  style={{
                    background: typeColor.bg,
                    color: typeColor.color,
                    borderColor: typeColor.border,
                  }}
                >
                  {currentTier}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="alp-form">
                <div className="alp-field">
                  <label className="alp-label" htmlFor="amount">PURCHASE AMOUNT (Rs.)</label>
                  <div className="alp-input-wrap">
                    <span className="alp-input-prefix">Rs.</span>
                    <input
                      id="amount"
                      type="number"
                      min="0"
                      step="100"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setError(""); }}
                      placeholder="Enter purchase amount"
                      className="alp-input"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="alp-quick-amounts">
                  <span className="alp-quick-label">Quick select:</span>
                  <div className="alp-quick-btns">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setAmount(String(amt)); setError(""); }}
                        className={`alp-quick-btn ${numericAmount === amt ? "active" : ""}`}
                        disabled={loading}
                      >
                        Rs.{amt >= 1000 ? `${amt/1000}K` : amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Points Preview */}
                {numericAmount > 0 && (
                  <div className="alp-preview-card">
                    <div className="alp-preview-row">
                      <span className="alp-preview-lbl">Purchase Amount</span>
                      <span className="alp-preview-val">Rs. {numericAmount.toLocaleString()}</span>
                    </div>
                    <div className="alp-preview-row highlight">
                      <span className="alp-preview-lbl">⭐ Points to Award</span>
                      <span className="alp-preview-val points">
                        {calculatedPoints > 0 ? `+${calculatedPoints.toLocaleString()}` : "0"}
                      </span>
                    </div>
                    <div className="alp-preview-row">
                      <span className="alp-preview-lbl">New Points Balance</span>
                      <span className="alp-preview-val balance">{projectedPoints.toLocaleString()}</span>
                    </div>
                    <div className="alp-preview-row">
                      <span className="alp-preview-lbl">New Total Purchases</span>
                      <span className="alp-preview-val" style={{ color: "#0369a1" }}>
                        Rs. {projectedTotalPurchases.toLocaleString()}
                      </span>
                    </div>

                    {/* Tier Progress */}
                    {nextTier ? (
                      <div className="alp-tier-progress">
                        <div className="alp-tier-header">
                          <span>Progress to {nextTier.name}</span>
                          <span style={{ color: nextTier.color, fontWeight: 800 }}>{tierProgress}%</span>
                        </div>
                        <div className="alp-tier-bar">
                          <div
                            className="alp-tier-fill"
                            style={{
                              width: `${tierProgress}%`,
                              background: `linear-gradient(90deg, ${typeColor.color}, ${nextTier.color})`,
                            }}
                          />
                        </div>
                        <span className="alp-tier-hint">
                          Rs. {(nextTier.threshold - projectedTotalPurchases).toLocaleString()} more in purchases to reach {nextTier.name}
                        </span>
                      </div>
                    ) : (
                      <div className="alp-tier-progress">
                        <div className="alp-tier-header">
                          <span>🏆 Maximum Tier Reached</span>
                          <span style={{ color: "#7e22ce", fontWeight: 800 }}>PLATINUM</span>
                        </div>
                        <div className="alp-tier-bar">
                          <div
                            className="alp-tier-fill"
                            style={{
                              width: `100%`,
                              background: `linear-gradient(90deg, #7e22ce, #a855f7)`,
                            }}
                          />
                        </div>
                        <span className="alp-tier-hint">
                          🎉 Congratulations! You've reached the highest tier.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && <div className="alp-error">⚠ {error}</div>}

                {/* Buttons */}
                <div className="alp-btns">
                  <button type="button" className="alp-btn-cancel" onClick={handleClose} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="alp-btn-submit" disabled={loading || calculatedPoints === 0}>
                    {loading ? (
                      <><span className="alp-spin" /> Awarding…</>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Award {calculatedPoints > 0 ? `${calculatedPoints.toLocaleString()} Points` : "Points"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Backdrop */
        .alp-backdrop {
          position: fixed; inset: 0; z-index: 99998;
          background: rgba(10,18,35,0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: opacity 0.28s ease;
        }

        /* Shell */
        .alp-shell {
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px; pointer-events: none;
        }

        /* Modal */
        .alp-modal {
          pointer-events: all;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08);
          padding: 32px 24px 24px;
          display: flex; flex-direction: column; gap: 14px;
          position: relative;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.50,0.64,1);
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .alp-modal::-webkit-scrollbar { width: 4px; }
        .alp-modal::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* Close */
        .alp-x {
          position: absolute; top: 14px; right: 14px;
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.8);
          color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s ease; z-index: 2;
        }
        .alp-x:hover:not(:disabled) {
          background: #fff; color: #ef4444;
          border-color: rgba(220,38,38,0.2);
          transform: rotate(90deg);
        }
        .alp-x:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Icon */
        .alp-icon-wrap { display: flex; justify-content: center; }
        .alp-ring-outer {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(126,34,206,0.06);
          border: 1.5px solid rgba(126,34,206,0.14);
          display: flex; align-items: center; justify-content: center;
        }
        .alp-ring-inner {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(126,34,206,0.10);
          border: 1.5px solid rgba(126,34,206,0.20);
          display: flex; align-items: center; justify-content: center;
        }

        /* Title */
        .alp-title-block { text-align: center; }
        .alp-title {
          font-size: 1.15rem; font-weight: 850; color: #0f172a;
          margin: 0 0 6px; letter-spacing: -0.02em;
        }
        .alp-sub {
          font-size: 0.78rem; font-weight: 500; color: #64748b;
          margin: 0; line-height: 1.55;
        }

        /* Preview */
        .alp-preview {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: rgba(248,250,252,0.85);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 14px;
        }
        .alp-preview-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 850;
          flex-shrink: 0; letter-spacing: -0.02em;
        }
        .alp-preview-info {
          display: flex; flex-direction: column; gap: 2px;
          flex: 1; min-width: 0;
        }
        .alp-preview-name {
          font-size: 0.85rem; font-weight: 800; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .alp-preview-meta {
          font-size: 0.68rem; font-weight: 600; color: #64748b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .alp-type-pill {
          padding: 3px 9px; border-radius: 20px;
          font-size: 0.60rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
          border-width: 1px; border-style: solid;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Form */
        .alp-form {
          display: flex; flex-direction: column; gap: 12px;
        }
        .alp-field { display: flex; flex-direction: column; gap: 5px; }
        .alp-label {
          font-size: 0.66rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .alp-input-wrap {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.78);
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .alp-input-wrap:focus-within {
          border-color: #7e22ce;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(126,34,206,0.12);
        }
        .alp-input-prefix {
          padding: 0 12px;
          font-size: 0.82rem; font-weight: 750; color: #64748b;
          background: rgba(248,250,252,0.8);
          border-right: 1px solid #e2e8f0;
          height: 100%;
          display: flex; align-items: center;
          min-height: 42px;
        }
        .alp-input {
          flex: 1; border: none; background: transparent;
          padding: 10px 14px;
          font-size: 0.95rem; font-weight: 700; color: #0f172a;
          outline: none; font-family: inherit;
          min-height: 42px;
        }
        .alp-input::placeholder { color: #c8d3df; font-weight: 500; }
        .alp-input::-webkit-outer-spin-button,
        .alp-input::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        .alp-input[type=number] { -moz-appearance: textfield; }

        /* Quick amounts */
        .alp-quick-amounts {
          display: flex; flex-direction: column; gap: 6px;
        }
        .alp-quick-label {
          font-size: 0.66rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .alp-quick-btns {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
        }
        .alp-quick-btn {
          padding: 7px 8px; border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: rgba(255,255,255,0.7);
          font-size: 0.72rem; font-weight: 750; color: #475569;
          cursor: pointer; transition: all 0.18s ease;
          font-family: inherit;
        }
        .alp-quick-btn:hover:not(:disabled) {
          border-color: #7e22ce; color: #7e22ce;
          background: rgba(126,34,206,0.05);
        }
        .alp-quick-btn.active {
          background: linear-gradient(135deg, #7e22ce, #6d28d9);
          color: #fff; border-color: transparent;
          box-shadow: 0 3px 8px rgba(126,34,206,0.25);
        }
        .alp-quick-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Preview card */
        .alp-preview-card {
          background: linear-gradient(135deg, rgba(126,34,206,0.04), rgba(59,130,246,0.04));
          border: 1px solid rgba(126,34,206,0.15);
          border-radius: 14px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 8px;
          animation: alpFadeIn 0.25s ease;
        }
        @keyframes alpFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .alp-preview-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 4px 0;
        }
        .alp-preview-row.highlight {
          padding: 8px 10px;
          background: rgba(126,34,206,0.08);
          border-radius: 8px;
          margin: 2px 0;
        }
        .alp-preview-lbl {
          font-size: 0.74rem; font-weight: 650; color: #64748b;
        }
        .alp-preview-val {
          font-size: 0.82rem; font-weight: 750; color: #0f172a;
        }
        .alp-preview-val.points {
          color: #7e22ce; font-size: 0.95rem;
        }
        .alp-preview-val.balance {
          color: #059669;
        }

        /* Tier progress */
        .alp-tier-progress {
          margin-top: 4px; padding-top: 10px;
          border-top: 1px dashed rgba(126,34,206,0.2);
          display: flex; flex-direction: column; gap: 6px;
        }
        .alp-tier-header {
          display: flex; justify-content: space-between;
          font-size: 0.70rem; font-weight: 700; color: #475569;
        }
        .alp-tier-bar {
          height: 8px; background: rgba(226,232,240,0.8);
          border-radius: 10px; overflow: hidden;
        }
        .alp-tier-fill {
          height: 100%; border-radius: 10px;
          transition: width 0.4s ease;
        }
        .alp-tier-hint {
          font-size: 0.66rem; font-weight: 600; color: #94a3b8;
          text-align: center;
        }

        /* Error */
        .alp-error {
          padding: 10px 14px; border-radius: 10px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.78rem; font-weight: 700;
          animation: alpShake 0.32s ease;
        }
        @keyframes alpShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        /* Buttons */
        .alp-btns { display: flex; gap: 10px; margin-top: 4px; }
        .alp-btn-cancel {
          flex: 1; padding: 11px 0; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s ease; font-family: inherit;
        }
        .alp-btn-cancel:hover:not(:disabled) {
          background: #f8fafc; border-color: #cbd5e1; color: #0f172a;
        }
        .alp-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }

        .alp-btn-submit {
          flex: 1.6;
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; padding: 11px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7e22ce, #6d28d9);
          color: #fff; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(126,34,206,0.30);
          font-family: inherit; white-space: nowrap;
        }
        .alp-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(126,34,206,0.42);
        }
        .alp-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .alp-btn-submit:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }

        /* Spinner */
        .alp-spin {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: alpSpin 0.65s linear infinite;
          flex-shrink: 0; vertical-align: middle;
        }
        @keyframes alpSpin { to { transform: rotate(360deg); } }

        /* Success state */
        .alp-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 10px 0;
          text-align: center;
          animation: alpSuccessIn 0.4s ease;
        }
        @keyframes alpSuccessIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .alp-success-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(16,185,129,0.1);
          border: 2px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          animation: alpPop 0.5s cubic-bezier(0.34,1.50,0.64,1);
        }
        @keyframes alpPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .alp-success-title {
          font-size: 1.3rem; font-weight: 850; color: #065f46;
          margin: 0; letter-spacing: -0.02em;
        }
        .alp-success-sub {
          font-size: 0.82rem; font-weight: 500; color: #64748b;
          margin: 0; line-height: 1.55; max-width: 320px;
        }
        .alp-success-summary {
          width: 100%; max-width: 280px;
          background: rgba(248,250,252,0.85);
          border: 1px solid rgba(226,232,240,0.7);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex; flex-direction: column; gap: 6px;
          margin-top: 4px;
        }
        .alp-success-row {
          display: flex; justify-content: space-between;
          font-size: 0.78rem; font-weight: 600; color: #64748b;
        }
        .alp-success-row span:last-child { color: #0f172a; font-weight: 750; }
        .alp-success-row.total {
          padding-top: 8px; margin-top: 2px;
          border-top: 1px dashed rgba(226,232,240,0.8);
          font-size: 0.88rem;
        }
        .alp-success-row.total span:last-child {
          color: #7e22ce; font-weight: 850; font-size: 1rem;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .alp-modal {
            border-radius: 20px;
            max-height: calc(100vh - 24px);
            padding: 24px 18px 18px;
          }
          .alp-btns { flex-direction: column-reverse; }
          .alp-btn-cancel, .alp-btn-submit { flex: unset; width: 100%; }
          .alp-quick-btns { grid-template-columns: repeat(3, 1fr); }
          .alp-preview { flex-wrap: wrap; }
          .alp-type-pill { margin-left: auto; }
          .alp-title { font-size: 1.05rem; }
          .alp-sub { font-size: 0.72rem; }
        }
      `}</style>
    </>
  );

  return createPortal(modal, document.body);
}