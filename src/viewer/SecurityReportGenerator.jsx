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

// ✅ Mock Report Data for Demo
const MOCK_REPORT_DATA = [
  { _id: '1', type: 'Full Audit Trail', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), generatedBy: 'Admin User', format: 'pdf' },
  { _id: '2', type: 'Security Summary', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), generatedBy: 'System', format: 'excel' },
  { _id: '3', type: 'Login History Report', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), generatedBy: 'Admin User', format: 'csv' },
  { _id: '4', type: 'Compliance Report', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), generatedBy: 'System', format: 'pdf' },
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

  // ✅ Generate Sample Data for Export
  const generateSampleData = () => {
    const now = new Date();
    return Array.from({ length: 25 }, (_, i) => ({
      _id: `log_${i + 1}`,
      createdAt: new Date(now - i * 3600000 * 0.5).toISOString(),
      userName: ['Admin Test', 'John Manager', 'Sarah Cashier', 'Mike Admin', 'Priya Staff', 'Shavindi Aloka', 'Cashier Test'][i % 7],
      userEmail: ['admin@test.com', 'john@retailpos.com', 'sarah@retailpos.com', 'mike@retailpos.com', 'priya@retailpos.com', 'shavindi@gmail.com', 'cashier@test.com'][i % 7],
      action: ['LOGIN', 'UPDATE', 'CREATE', 'DELETE', 'EXPORT', 'LOGIN', 'UPDATE'][i % 7],
      module: ['AUTH', 'EMPLOYEE', 'PRODUCT', 'INVENTORY', 'REPORT', 'SALES', 'USER_MANAGEMENT'][i % 7],
      severity: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INFO', 'MEDIUM'][i % 7],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      branchName: ['Main HQ', 'Kandy Branch', 'Galle Branch', 'Negombo Branch', 'Main HQ'][i % 5],
      status: ['SUCCESS', 'SUCCESS', 'FAILURE', 'SUCCESS', 'SUCCESS', 'BLOCKED', 'SUCCESS'][i % 7],
      description: `User performed ${['login', 'update', 'create', 'delete', 'export', 'login', 'update'][i % 7]} operation`,
    }));
  };

  const sampleData = generateSampleData();

  // ✅ Export as CSV
  const exportAsCSV = (data) => {
    const headers = ['#', 'Timestamp', 'User', 'Email', 'Action', 'Module', 'Severity', 'IP Address', 'Branch', 'Status'];
    const rows = data.map((log, index) => [
      index + 1,
      new Date(log.createdAt).toLocaleString(),
      log.userName || 'Unknown',
      log.userEmail || '—',
      log.action || '—',
      log.module || '—',
      log.severity || 'INFO',
      log.ipAddress || '—',
      log.branchName || 'Main Branch',
      log.status || 'SUCCESS'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded successfully!');
  };

  // ✅ Export as JSON
  const exportAsJSON = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('JSON report downloaded successfully!');
  };

  // ✅ Export as Excel (CSV format with .xlsx extension - for demo)
  const exportAsExcel = (data) => {
    // Create HTML table for Excel
    const headers = ['#', 'Timestamp', 'User', 'Email', 'Action', 'Module', 'Severity', 'IP Address', 'Branch', 'Status'];
    
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Audit Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          th { background-color: #1e3a5f; color: white; font-weight: bold; padding: 8px; border: 1px solid #333; }
          td { padding: 6px 8px; border: 1px solid #ccc; }
          .severity-LOW { color: #16a34a; }
          .severity-MEDIUM { color: #d97706; }
          .severity-HIGH { color: #ea580c; }
          .severity-CRITICAL { color: #dc2626; }
          .status-SUCCESS { color: #16a34a; }
          .status-FAILURE { color: #dc2626; }
          .status-BLOCKED { color: #d97706; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h2 style="color: #1e3a5f;">📋 Audit Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${data.length}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((log, index) => {
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${new Date(log.createdAt).toLocaleString()}</td>
          <td>${log.userName || 'Unknown'}</td>
          <td>${log.userEmail || '—'}</td>
          <td><strong>${log.action || '—'}</strong></td>
          <td>${log.module || '—'}</td>
          <td class="severity-${log.severity || 'INFO'}">${log.severity || 'INFO'}</td>
          <td>${log.ipAddress || '—'}</td>
          <td>${log.branchName || 'Main Branch'}</td>
          <td class="status-${log.status || 'SUCCESS'}">${log.status || 'SUCCESS'}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #94a3b8; text-align: center;">
          Retail POS System - Audit Report
        </p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.ms-excel' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${new Date().toISOString().slice(0, 19)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Excel report downloaded successfully!');
  };

  // ✅ Export as PDF (Print dialog)
  const exportAsPDF = (data) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Audit Report</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 30px; 
              color: #1e293b; 
              background: #ffffff;
              max-width: 1200px;
              margin: 0 auto;
            }
            .report-header {
              text-align: center;
              border-bottom: 3px solid #1e3a5f;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .report-header h1 { 
              font-size: 24px; 
              color: #1e3a5f; 
              margin: 0 0 5px 0;
            }
            .report-header .subtitle { 
              color: #64748b; 
              font-size: 14px; 
              margin: 0;
            }
            .report-meta { 
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 10px;
              background: #f8fafc;
              padding: 12px 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              font-size: 13px;
              border: 1px solid #e2e8f0;
            }
            .report-meta .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .report-meta .meta-label {
              font-weight: 600;
              color: #475569;
            }
            .report-meta .meta-value {
              color: #0f172a;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 11px;
              margin-top: 15px;
            }
            th { 
              background: #1e3a5f; 
              color: white; 
              padding: 10px 12px; 
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            td { 
              padding: 8px 12px; 
              border-bottom: 1px solid #e2e8f0;
              vertical-align: middle;
            }
            tr:nth-child(even) { background: #f8fafc; }
            tr:hover { background: #f1f5f9; }
            .severity-LOW { color: #16a34a; font-weight: 600; }
            .severity-MEDIUM { color: #d97706; font-weight: 600; }
            .severity-HIGH { color: #ea580c; font-weight: 600; }
            .severity-CRITICAL { color: #dc2626; font-weight: 600; }
            .badge {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              display: inline-block;
            }
            .badge-SUCCESS { background: #dcfce7; color: #16a34a; }
            .badge-FAILURE { background: #fee2e2; color: #dc2626; }
            .badge-BLOCKED { background: #fef3c7; color: #d97706; }
            .report-footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #94a3b8;
            }
            .report-footer .footer-brand {
              font-weight: 600;
              color: #1e3a5f;
            }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
              th { background: #1e3a5f !important; color: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>📋 Audit Report</h1>
            <p class="subtitle">Retail POS System - Security Audit Trail</p>
          </div>
          
          <div class="report-meta">
            <div class="meta-item">
              <span class="meta-label">📅 Generated:</span>
              <span class="meta-value">${new Date().toLocaleString()}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">📊 Total Records:</span>
              <span class="meta-value">${data.length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">📂 Type:</span>
              <span class="meta-value">${REPORT_TYPES.find(t => t.id === selectedType)?.label || 'Full Audit'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                <th style="min-width:150px;">Timestamp</th>
                <th style="min-width:120px;">User</th>
                <th style="min-width:160px;">Email</th>
                <th style="min-width:100px;">Action</th>
                <th style="min-width:120px;">Module</th>
                <th style="width:80px;">Severity</th>
                <th style="min-width:110px;">IP Address</th>
                <th style="min-width:110px;">Branch</th>
                <th style="width:80px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((log, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${new Date(log.createdAt).toLocaleString()}</td>
                  <td>${log.userName || 'Unknown'}</td>
                  <td>${log.userEmail || '—'}</td>
                  <td><strong>${log.action || '—'}</strong></td>
                  <td>${log.module || '—'}</td>
                  <td><span class="severity-${log.severity || 'INFO'}">${log.severity || 'INFO'}</span></td>
                  <td>${log.ipAddress || '—'}</td>
                  <td>${log.branchName || 'Main Branch'}</td>
                  <td><span class="badge badge-${log.status || 'SUCCESS'}">${log.status || 'SUCCESS'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="report-footer">
            <p>
              <span class="footer-brand">Retail POS System</span> — Audit Report
              <br>
              Generated on ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      win.onload = function() {
        setTimeout(() => {
          win.print();
        }, 800);
      };
      toast.success('PDF report opened. Use "Save as PDF" to download.');
    } else {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-report-${new Date().toISOString().slice(0, 19)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded as HTML');
    }
  };

  const downloadReport = async (format) => {
    setGenerating(true);
    try {
      const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
      
      // Generate data with filters applied
      let data = [...sampleData];
      
      // Apply date filters
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        data = data.filter(log => new Date(log.createdAt) >= startDate);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        data = data.filter(log => new Date(log.createdAt) <= endDate);
      }

      if (data.length === 0) {
        toast.error('No data found for the selected filters');
        setGenerating(false);
        return;
      }

      switch (format) {
        case 'csv':
          exportAsCSV(data);
          break;
        case 'json':
          exportAsJSON(data);
          break;
        case 'excel':
          exportAsExcel(data);
          break;
        case 'pdf':
          exportAsPDF(data);
          break;
        default:
          toast.error('Unsupported format');
      }

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
          <ReportHistory reports={reportHistory || MOCK_REPORT_DATA} onDownload={downloadReport} />
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
          background: #1e3a5f;
          color: white;
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
        
        .srg-history {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }
        .rh-wrap { display: flex; flex-direction: column; gap: 10px; }
        .rh-title { font-size: .85rem; font-weight: 700; color: #374151; margin: 0; }
        .rh-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
        .rh-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: white; border: 1px solid #e2e8f0; border-radius: 9px;
          transition: all .15s;
        }
        .rh-item:hover { border-color: #93c5fd; }
        .rh-icon { font-size: 1.1rem; }
        .rh-meta { flex: 1; min-width: 0; }
        .rh-name { font-size: .83rem; font-weight: 600; color: #1e293b; }
        .rh-sub { font-size: .73rem; color: #94a3b8; }
        .rh-format { 
          font-size: .65rem; font-weight: 700; 
          padding: 2px 7px; border-radius: 6px; 
          background: #e2e8f0; color: #475569;
          text-transform: uppercase;
        }
        .rh-download { 
          padding: 5px 12px; 
          border: 1px solid #e2e8f0; 
          border-radius: 7px; 
          font-size: .75rem; font-weight: 600; 
          color: #3b82f6; 
          background: white; 
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .rh-download:hover { background: #eff6ff; border-color: #93c5fd; }
        .rh-empty { text-align: center; padding: 40px; color: #94a3b8; }
      `}</style>
    </div>
  );
};

// ReportHistory Component
const ReportHistory = ({ reports, onDownload }) => {
  const displayReports = reports?.length ? reports : [];
  
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  const getIcon = (format) => {
    switch(format?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'excel': return '📗';
      case 'json': return '🔧';
      default: return '📄';
    }
  };

  if (displayReports.length === 0) {
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
        {displayReports.map(r => (
          <div key={r._id} className="rh-item">
            <span className="rh-icon">{getIcon(r.format)}</span>
            <div className="rh-meta">
              <div className="rh-name">{r.type || 'Audit Report'}</div>
              <div className="rh-sub">{formatDate(r.createdAt)} · {r.generatedBy || 'System'}</div>
            </div>
            <span className="rh-format">{r.format?.toUpperCase() || 'PDF'}</span>
            <button className="rh-download" onClick={() => onDownload?.(r.format || 'pdf')}>
              ↓ Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityReportGenerator;