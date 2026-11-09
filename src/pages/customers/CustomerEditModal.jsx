import { useState, useEffect } from "react";
import { useCustomers } from "../../context/CustomerContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RULES = {
  firstName: (v) => !v.trim() ? "First name is required" : v.trim().length < 2 ? "Minimum 2 characters" : "",
  lastName:  (v) => !v.trim() ? "Last name is required"  : v.trim().length < 2 ? "Minimum 2 characters" : "",
  email:     (v) => !v.trim() ? "Email address is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "",
  phone:     (v) => !v.trim() ? "Phone number is required" : !/^\+?[\d\s\-]{7,15}$/.test(v) ? "Enter a valid phone number (7–15 digits)" : "",
};

export default function CustomerEditModal({ customer, onClose, onSuccess }) {
  const { fetchCustomers } = useCustomers();

  const [form, setForm]     = useState({
    firstName:       customer.firstName       || "",
    lastName:        customer.lastName        || "",
    email:           customer.email           || "",
    phone:           customer.phone           || "",
    gender:          customer.gender          || "",
    status:          customer.status          || "ACTIVE",
    preferredBranch: customer.preferredBranch?._id || customer.preferredBranch || "",
  });

  const [branches, setBranches]   = useState([]);
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [loading, setLoading]     = useState(false);
  const [branchLoad, setBranchLoad] = useState(true);
  const [submitErr, setSubmitErr] = useState("");
  const [visible, setVisible]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

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
      await axios.put(`${API}/customers/${customer._id}`, payload, { headers });
      await fetchCustomers();
      setVisible(false);
      setTimeout(() => { onSuccess?.("Customer updated successfully"); onClose(); }, 300);
    } catch (err) {
      setSubmitErr(err.response?.data?.message || "Failed to update customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fs = (name) => ({
    err: !!(touched[name] && errors[name]),
    ok:  !!(touched[name] && !errors[name] && form[name]?.trim()),
  });

  const initials = `${(customer.firstName || "?")[0]}${(customer.lastName || "?")[0]}`.toUpperCase();

  return (
    <>
      <div className="cem-backdrop" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />

      <div className="cem-drawer" style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}>

        {/* ══ HEADER ══ */}
        <div className="cem-header">
          <div className="cem-header-left">
            <div className="cem-avatar">{initials}</div>
            <div>
              <h3 className="cem-header-title">Edit Customer</h3>
              <p className="cem-header-sub">{customer.firstName} {customer.lastName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="cem-header-close" title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/*  FORM BODY  */}
        <form onSubmit={handleSubmit} className="cem-body" noValidate>

          <p className="cem-section-label">Personal Information</p>

          <div className="cem-grid-2">
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-firstName">FIRST NAME</label>
              <input
                id="cem-firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Hiruna"
                autoComplete="given-name"
                className={`cem-input ${fs("firstName").err ? "cem-input--err" : ""} ${fs("firstName").ok ? "cem-input--ok" : ""}`}
              />
              {fs("firstName").err && <span className="cem-err-txt">⚠ {errors.firstName}</span>}
            </div>

            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-lastName">LAST NAME</label>
              <input
                id="cem-lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Perera"
                autoComplete="family-name"
                className={`cem-input ${fs("lastName").err ? "cem-input--err" : ""} ${fs("lastName").ok ? "cem-input--ok" : ""}`}
              />
              {fs("lastName").err && <span className="cem-err-txt">⚠ {errors.lastName}</span>}
            </div>
          </div>

          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-email">EMAIL ADDRESS</label>
            <input
              id="cem-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. hiruna@email.com"
              autoComplete="email"
              className={`cem-input ${fs("email").err ? "cem-input--err" : ""} ${fs("email").ok ? "cem-input--ok" : ""}`}
            />
            {fs("email").err && <span className="cem-err-txt">⚠ {errors.email}</span>}
          </div>

          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-phone">PHONE NUMBER</label>
            <input
              id="cem-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+94 77 123 4567"
              autoComplete="tel"
              className={`cem-input ${fs("phone").err ? "cem-input--err" : ""} ${fs("phone").ok ? "cem-input--ok" : ""}`}
            />
            {fs("phone").err && <span className="cem-err-txt">⚠ {errors.phone}</span>}
          </div>

          <div className="cem-grid-2">
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-gender">GENDER</label>
              <select id="cem-gender" name="gender" value={form.gender} onChange={handleChange} className="cem-input cem-select">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-status">ACCOUNT STATUS</label>
              <select id="cem-status" name="status" value={form.status} onChange={handleChange} className="cem-input cem-select">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <p className="cem-section-label" style={{ marginTop: "4px" }}>Branch Assignment</p>

          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-branch">PREFERRED BRANCH</label>
            {branchLoad ? (
              <div className="cem-input cem-branch-loading">
                <span className="cem-spin" /> Loading branches…
              </div>
            ) : (
              <select id="cem-branch" name="preferredBranch" value={form.preferredBranch} onChange={handleChange} className="cem-input cem-select">
                <option value="">No preferred branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}{b.city ? ` — ${b.city}` : ""}{b.code ? ` (${b.code})` : ""}
                  </option>
                ))}
              </select>
            )}
            {!branchLoad && branches.length === 0 && (
              <span className="cem-hint-txt">No branches found — field will be skipped.</span>
            )}
          </div>

          {submitErr && <div className="cem-api-err">⚠ {submitErr}</div>}

          <div className="cem-footer">
            <button type="button" onClick={handleClose} disabled={loading} className="cem-btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="cem-btn-submit">
              {loading ? (
                <><span className="cem-spin cem-spin--white" /> Saving…</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .cem-backdrop {
          position: fixed; inset: 0; z-index: 49;
          background: rgba(15,23,42,0.42);
          backdrop-filter: blur(4px);
          transition: opacity 0.30s ease;
          cursor: pointer;
        }
        .cem-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 50;
          width: 100%; max-width: 440px;
          display: flex; flex-direction: column;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(24px);
          border-left: 1px solid rgba(255,255,255,0.25);
          box-shadow: -12px 0 50px rgba(0,0,0,0.14);
          transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }

        /* Header */
        .cem-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          background: rgba(248,250,252,0.7);
          flex-shrink: 0;
        }
        .cem-header-left { display: flex; align-items: center; gap: 12px; }
        .cem-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg,#059669,#047857);
          color: #fff; font-size: 0.9rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; letter-spacing: -0.02em;
          box-shadow: 0 4px 12px rgba(5,150,105,0.25);
        }
        .cem-header-title { font-size: 0.97rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em; }
        .cem-header-sub   { font-size: 0.75rem; font-weight: 600; color: #64748b; margin: 2px 0 0; }
        .cem-header-close {
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.07);
          background: rgba(255,255,255,0.7); color: #64748b;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.18s ease;
        }
        .cem-header-close:hover { background: #fff; color: #ef4444; border-color: rgba(220,38,38,0.2); }

        /* Body */
        .cem-body {
          flex: 1; overflow-y: auto;
          padding: 22px 24px 8px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
        }
        .cem-body::-webkit-scrollbar { width: 4px; }
        .cem-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        .cem-section-label {
          margin: 2px 0 -2px; font-size: 0.67rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8;
        }
        .cem-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cem-field  { display: flex; flex-direction: column; gap: 5px; }
        .cem-label  {
          display: block; font-size: 0.67rem; font-weight: 800;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .cem-input {
          width: 100%; border-radius: 12px; border: 1.5px solid #e2e8f0;
          background: rgba(255,255,255,0.75); padding: 10px 14px;
          font-size: 0.82rem; font-weight: 600; color: #0f172a;
          outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          font-family: inherit; box-sizing: border-box;
        }
        .cem-input::placeholder { color: #c8d3df; font-weight: 500; }
        .cem-input:focus {
          border-color: #059669; background: #ffffff;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
        }
        .cem-input--err { border-color: #f87171 !important; background: #fff5f5 !important; }
        .cem-input--err:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; background: #ffffff !important; }
        .cem-input--ok  { border-color: #86efac !important; background: #f0fdf4 !important; }
        .cem-input--ok:focus  { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.10) !important; }
        .cem-select { appearance: none; cursor: pointer; }

        .cem-err-txt {
          font-size: 0.70rem; font-weight: 700; color: #ef4444;
          display: flex; align-items: center; gap: 3px;
          animation: cemErrIn 0.18s ease both;
        }
        @keyframes cemErrIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .cem-hint-txt { font-size: 0.70rem; font-weight: 600; color: #d97706; }
        .cem-branch-loading {
          display: flex !important; align-items: center; gap: 8px;
          color: #94a3b8 !important; font-style: italic; font-weight: 500 !important; cursor: default;
        }
        .cem-api-err {
          padding: 11px 14px; border-radius: 10px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.78rem; font-weight: 700; line-height: 1.45;
          animation: cemShake 0.32s ease;
        }
        @keyframes cemShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

        /* Spinners */
        .cem-spin {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(5,150,105,0.2); border-top-color: #059669;
          border-radius: 50%; animation: cemSpin 0.65s linear infinite;
          flex-shrink: 0; vertical-align: middle;
        }
        .cem-spin--white { border-color: rgba(255,255,255,0.25); border-top-color: #fff; margin-right: 6px; }
        @keyframes cemSpin { to { transform: rotate(360deg); } }

        /* Footer */
        .cem-footer {
          display: flex; gap: 10px; justify-content: flex-end;
          padding: 16px 24px 20px;
          border-top: 1px solid rgba(0,0,0,0.06);
          background: rgba(248,250,252,0.7);
          flex-shrink: 0; margin-top: 6px;
        }
        .cem-btn-cancel {
          flex: 1; padding: 11px 0; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #ffffff;
          color: #64748b; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s ease; font-family: inherit;
        }
        .cem-btn-cancel:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .cem-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
        .cem-btn-submit {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; padding: 11px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg,#059669,#047857);
          color: #fff; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(5,150,105,0.28);
          font-family: inherit; white-space: nowrap;
        }
        .cem-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(5,150,105,0.38); }
        .cem-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .cem-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        @media (max-width: 480px) {
          .cem-drawer { max-width: 100vw; }
          .cem-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}