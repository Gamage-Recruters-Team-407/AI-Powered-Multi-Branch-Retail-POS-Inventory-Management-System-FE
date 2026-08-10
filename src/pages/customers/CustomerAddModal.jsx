import { useState, useEffect } from "react";
import { useCustomers } from "../../context/CustomerContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  preferredBranch: "",
  status: "ACTIVE",
};

/* ── Validation rules ── */
const RULES = {
  firstName: (v) => !v.trim() ? "First name is required" : v.trim().length < 2 ? "Minimum 2 characters" : "",
  lastName:  (v) => !v.trim() ? "Last name is required"  : v.trim().length < 2 ? "Minimum 2 characters" : "",
  email:     (v) => !v.trim() ? "Email address is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "",
  phone:     (v) => !v.trim() ? "Phone number is required" : !/^\+?[\d\s\-]{7,15}$/.test(v) ? "Enter a valid phone number (7–15 digits)" : "",
};

export default function CustomerAddModal({ onClose, onSuccess }) {
  const { fetchCustomers } = useCustomers();

  const [form, setForm]         = useState(EMPTY);
  const [branches, setBranches] = useState([]);
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [branchLoad, setBranchLoad] = useState(true);
  const [submitErr, setSubmitErr]   = useState("");
  const [visible, setVisible]       = useState(false);

  /* animate in */
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  /* fetch branches */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const r = await axios.get(`${API}/branches`, { headers });
        setBranches(r.data?.data || r.data || []);
      } catch { setBranches([]); }
      finally  { setBranchLoad(false); }
    })();
  }, []);

  /* live validation */
  const validate = (data = form) => {
    const errs = {};
    Object.entries(RULES).forEach(([k, fn]) => { const e = fn(data[k] || ""); if (e) errs[k] = e; });
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setSubmitErr("");
    if (touched[name]) setErrors((p) => ({ ...p, [name]: RULES[name]?.(value) || "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: RULES[name]?.(value) || "" }));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = { ...form };
    if (!payload.preferredBranch) delete payload.preferredBranch;
    if (!payload.gender)          delete payload.gender;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/customers`, payload, { headers });
      await fetchCustomers();
      setVisible(false);
      setTimeout(() => { onSuccess?.("Customer created successfully"); onClose(); }, 300);
    } catch (err) {
      setSubmitErr(err.response?.data?.message || "Failed to create customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* helper: field state */
  const fs = (name) => ({
    err: !!(touched[name] && errors[name]),
    ok:  !!(touched[name] && !errors[name] && form[name]?.trim()),
  });

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="cam-backdrop"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* ── Drawer ── */}
      <div
        className="cam-drawer"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* ══ HEADER ══ */}
        <div className="cam-header">
          <h3 className="cam-header-title">
            👤 Add New Customer
          </h3>
          <button onClick={handleClose} className="cam-header-close" title="Close">✕</button>
        </div>

        {/* ══ FORM BODY ══ */}
        <form onSubmit={handleSubmit} className="cam-body" noValidate>

          {/* ── Personal Information ── */}
          <p className="cam-section-label">Personal Information</p>

          {/* First + Last name */}
          <div className="cam-grid-2">
            <div className="cam-field">
              <label className="cam-label" htmlFor="firstName">FIRST NAME</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Hiruna"
                autoFocus
                autoComplete="given-name"
                className={`cam-input ${fs("firstName").err ? "cam-input--err" : ""} ${fs("firstName").ok ? "cam-input--ok" : ""}`}
              />
              {fs("firstName").err && <span className="cam-err-txt">⚠ {errors.firstName}</span>}
            </div>

            <div className="cam-field">
              <label className="cam-label" htmlFor="lastName">LAST NAME</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Perera"
                autoComplete="family-name"
                className={`cam-input ${fs("lastName").err ? "cam-input--err" : ""} ${fs("lastName").ok ? "cam-input--ok" : ""}`}
              />
              {fs("lastName").err && <span className="cam-err-txt">⚠ {errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="cam-field">
            <label className="cam-label" htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. hiruna@email.com"
              autoComplete="email"
              className={`cam-input ${fs("email").err ? "cam-input--err" : ""} ${fs("email").ok ? "cam-input--ok" : ""}`}
            />
            {fs("email").err && <span className="cam-err-txt">⚠ {errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="cam-field">
            <label className="cam-label" htmlFor="phone">PHONE NUMBER</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+94 77 123 4567"
              autoComplete="tel"
              className={`cam-input ${fs("phone").err ? "cam-input--err" : ""} ${fs("phone").ok ? "cam-input--ok" : ""}`}
            />
            {fs("phone").err && <span className="cam-err-txt">⚠ {errors.phone}</span>}
          </div>

          {/* Gender + Status */}
          <div className="cam-grid-2">
            <div className="cam-field">
              <label className="cam-label" htmlFor="gender">GENDER</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="cam-input cam-select"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="cam-field">
              <label className="cam-label" htmlFor="status">ACCOUNT STATUS</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="cam-input cam-select"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/*  Branch Assignment  */}
          <p className="cam-section-label" style={{ marginTop: "4px" }}>Branch Assignment</p>

          <div className="cam-field">
            <label className="cam-label" htmlFor="preferredBranch">PREFERRED BRANCH</label>
            {branchLoad ? (
              <div className="cam-input cam-branch-loading">
                <span className="cam-spin" /> Loading branches…
              </div>
            ) : (
              <select
                id="preferredBranch"
                name="preferredBranch"
                value={form.preferredBranch}
                onChange={handleChange}
                className="cam-input cam-select"
              >
                <option value="">No preferred branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}{b.city ? ` — ${b.city}` : ""}{b.code ? ` (${b.code})` : ""}
                  </option>
                ))}
              </select>
            )}
            {!branchLoad && branches.length === 0 && (
              <span className="cam-hint-txt">No branches found — field will be skipped on submit.</span>
            )}
          </div>

          {/*  API error  */}
          {submitErr && (
            <div className="cam-api-err">
              ⚠ {submitErr}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="cam-footer">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="cam-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cam-btn-submit"
            >
              {loading ? (
                <><span className="cam-spin cam-spin--white" /> Creating…</>
              ) : (
                "Add Customer"
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        /* ── Backdrop ── */
        .cam-backdrop {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(4px);
          transition: opacity 0.30s ease;
          cursor: pointer;
        }

        /* ── Drawer ── */
        .cam-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(24px);
          border-left: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: -12px 0 50px rgba(0, 0, 0, 0.14);
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }

        /* ── Header ── */
        .cam-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(248, 250, 252, 0.7);
          flex-shrink: 0;
        }
        .cam-header-title {
          font-size: 0.97rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .cam-header-close {
          color: #94a3b8;
          font-size: 1.1rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1;
          transition: color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .cam-header-close:hover { color: #64748b; background: rgba(0,0,0,0.05); }

        /* ── Body / Form ── */
        .cam-body {
          flex: 1;
          overflow-y: auto;
          padding: 22px 24px 8px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .cam-body::-webkit-scrollbar { width: 4px; }
        .cam-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* ── Section label ── */
        .cam-section-label {
          margin: 2px 0 -2px;
          font-size: 0.67rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #94a3b8;
        }

        /* ── Two-col grid ── */
        .cam-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* ── Field ── */
        .cam-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        /* ── Label ── */
        .cam-label {
          display: block;
          font-size: 0.67rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Input / Select base ── */
        .cam-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.75);
          padding: 10px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          font-family: inherit;
          box-sizing: border-box;
        }
        .cam-input::placeholder { color: #c8d3df; font-weight: 500; }
        .cam-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        /* error state */
        .cam-input--err {
          border-color: #f87171 !important;
          background: #fff5f5 !important;
        }
        .cam-input--err:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.10) !important;
          background: #ffffff !important;
        }

        /* ok / valid state */
        .cam-input--ok {
          border-color: #86efac !important;
          background: #f0fdf4 !important;
        }
        .cam-input--ok:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.10) !important;
        }

        /* select */
        .cam-select { appearance: none; cursor: pointer; }

        /* ── Inline error text ── */
        .cam-err-txt {
          font-size: 0.70rem;
          font-weight: 700;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 3px;
          animation: camErrIn 0.18s ease both;
        }
        @keyframes camErrIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Hint text ── */
        .cam-hint-txt {
          font-size: 0.70rem;
          font-weight: 600;
          color: #d97706;
        }

        /* ── Branch loading placeholder ── */
        .cam-branch-loading {
          display: flex !important;
          align-items: center;
          gap: 8px;
          color: #94a3b8 !important;
          font-style: italic;
          font-weight: 500 !important;
          cursor: default;
        }

        /* ── API error banner ── */
        .cam-api-err {
          padding: 11px 14px;
          border-radius: 10px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1.45;
          animation: camShake 0.32s ease;
        }
        @keyframes camShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        /* ── Spinners ── */
        .cam-spin {
          display: inline-block;
          width: 12px; height: 12px;
          border: 2px solid rgba(37, 99, 235, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: camSpin 0.65s linear infinite;
          flex-shrink: 0;
          vertical-align: middle;
        }
        .cam-spin--white {
          border-color: rgba(255,255,255,0.25);
          border-top-color: #ffffff;
          margin-right: 6px;
        }
        @keyframes camSpin { to { transform: rotate(360deg); } }

        /* ── Footer ── */
        .cam-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 16px 24px 20px;
          border-top: 1px solid rgba(0,0,0,0.06);
          background: rgba(248, 250, 252, 0.7);
          flex-shrink: 0;
          margin-top: 6px;
        }
        .cam-btn-cancel {
          flex: 1;
          padding: 11px 0;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .cam-btn-cancel:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .cam-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }

        .cam-btn-submit {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 0;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
          font-family: inherit;
          white-space: nowrap;
        }
        .cam-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.38);
        }
        .cam-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .cam-btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .cam-drawer  { max-width: 100vw; }
          .cam-grid-2  { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}