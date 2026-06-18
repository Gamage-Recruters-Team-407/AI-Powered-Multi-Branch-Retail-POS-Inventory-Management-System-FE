import React, { useState, useEffect, useCallback } from 'react';
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

const TABS = [
  { id: 'activity',  label: 'Activity Logs',      icon: '📋' },
  { id: 'login',     label: 'Login History',       icon: '🔐' },
  { id: 'security',  label: 'Security Monitor',    icon: '🛡️' },
  { id: 'reports',   label: 'Security Reports',    icon: '📊' },
];

const AuditSecurityPage = () => {
  const [activeTab, setActiveTab]         = useState('activity');

  // Stats
  const [stats, setStats]                 = useState(null);
  const [statsLoading, setStatsLoading]   = useState(true);

  // Audit Logs
  const [logs, setLogs]                   = useState([]);
  const [logsLoading, setLogsLoading]     = useState(false);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters]             = useState({});

  // Login History
  const [loginHistory, setLoginHistory]   = useState([]);
  const [loginLoading, setLoginLoading]   = useState(false);

  // Security Events
  const [secEvents, setSecEvents]         = useState([]);
  const [secLoading, setSecLoading]       = useState(false);

  // Reports
  const [reportHistory, setReportHistory] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

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
      const res = await getAuditLogs({ ...filters, page, limit: logsPagination.limit });
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
  const loadLoginHistory = useCallback(async () => {
    setLoginLoading(true);
    try {
      const res = await getLoginHistory({ page: 1, limit: 30 });
      setLoginHistory(res.data || []);
    } catch (err) {
      console.error('Login history error:', err);
      setLoginHistory([]);
    } finally {
      setLoginLoading(false);
    }
  }, []);

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
    if (activeTab === 'login') loadLoginHistory();
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

  const handleExportLogs = async () => {
    try {
      const response = await exportAuditLogs({ format: 'csv' });
      // Handle file download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (err) {
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className="audit-page">
      <div className="audit-page-header">
        <div className="audit-header-left">
          <div className="audit-header-icon">🛡️</div>
          <div>
            <h1 className="audit-title">Audit Logs & Security</h1>
            <p className="audit-subtitle">Monitor system activity, track access, and manage security events</p>
          </div>
        </div>
        <button className="export-all-btn" onClick={handleExportLogs}>
          ↓ Export Logs
        </button>
      </div>

      <AuditStatsCards stats={stats} loading={statsLoading} />

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
            />
            <AuditLogsTable
              logs={logs}
              loading={logsLoading}
              pagination={logsPagination}
              onPageChange={(p) => loadLogs(p)}
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
            />
          </div>
        )}
      </div>

      <style>{`
        .audit-page { padding: 8px 4px 48px; display: flex; flex-direction: column; gap: 22px; max-width: 1400px; width: 100%; }
        .audit-page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .audit-header-left { display: flex; align-items: center; gap: 14px; }
        .audit-header-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #1e3a5f, #2563eb); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 14px rgba(37,99,235,.3); flex-shrink: 0; }
        .audit-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; }
        .audit-subtitle { font-size: .84rem; color: #64748b; margin: 4px 0 0; }
        .export-all-btn { padding: 10px 20px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: .875rem; font-weight: 600; color: #475569; background: white; display: flex; align-items: center; gap: 7px; transition: all .15s; white-space: nowrap; cursor: pointer; }
        .export-all-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .audit-tabs { display: flex; gap: 4px; background: white; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 5px; width: fit-content; }
        .audit-tab { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px; font-size: .875rem; font-weight: 500; color: #64748b; transition: all .15s; white-space: nowrap; background: transparent; border: none; cursor: pointer; }
        .audit-tab:hover { background: #f8fafc; color: #374151; }
        .audit-tab.active { background: #1e3a5f; color: white; font-weight: 700; box-shadow: 0 2px 8px rgba(30,58,95,.3); }
        .tab-pane { display: flex; flex-direction: column; gap: 16px; }
        .tab-section-header { display: flex; flex-direction: column; gap: 3px; }
        .tab-section-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0; }
        .tab-section-sub { font-size: .83rem; color: #64748b; margin: 0; }
      `}</style>
    </div>
  );
};

export default AuditSecurityPage;