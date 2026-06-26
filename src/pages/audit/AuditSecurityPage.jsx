import React, { useState, useEffect, useCallback, useRef } from 'react';
import AuditStatsCards from '../../components/audit/AuditStatsCards';
import AuditFilterBar from '../../components/audit/AuditFilterBar';
import AuditLogsTable from '../../components/audit/AuditLogsTable';
import LoginHistoryTable from '../../modal/LoginHistoryTable';
import SecurityMonitor from '../../modal/SecurityMonitor';
import SecurityReportGenerator from '../../viewer/SecurityReportGenerator';
import {
  getAuditLogs,
  getAuditStats,
  getLoginHistory,
  getSecurityEvents,
  resolveSecurityEvent,
  generateAuditReport,
  getAuditReportHistory,
  revokeSession,
  exportAuditLogs,
} from '../../services/auditApi';
import toast from 'react-hot-toast';

// ✅ Theme Context/Provider
export const ThemeContext = React.createContext({
  theme: 'light',
});

const TABS = [
  { id: 'activity',  label: 'Activity Logs',      icon: '📋' },
  { id: 'login',     label: 'Login History',       icon: '🔐' },
  { id: 'security',  label: 'Security Monitor',    icon: '🛡️' },
  { id: 'reports',   label: 'Security Reports',    icon: '📊' },
];

const AuditSecurityPage = () => {
  // ✅ Auto Theme Detection based on system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('auditTheme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [activeTab, setActiveTab] = useState('activity');

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Audit Logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({ 
    page: 1, 
    limit: 15, 
    total: 0, 
    totalPages: 1 
  });
  const [filters, setFilters] = useState({});

  // Login History
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPagination, setLoginPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Security Events
  const [secEvents, setSecEvents] = useState([]);
  const [secLoading, setSecLoading] = useState(false);

  // Reports
  const [reportHistory, setReportHistory] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // ✅ Hidden Columns State
  const [hiddenColumns, setHiddenColumns] = useState({
    email: false,
    ipAddress: true,
    branch: false,
    userAgent: false,
  });

  // ✅ Export loading state
  const [exportLoading, setExportLoading] = useState(false);

  // ✅ Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('auditTheme', newTheme);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ✅ Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Load Stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAuditStats();
      setStats(res.data);
    } catch (err) {
      console.error('Stats load error:', err);
      setStats({
        totalEvents: 0,
        loginAttempts: 0,
        failedLogins: 0,
        securityAlerts: 0,
        unresolvedAlerts: 0,
        activeSessions: 0,
        uniqueUsers: 0,
        eventsTrend: 0,
        loginTrend: 0,
        alertsTrend: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Load Audit Logs ────────────────────────────────────────────────────────
  const loadLogs = useCallback(async (page = 1) => {
    setLogsLoading(true);
    try {
      const res = await getAuditLogs({ 
        ...filters, 
        page, 
        limit: logsPagination.limit 
      });
      setLogs(res.data || []);
      if (res.pagination) setLogsPagination(res.pagination);
    } catch (err) {
      console.error('Logs load error:', err);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [filters, logsPagination.limit]);

  // ── Load Login History ─────────────────────────────────────────────────────
  const loadLoginHistory = useCallback(async (page = 1) => {
    setLoginLoading(true);
    try {
      const res = await getLoginHistory({ page, limit: loginPagination.limit });
      setLoginHistory(res.data || []);
      if (res.pagination) setLoginPagination(res.pagination);
    } catch (err) {
      console.error('Login history error:', err);
      setLoginHistory([]);
    } finally {
      setLoginLoading(false);
    }
  }, [loginPagination.limit]);

  // ── Load Security Events ───────────────────────────────────────────────────
  const loadSecEvents = useCallback(async () => {
    setSecLoading(true);
    try {
      const res = await getSecurityEvents({ page: 1, limit: 50 });
      setSecEvents(res.data || []);
    } catch (err) {
      console.error('Security events error:', err);
      setSecEvents([]);
    } finally {
      setSecLoading(false);
    }
  }, []);

  // ── Load Report History ────────────────────────────────────────────────────
  const loadReportHistory = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await getAuditReportHistory();
      setReportHistory(res.data || []);
    } catch (err) {
      console.error('Report history error:', err);
      setReportHistory([]);
    } finally {
      setReportLoading(false);
    }
  }, []);

  // ── Initial Loads ──────────────────────────────────────────────────────────
  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'activity') loadLogs(1);
    if (activeTab === 'login') loadLoginHistory(1);
    if (activeTab === 'security') loadSecEvents();
    if (activeTab === 'reports') loadReportHistory();
  }, [activeTab, loadLogs, loadLoginHistory, loadSecEvents, loadReportHistory]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = () => loadLogs(1);

  const handleResetFilters = () => {
    setFilters({});
    setTimeout(() => loadLogs(1), 0);
  };

  const handleResolveEvent = async (id, notes) => {
    try {
      await resolveSecurityEvent(id, notes);
      toast.success('Security event resolved');
      loadSecEvents();
      loadStats();
    } catch (err) {
      toast.error('Failed to resolve event');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      toast.success('Session revoked');
      loadLoginHistory();
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const handleGenerateReport = async (payload) => {
    try {
      await generateAuditReport(payload);
      toast.success('Report generated successfully');
      loadReportHistory();
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  // ✅ FIXED: Export Logs - Direct PDF Generation (No API call)
  const handleExportLogs = async () => {
    setExportLoading(true);
    try {
      // Get current logs from state (already loaded)
      const data = logs.length > 0 ? logs : [];
      
      if (data.length === 0) {
        toast.error('No logs available to export. Please load some data first.');
        setExportLoading(false);
        return;
      }

      // Generate PDF using HTML to print
      const generatePDFReport = (logsData) => {
        // Get current date for filename
        const dateStr = new Date().toISOString().split('T')[0];
        
        // Create HTML content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Audit Logs Report</title>
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
                  letter-spacing: 1px;
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
                .severity-low { color: #16a34a; font-weight: 600; }
                .severity-medium { color: #d97706; font-weight: 600; }
                .severity-high { color: #ea580c; font-weight: 600; }
                .severity-critical { color: #dc2626; font-weight: 600; }
                .badge {
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: 600;
                  display: inline-block;
                }
                .badge-success { background: #dcfce7; color: #16a34a; }
                .badge-danger { background: #fee2e2; color: #dc2626; }
                .badge-warning { background: #fef3c7; color: #d97706; }
                .badge-info { background: #dbeafe; color: #2563eb; }
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
                .page-break { page-break-after: always; }
                @media print {
                  body { padding: 15px; }
                  .no-print { display: none; }
                  th { background: #1e3a5f !important; color: white !important; }
                  tr:nth-child(even) { background: #f8fafc !important; }
                }
              </style>
            </head>
            <body>
              <div class="report-header">
                <h1>📋 Audit Logs Report</h1>
                <p class="subtitle">Retail POS System - Security Audit Trail</p>
              </div>
              
              <div class="report-meta">
                <div class="meta-item">
                  <span class="meta-label">📅 Generated:</span>
                  <span class="meta-value">${new Date().toLocaleString()}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">📊 Total Logs:</span>
                  <span class="meta-value">${logsData.length}</span>
                </div>
                ${filters.startDate ? `
                  <div class="meta-item">
                    <span class="meta-label">📅 From:</span>
                    <span class="meta-value">${new Date(filters.startDate).toLocaleDateString()}</span>
                  </div>
                ` : ''}
                ${filters.endDate ? `
                  <div class="meta-item">
                    <span class="meta-label">📅 To:</span>
                    <span class="meta-value">${new Date(filters.endDate).toLocaleDateString()}</span>
                  </div>
                ` : ''}
                ${filters.module ? `
                  <div class="meta-item">
                    <span class="meta-label">📂 Module:</span>
                    <span class="meta-value">${filters.module}</span>
                  </div>
                ` : ''}
                ${filters.severity ? `
                  <div class="meta-item">
                    <span class="meta-label">⚠️ Severity:</span>
                    <span class="meta-value">${filters.severity}</span>
                  </div>
                ` : ''}
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
                  ${logsData.map((log, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                      <td>${log.userName || 'Unknown'}</td>
                      <td>${log.userEmail || '—'}</td>
                      <td><strong>${log.action || '—'}</strong></td>
                      <td>${log.module || '—'}</td>
                      <td><span class="severity-${(log.severity || 'info').toLowerCase()}">${log.severity || 'INFO'}</span></td>
                      <td>${log.ipAddress || '—'}</td>
                      <td>${log.branchName || log.branch?.name || 'Main Branch'}</td>
                      <td><span class="badge badge-${log.status === 'SUCCESS' ? 'success' : log.status === 'FAILURE' ? 'danger' : 'warning'}">${log.status || 'SUCCESS'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="report-footer">
                <p>
                  <span class="footer-brand">Retail POS System</span> — Audit Logs Report
                  <br>
                  Generated on ${new Date().toLocaleString()}
                </p>
              </div>
            </body>
          </html>
        `;

        // Open in new window for printing
        const win = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
          win.focus();
          
          // Auto print after load
          win.onload = function() {
            setTimeout(() => {
              win.print();
            }, 800);
          };
          
          toast.success('PDF report opened. Use "Save as PDF" to download.');
        } else {
          // Fallback: Download as HTML file
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = `audit-logs-report-${dateStr}.html`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
          toast.success('Report downloaded as HTML');
        }
      };

      generatePDFReport(data);
      
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export logs: ' + (err.message || 'Unknown error'));
    } finally {
      setExportLoading(false);
    }
  };

  // ✅ Toggle Column Visibility
  const toggleColumn = (key) => {
    setHiddenColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ✅ Handle Login Page Change
  const handleLoginPageChange = (page) => {
    loadLoginHistory(page);
  };

  // ✅ Handle Login Page Size Change
  const handleLoginPageSizeChange = (newLimit) => {
    setLoginPagination(prev => ({ ...prev, limit: newLimit }));
    loadLoginHistory(1);
  };

  const themeValue = { theme };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={`audit-page theme-${theme}`}>
        {/* Page Header */}
        <div className="audit-page-header">
          <div className="audit-header-left">
            <div className="audit-header-icon">🛡️</div>
            <div>
              <h1 className="audit-title">Audit Logs & Security</h1>
              <p className="audit-subtitle">Monitor system activity, track access, and manage security events</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="export-all-btn" 
              onClick={handleExportLogs} 
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <span className="spinner-small" />
                  Exporting...
                </>
              ) : (
                '↓ Export Logs'
              )}
            </button>
          </div>
        </div>

        <AuditStatsCards stats={stats} loading={statsLoading} theme={theme} />

        {/* ✅ Column Visibility Controls */}
        {activeTab === 'activity' && (
          <div className="column-controls">
            <span className="column-controls-label">👁️ Show/Hide Columns:</span>
            {Object.entries(hiddenColumns).map(([key, hidden]) => (
              <label key={key} className="column-toggle-label">
                <input
                  type="checkbox"
                  checked={!hidden}
                  onChange={() => toggleColumn(key)}
                />
                <span className="column-toggle-text">
                  {key === 'ipAddress' ? 'IP Address' : 
                   key === 'userAgent' ? 'User Agent' :
                   key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="audit-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`audit-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="audit-tab-content">
          {activeTab === 'activity' && (
            <div className="tab-pane">
              <AuditFilterBar
                filters={filters}
                onChange={setFilters}
                onSearch={handleSearch}
                onReset={handleResetFilters}
                loading={logsLoading}
                theme={theme}
              />
              <AuditLogsTable
                logs={logs}
                loading={logsLoading}
                pagination={logsPagination}
                onPageChange={(p) => loadLogs(p)}
                hiddenColumns={hiddenColumns}
                theme={theme}
                onPageSizeChange={(newLimit) => {
                  setLogsPagination(prev => ({ ...prev, limit: newLimit }));
                  loadLogs(1);
                }}
              />
            </div>
          )}

          {activeTab === 'login' && (
            <div className="tab-pane">
              <div className="tab-section-header">
                <h3 className="tab-section-title">Login History</h3>
                <p className="tab-section-sub">Authentication events, session details, and active sessions</p>
              </div>
              <LoginHistoryTable
                history={loginHistory}
                loading={loginLoading}
                onRevokeSession={handleRevokeSession}
                theme={theme}
                pagination={loginPagination}
                onPageChange={handleLoginPageChange}
                onPageSizeChange={handleLoginPageSizeChange}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-pane">
              <div className="tab-section-header">
                <h3 className="tab-section-title">Security Monitor</h3>
                <p className="tab-section-sub">Real-time security threats, anomalies, and incident management</p>
              </div>
              <SecurityMonitor
                events={secEvents}
                loading={secLoading}
                onResolve={handleResolveEvent}
                theme={theme}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="tab-pane">
              <div className="tab-section-header">
                <h3 className="tab-section-title">Security Reports</h3>
                <p className="tab-section-sub">Generate and download audit and compliance reports</p>
              </div>
              <SecurityReportGenerator
                onGenerate={handleGenerateReport}
                reportHistory={reportHistory}
                loading={reportLoading}
                theme={theme}
              />
            </div>
          )}
        </div>

        {/* ✅ Global Dark/Light Theme Styles */}
        <style>{`
          /* ========================================
             THEME VARIABLES
             ======================================== */
          :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-tertiary: #f1f5f9;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            --border-color: #e2e8f0;
            --shadow-color: rgba(0,0,0,0.04);
            --shadow-hover: rgba(0,0,0,0.08);
            --card-bg: #ffffff;
            --input-bg: #f8fafc;
            --input-border: #e2e8f0;
          }

          [data-theme="dark"] {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #2d3a4f;
            --text-primary: #f1f5f9;
            --text-secondary: #cbd5e1;
            --text-muted: #94a3b8;
            --border-color: #334155;
            --shadow-color: rgba(0,0,0,0.3);
            --shadow-hover: rgba(0,0,0,0.5);
            --card-bg: #1e293b;
            --input-bg: #2d3a4f;
            --input-border: #475569;
          }

          /* ========================================
             PAGE STYLES
             ======================================== */
          .audit-page {
            padding: 8px 4px 48px;
            display: flex;
            flex-direction: column;
            gap: 22px;
            max-width: 1400px;
            width: 100%;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: background 0.3s, color 0.3s;
            min-height: 100vh;
          }

          .audit-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 14px;
          }

          .audit-header-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .audit-header-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #1e3a5f, #2563eb);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            box-shadow: 0 4px 14px rgba(37,99,235,.3);
            flex-shrink: 0;
          }

          .audit-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
            line-height: 1;
          }

          .audit-subtitle {
            font-size: .84rem;
            color: var(--text-muted);
            margin: 4px 0 0;
          }

          .header-actions {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .export-all-btn {
            padding: 10px 20px;
            border: 1.5px solid var(--border-color);
            border-radius: 10px;
            font-size: .875rem;
            font-weight: 600;
            color: var(--text-secondary);
            background: var(--card-bg);
            display: flex;
            align-items: center;
            gap: 7px;
            transition: all .15s;
            white-space: nowrap;
            cursor: pointer;
          }

          .export-all-btn:hover:not(:disabled) {
            background: var(--bg-secondary);
            border-color: var(--text-muted);
          }

          .export-all-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid var(--border-color);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            display: inline-block;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* ========================================
             COLUMN CONTROLS
             ======================================== */
          .column-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border-radius: 10px;
            border: 1px solid var(--border-color);
          }

          .column-controls-label {
            font-size: .8rem;
            font-weight: 600;
            color: var(--text-muted);
          }

          .column-toggle-label {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: .78rem;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            transition: background .15s;
          }

          .column-toggle-label:hover {
            background: var(--bg-tertiary);
          }

          .column-toggle-label input[type="checkbox"] {
            width: 14px;
            height: 14px;
            accent-color: #2563eb;
            cursor: pointer;
          }

          .column-toggle-text {
            font-weight: 500;
          }

          /* ========================================
             TABS
             ======================================== */
          .audit-tabs {
            display: flex;
            gap: 4px;
            background: var(--card-bg);
            border: 1.5px solid var(--border-color);
            border-radius: 12px;
            padding: 5px;
            width: fit-content;
          }

          .audit-tab {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: .875rem;
            font-weight: 500;
            color: var(--text-muted);
            transition: all .15s;
            white-space: nowrap;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          .audit-tab:hover {
            background: var(--bg-secondary);
            color: var(--text-secondary);
          }

          .audit-tab.active {
            background: #1e3a5f;
            color: white;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(30,58,95,.3);
          }

          .tab-pane {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .tab-section-header {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .tab-section-title {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
          }

          .tab-section-sub {
            font-size: .83rem;
            color: var(--text-muted);
            margin: 0;
          }

          /* ========================================
             RESPONSIVE
             ======================================== */
          @media (max-width: 768px) {
            .audit-page-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .header-actions {
              width: 100%;
              justify-content: stretch;
            }

            .header-actions button {
              flex: 1;
              justify-content: center;
            }

            .audit-tabs {
              max-width: 100%;
              overflow-x: auto;
              white-space: nowrap;
              width: 100%;
            }

            .audit-tab {
              flex: 1;
              justify-content: center;
            }

            .column-controls {
              gap: 8px;
            }

            .column-toggle-label {
              font-size: .7rem;
            }
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export default AuditSecurityPage;