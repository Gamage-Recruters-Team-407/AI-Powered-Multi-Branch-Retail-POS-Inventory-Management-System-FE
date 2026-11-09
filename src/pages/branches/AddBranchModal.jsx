import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useBranches } from "../../context/BranchContext";

export default function AddBranchModal({ onClose, onSuccess }) {
  const { addBranch, loading } = useBranches();

  const [formData, setFormData] = useState({
    name: "", code: "", city: "",
    contactNumber: "", address: "",
    manager: "", isActive: true,
  });
  const [managers, setManagers] = useState([]);
  const [managerLoad, setManagerLoad] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/users/managers");
        setManagers(res.data.data || []);
      } catch { setManagers([]); }
      finally { setManagerLoad(false); }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setError("Branch name and code are required");
      return;
    }
    try {
      await addBranch(formData);
      setVisible(false);
      setTimeout(() => { onSuccess?.("Branch created successfully"); onClose(); }, 300);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create branch");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="bam-backdrop" style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />

      {/* Drawer */}
      <div className="bam-drawer" style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}>

        {/* Header */}
        <div className="bam-header">
          <h3 className="bam-header-title">🏪 Add New Branch</h3>
          <button onClick={handleClose} className="bam-header-close">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bam-body" noValidate>

          <p className="bam-section-label">Branch Information</p>

          {/* Name */}
          <div className="bam-field">
            <label className="bam-label">BRANCH NAME *</label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleChange} autoFocus
              placeholder="e.g. Downtown Store"
              className="bam-input"
            />
          </div>

          {/* Code */}
          <div className="bam-field">
            <label className="bam-label">BRANCH CODE *</label>
            <input
              type="text" name="code" value={formData.code}
              onChange={handleChange}
              placeholder="e.g. DT-001"
              className="bam-input"
            />
          </div>

          {/* City + Contact */}
          <div className="bam-grid-2">
            <div className="bam-field">
              <label className="bam-label">CITY</label>
              <input
                type="text" name="city" value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Colombo"
                className="bam-input"
              />
            </div>
            <div className="bam-field">
              <label className="bam-label">CONTACT NUMBER</label>
              <input
                type="tel" name="contactNumber" value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 0771234567"
                className="bam-input"
              />
            </div>
          </div>

          {/* Address */}
          <div className="bam-field">
            <label className="bam-label">ADDRESS</label>
            <textarea
              name="address" value={formData.address}
              onChange={handleChange} rows="3"
              placeholder="Full address"
              className="bam-input bam-textarea"
            />
          </div>

          <p className="bam-section-label" style={{ marginTop: "4px" }}>Assignment & Status</p>

          {/* Manager */}
          <div className="bam-field">
            <label className="bam-label">MANAGER</label>
            {managerLoad ? (
              <div className="bam-input bam-loading">
                <span className="bam-spin" /> Loading managers…
              </div>
            ) : (
              <select name="manager" value={formData.manager} onChange={handleChange} className="bam-input bam-select">
                <option value="">Select Manager</option>
                {managers.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Active */}
          <div className="bam-checkbox-row">
            <input
              type="checkbox" id="isActive" name="isActive"
              checked={formData.isActive} onChange={handleChange}
              className="bam-checkbox"
            />
            <label htmlFor="isActive" className="bam-checkbox-label">Active Branch</label>
          </div>

          {/* Error */}
          {error && <div className="bam-api-err">⚠ {error}</div>}

          {/* Footer */}
          <div className="bam-footer">
            <button type="button" onClick={handleClose} disabled={loading} className="bam-btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bam-btn-submit">
              {loading ? <><span className="bam-spin bam-spin--white" /> Creating…</> : "Add Branch"}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .bam-backdrop {
          position: fixed; inset: 0; z-index: 49;
          background: rgba(15,23,42,0.42);
          backdrop-filter: blur(4px);
          transition: opacity 0.30s ease; cursor: pointer;
        }
        .bam-drawer {
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
        .bam-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          background: rgba(248,250,252,0.7); flex-shrink: 0;
        }
        .bam-header-title { font-size: 0.97rem; font-weight: 800; color: #0f172a; margin: 0; }
        .bam-header-close {
          color: #94a3b8; font-size: 1.1rem; background: none; border: none;
          cursor: pointer; padding: 4px 8px; border-radius: 6px;
          transition: color 0.15s, background 0.15s; font-family: inherit;
        }
        .bam-header-close:hover { color: #64748b; background: rgba(0,0,0,0.05); }
        .bam-body {
          flex: 1; overflow-y: auto; padding: 22px 24px 8px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
        }
        .bam-section-label {
          margin: 2px 0 -2px; font-size: 0.67rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8;
        }
        .bam-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .bam-field { display: flex; flex-direction: column; gap: 5px; }
        .bam-label {
          font-size: 0.67rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .bam-input {
          width: 100%; border-radius: 12px; border: 1.5px solid #e2e8f0;
          background: rgba(255,255,255,0.75); padding: 10px 14px;
          font-size: 0.82rem; font-weight: 600; color: #0f172a;
          outline: none; transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit; box-sizing: border-box;
        }
        .bam-input::placeholder { color: #c8d3df; font-weight: 500; }
        .bam-input:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .bam-textarea { resize: vertical; min-height: 80px; }
        .bam-select { appearance: none; cursor: pointer; }
        .bam-loading {
          display: flex !important; align-items: center; gap: 8px;
          color: #94a3b8 !important; font-style: italic;
          font-weight: 500 !important; cursor: default;
        }
        .bam-checkbox-row { display: flex; align-items: center; gap: 10px; }
        .bam-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #3b82f6; }
        .bam-checkbox-label { font-size: 0.82rem; font-weight: 600; color: #0f172a; cursor: pointer; }
        .bam-api-err {
          padding: 11px 14px; border-radius: 10px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.78rem; font-weight: 700;
        }
        .bam-footer {
          display: flex; gap: 10px; justify-content: flex-end;
          padding: 16px 24px 20px;
          border-top: 1px solid rgba(0,0,0,0.06);
          background: rgba(248,250,252,0.7);
          flex-shrink: 0; margin-top: 6px;
        }
        .bam-btn-cancel {
          flex: 1; padding: 11px 0; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s ease; font-family: inherit;
        }
        .bam-btn-cancel:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .bam-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
        .bam-btn-submit {
          flex: 1; display: inline-flex; align-items: center;
          justify-content: center; gap: 6px;
          padding: 11px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg,#2563eb,#1d4ed8);
          color: #fff; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
          font-family: inherit;
        }
        .bam-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .bam-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .bam-spin {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(37,99,235,0.2); border-top-color: #3b82f6;
          border-radius: 50%; animation: bamSpin 0.65s linear infinite;
          flex-shrink: 0; vertical-align: middle;
        }
        .bam-spin--white { border-color: rgba(255,255,255,0.25); border-top-color: #fff; margin-right: 6px; }
        @keyframes bamSpin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .bam-drawer { max-width: 100vw; }
          .bam-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}