import React, { useState } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'full_audit', label: 'Full Audit Trail', icon: '📋', desc: 'Complete log of all system activities' },
  { id: 'security_summary', label: 'Security Summary', icon: '🛡️', desc: 'Security events and threat analysis' },
  { id: 'login_report', label: 'Login History Report', icon: '🔐', desc: 'User authentication and session data' },
  { id: 'data_access', label: 'Data Access Report', icon: '👁️', desc: 'Who accessed what data and when' },
  { id: 'admin_activity', label: 'Admin Activity Report', icon: '👤', desc: 'Administrative actions and changes' },
  { id: 'compliance', label: 'Compliance Report', icon: '✅', desc: 'Regulatory compliance audit export' },
];

const FORMAT_OPTIONS = [
  { id: 'pdf', label: 'PDF', icon: '📄', mime: 'application/pdf', extension: 'pdf' },
  { id: 'csv', label: 'CSV', icon: '📊', mime: 'text/csv', extension: 'csv' },
  { id: 'excel', label: 'Excel', icon: '📗', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' },
  { id: 'json', label: 'JSON', icon: '🔧', mime: 'application/json', extension: 'json' },
];

const SecurityReportGenerator = ({ onGenerate, reportHistory, loading }) => {
  const [selectedType, setSelectedType] = useState('compliance');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);
  const [includeOptions, setIncludeOptions] = useState({
    loginHistory: true,
    securityEvents: true,
    dataAccess: true,
    userActivity: true,
  });

  const downloadReport = async (format) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('format', format);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('type', selectedType);
      
      const response = await fetch(`http://localhost:5000/api/audit/reports/download?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get file extension and mime type
      const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
      const extension = formatOption?.extension || format;
      const mimeType = formatOption?.mime || 'application/octet-stream';
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().slice(0, 19)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
      
      if (onGenerate) {
        onGenerate({ type: selectedType, format, ...dateRange, includeOptions });
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    await downloadReport(selectedFormat);
  };

  const toggleOption = (key) => {
    setIncludeOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="srg-wrap">
      <div className="srg-layout">
        {/* Left: Config */}
        <div className="srg-config">
          <h4 className="srg-section-title">Report Type</h4>
          <div className="report-type-grid">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.id}
                className={`report-type-btn ${selectedType === rt.id ? 'active' : ''}`}
                onClick={() => setSelectedType(rt.id)}
              >
                <span className="rt-icon">{rt.icon}</span>
                <div className="rt-text">
                  <div className="rt-label">{rt.label}</div>
                  <div className="rt-desc">{rt.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <h4 className="srg-section-title" style={{ marginTop: 20 }}>Date Range</h4>
          <div className="date-range-row">
            <div className="date-field">
              <label className="date-label">From</label>
              <input
                type="date"
                className="date-input"
                value={dateRange.start}
                onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
              />
            </div>
            <div className="date-field">
              <label className="date-label">To</label>
              <input
                type="date"
                className="date-input"
                value={dateRange.end}
                onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
              />
            </div>
          </div>

          <h4 className="srg-section-title" style={{ marginTop: 20 }}>Include Sections</h4>
          <div className="options-list">
            {[
              { key: 'loginHistory', label: 'Login History' },
              { key: 'securityEvents', label: 'Security Events' },
              { key: 'dataAccess', label: 'Data Access Logs' },
              { key: 'userActivity', label: 'User Activity Summary' },
            ].map(opt => (
              <label key={opt.key} className="option-toggle">
                <input
                  type="checkbox"
                  checked={includeOptions[opt.key]}
                  onChange={() => toggleOption(opt.key)}
                />
                <span className="toggle-label">{opt.label}</span>
              </label>
            ))}
          </div>

          <h4 className="srg-section-title" style={{ marginTop: 20 }}>Export Format</h4>
          <div className="format-row">
            {FORMAT_OPTIONS.map(f => (
              <button
                key={f.id}
                className={`format-btn ${selectedFormat === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFormat(f.id)}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={generating || loading}
          >
            {generating ? (
              <><span className="btn-spinner" /> Generating...</>
            ) : (
              <><span>📄</span> Generate Report</>
            )}
          </button>
        </div>

        {/* Right: History */}
        <div className="srg-history">
          <ReportHistory reports={reportHistory} onDownload={downloadReport} />
        </div>
      </div>

      <style>{`
        .srg-wrap { display: flex; flex-direction: column; gap: 0; }
        .srg-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
        }
        @media (max-width: 900px) { .srg-layout { grid-template-columns: 1fr; } }
        .srg-config { display: flex; flex-direction: column; gap: 0; }
        .srg-section-title { font-size: .75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
        .report-type-grid { display: flex; flex-direction: column; gap: 6px; }
        .report-type-btn {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          background: white; text-align: left;
          transition: all .15s; cursor: pointer;
        }
        .report-type-btn:hover { border-color: #93c5fd; background: #f8fafc; }
        .report-type-btn.active { border-color: #3b82f6; background: #eff6ff; }
        .rt-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
        .rt-label { font-size: .85rem; font-weight: 600; color: #0f172a; }
        .rt-desc { font-size: .74rem; color: #94a3b8; margin-top: 1px; }
        .date-range-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .date-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
        .date-label { font-size: .72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
        .date-input {
          padding: 8px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: .83rem; color: #0f172a; background: #f8fafc;
          outline: none; transition: border-color .15s;
        }
        .date-input:focus { border-color: #3b82f6; background: white; }
        .options-list { display: flex; flex-direction: column; gap: 8px; }
        .option-toggle { display: flex; align-items: center; gap: 9px; cursor: pointer; }
        .option-toggle input[type=checkbox] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
        .toggle-label { font-size: .85rem; color: #374151; font-weight: 500; }
        .format-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .format-btn {
          padding: 8px 16px;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: .82rem; font-weight: 600; color: #475569;
          background: white; display: flex; align-items: center; gap: 5px;
          transition: all .15s; cursor: pointer;
        }
        .format-btn:hover { border-color: #cbd5e1; }
        .format-btn.active { border-color: #3b82f6; background: #eff6ff; color: #2563eb; }
        .generate-btn {
          margin-top: 24px;
          padding: 12px 24px;
          background: #1e3a5f; color: white;
          border-radius: 10px;
          font-size: .9rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s;
          align-self: flex-start;
          border: none;
          cursor: pointer;
        }
        .generate-btn:hover:not(:disabled) { background: #2563eb; }
        .generate-btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ReportHistory Component
const ReportHistory = ({ reports, onDownload }) => {
  const mockReports = reports?.length ? reports : [];
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (mockReports.length === 0) {
    return (
      <div className="rh-empty">
        <p>No previous reports</p>
        <style>{`
          .rh-empty { text-align: center; padding: 40px; color: #94a3b8; background: #f8fafc; border-radius: 12px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rh-wrap">
      <h4 className="rh-title">Recent Reports</h4>
      <div className="rh-list">
        {mockReports.map(r => (
          <div key={r._id} className="rh-item">
            <span className="rh-icon">📄</span>
            <div className="rh-meta">
              <div className="rh-name">{r.type || 'Audit Report'}</div>
              <div className="rh-sub">{formatDate(r.createdAt)} · {r.generatedBy || 'System'}</div>
            </div>
            <span className="rh-format">{r.format?.toUpperCase() || 'PDF'}</span>
            <button className="rh-download" onClick={() => onDownload?.(r.format || 'pdf')}>↓ Download</button>
          </div>
        ))}
      </div>
      <style>{`
        .rh-wrap { display: flex; flex-direction: column; gap: 10px; }
        .rh-title { font-size: .85rem; font-weight: 700; color: #374151; margin: 0; }
        .rh-list { display: flex; flex-direction: column; gap: 6px; }
        .rh-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9px;
        }
        .rh-icon { font-size: 1.1rem; }
        .rh-meta { flex: 1; }
        .rh-name { font-size: .83rem; font-weight: 600; color: #1e293b; }
        .rh-sub { font-size: .73rem; color: #94a3b8; }
        .rh-format { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: #e2e8f0; color: #475569; }
        .rh-download { padding: 5px 12px; border: 1px solid #e2e8f0; border-radius: 7px; font-size: .75rem; font-weight: 600; color: #3b82f6; background: white; cursor: pointer; }
        .rh-download:hover { background: #eff6ff; }
      `}</style>
    </div>
  );
};

export default SecurityReportGenerator;