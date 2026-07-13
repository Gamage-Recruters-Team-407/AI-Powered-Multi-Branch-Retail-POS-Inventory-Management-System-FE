import React, { useState, useContext, useEffect } from 'react';

// ✅ Import Theme Context
import { ThemeContext } from '../../pages/audit/AuditSecurityPage';

// ✅ Import Employee Context to get real employee data
import { useEmployees } from '../../context/EmployeeContext';

const SEVERITY_STYLES = {
  LOW:      { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  MEDIUM:   { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

const SEVERITY_STYLES_DARK = {
  LOW:      { bg: '#0a2e1a', color: '#4ade80', dot: '#22c55e' },
  MEDIUM:   { bg: '#3d2a00', color: '#fbbf24', dot: '#f59e0b' },
  HIGH:     { bg: '#3d1a00', color: '#fb923c', dot: '#f97316' },
  CRITICAL: { bg: '#3d0a0a', color: '#f87171', dot: '#ef4444' },
};

const ACTION_STYLES = {
  CREATE:  { bg: '#eff6ff', color: '#2563eb' },
  UPDATE:  { bg: '#f5f3ff', color: '#7c3aed' },
  DELETE:  { bg: '#fef2f2', color: '#dc2626' },
  VIEW:    { bg: '#f8fafc', color: '#64748b' },
  LOGIN:   { bg: '#f0fdf4', color: '#16a34a' },
  LOGOUT:  { bg: '#f1f5f9', color: '#475569' },
  EXPORT:  { bg: '#fffbeb', color: '#d97706' },
  IMPORT:  { bg: '#fdf4ff', color: '#9333ea' },
  APPROVE: { bg: '#ecfdf5', color: '#059669' },
  REJECT:  { bg: '#fff1f2', color: '#e11d48' },
};

const ACTION_STYLES_DARK = {
  CREATE:  { bg: '#1a2a4a', color: '#60a5fa' },
  UPDATE:  { bg: '#2a1a4a', color: '#a78bfa' },
  DELETE:  { bg: '#3d1a1a', color: '#f87171' },
  VIEW:    { bg: '#2d3a4f', color: '#94a3b8' },
  LOGIN:   { bg: '#0a2e1a', color: '#4ade80' },
  LOGOUT:  { bg: '#2d3a4f', color: '#94a3b8' },
  EXPORT:  { bg: '#3d2a00', color: '#fbbf24' },
  IMPORT:  { bg: '#2a1a4a', color: '#c084fc' },
  APPROVE: { bg: '#0a2e1a', color: '#34d399' },
  REJECT:  { bg: '#3d1a1a', color: '#fb7185' },
};

const AuditLogsTable = ({ 
  logs = [], 
  pagination = {}, 
  loading, 
  onPageChange,
  hiddenColumns = {},
  theme = 'light',
  onPageSizeChange,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ✅ Get employee data from EmployeeContext
  const { employees, loadEmployees } = useEmployees();

  // ✅ Load employees if not already loaded
  useEffect(() => {
    if (employees.length === 0) {
      loadEmployees(true);
    }
  }, []);

  // ✅ Use theme from context if available
  const context = useContext(ThemeContext);
  const currentTheme = context?.theme || theme;
  const isDark = currentTheme === 'dark';

  // ✅ Use dark styles when in dark mode
  const getSeverityStyle = (severity) => {
    const styles = isDark ? SEVERITY_STYLES_DARK : SEVERITY_STYLES;
    return styles[severity] || { bg: '#f8fafc', color: '#64748b', dot: '#cbd5e1' };
  };

  const getActionStyle = (action) => {
    const styles = isDark ? ACTION_STYLES_DARK : ACTION_STYLES;
    return styles[action] || { bg: '#f1f5f9', color: '#475569' };
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // ✅ Open details panel
  const openDetailsPanel = (log) => {
    setSelectedLog(log);
    setIsPanelOpen(true);
  };

  // ✅ Close details panel
  const closeDetailsPanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedLog(null), 300);
  };

  // ✅ Proper pagination values
  const page = pagination.page || 1;
  const limit = pagination.limit || 15;
  const total = pagination.total || logs.length || 0;
  const totalPages = pagination.totalPages || Math.ceil(total / limit) || 1;

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // ✅ Find employee by email or name from employee context
  const findEmployee = (log) => {
    // 1️⃣ FIRST: Email from log data
    const logEmail = log.userEmail || log.userId?.email || log.user?.email || log.email;
    if (logEmail) {
      const found = employees.find(emp => 
        emp.email?.toLowerCase() === logEmail.toLowerCase()
      );
      if (found) {
        return found;
      }
    }

    // 2️⃣ SECOND: userId එකෙන් හොයන්න
    if (log.user && typeof log.user === 'string') {
      const found = employees.find(emp => emp._id === log.user || emp.user === log.user);
      if (found) {
        return found;
      }
    }
    if (log.userId && typeof log.userId === 'string') {
      const found = employees.find(emp => emp._id === log.userId || emp.user === log.userId);
      if (found) {
        return found;
      }
    }

    // 3️⃣ THIRD: Name එකෙන් හොයන්න
    const logName = log.userName || log.userId?.name || log.user?.name || log.performedBy;
    if (logName && logName !== 'System' && logName !== 'System Administrator' && logName !== 'Unknown') {
      const found = employees.find(emp => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        return fullName.toLowerCase() === logName.toLowerCase() ||
               emp.firstName?.toLowerCase() === logName.toLowerCase() ||
               emp.lastName?.toLowerCase() === logName.toLowerCase();
      });
      if (found) {
        return found;
      }
    }

    return null;
  };

  // ✅ Get user display name - ALWAYS from log data first
  const getUserDisplayName = (log) => {
    // 1. Try log data directly (MOST IMPORTANT)
    const logUserName = log.userName || log.userId?.name || log.user?.name || log.performedBy;
    
    // If log has a valid name, use it
    if (logUserName && logUserName !== 'System' && logUserName !== 'System Administrator' && logUserName !== 'Unknown') {
      return logUserName;
    }

    // 2. Try email
    const logEmail = log.userEmail || log.userId?.email || log.user?.email || log.email;
    if (logEmail) {
      const emailName = logEmail.split('@')[0];
      return emailName
        .replace(/[_.-]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    // 3. Try to find employee
    const emp = findEmployee(log);
    if (emp) {
      return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'Unknown User';
    }

    return 'Unknown User';
  };

  // ✅ Get user email - DIRECTLY from log data
  const getUserEmail = (log) => {
    const logEmail = log.userEmail || log.userId?.email || log.user?.email || log.email;
    if (logEmail) {
      return logEmail;
    }

    const emp = findEmployee(log);
    if (emp && emp.email) {
      return emp.email;
    }

    return '—';
  };

  // ✅ Get user role - DIRECTLY from log data
  const getUserRole = (log) => {
    const logRole = log.userRole || log.userId?.role || log.user?.role;
    if (logRole && logRole !== 'SYSTEM' && logRole !== 'SYSTEM ADMIN') {
      return logRole.toUpperCase();
    }

    const emp = findEmployee(log);
    if (emp && emp.role) {
      return emp.role.toUpperCase();
    }

    return 'Staff';
  };

  // ✅ Get user image
  const getUserImage = (log) => {
    const emp = findEmployee(log);
    if (emp && emp.photo) {
      return emp.photo;
    }
    return log.userId?.image || log.user?.image || null;
  };

  // ✅ Column visibility helper
  const isColumnVisible = (key) => {
    return !hiddenColumns[key];
  };

  // ✅ Get current page data
  const getCurrentPageData = () => {
    if (pagination.totalPages > 1 && logs.length <= limit) {
      return logs;
    }
    const start = (page - 1) * limit;
    const end = start + limit;
    return logs.slice(start, end);
  };

  const currentPageData = getCurrentPageData();

  // ✅ Handle page size change
  const handlePageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newLimit);
    }
  };

  // ✅ Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className={`audit-table-container theme-${currentTheme}`}>
      <div className="table-responsive">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              {isColumnVisible('email') && <th>User Email</th>}
              {isColumnVisible('ipAddress') && <th>IP Address</th>}
              {isColumnVisible('branch') && <th>Branch</th>}
              <th>Severity</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(limit, 10) }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="skeleton-row">
                  <td colSpan="9"><div className="skeleton-bar" /></td>
                </tr>
              ))
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">
                  <div className="empty-state">
                    <span>📋</span>
                    <p>No audit logs found matching the filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentPageData.map((log) => {
                const sev = getSeverityStyle(log.severity);
                const act = getActionStyle(log.action);
                const isExpanded = expandedRow === log._id;
                const displayName = getUserDisplayName(log);
                const userRole = getUserRole(log);
                const userEmail = getUserEmail(log);
                const userImage = getUserImage(log);

                return (
                  <React.Fragment key={log._id}>
                    <tr className={`log-row ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleRow(log._id)}>
                      <td className="td-time">
                        {formatTimestamp(log.createdAt)}
                      </td>
                      
                      <td className="td-user">
                        <div className="table-user-flex">
                          {userImage ? (
                            <img src={userImage} alt={displayName} className="table-avatar" />
                          ) : (
                            <div className="table-avatar-fallback">{getInitial(displayName)}</div>
                          )}
                          <div className="user-info-text">
                            <span className="user-fallback-name">
                              {displayName}
                            </span>
                            <span className="user-fallback-role">{userRole}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="action-badge" style={{ backgroundColor: act.bg, color: act.color }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="td-module">{log.module}</td>
                      
                      {isColumnVisible('email') && (
                        <td className="td-email" title={userEmail}>{userEmail}</td>
                      )}
                      
                      {isColumnVisible('ipAddress') && (
                        <td className="td-ip">{log.ipAddress || '—'}</td>
                      )}
                      
                      {isColumnVisible('branch') && (
                        <td className="td-branch">
                          {log.branchName || log.branchId?.name || log.branch?.name || 'Main Branch'}
                        </td>
                      )}

                      <td>
                        <span className="severity-badge" style={{ backgroundColor: sev.bg, color: sev.color }}>
                          <span className="sev-dot" style={{ backgroundColor: sev.dot }} />
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button className="view-btn" onClick={() => openDetailsPanel(log)}>
                          View
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-details-row">
                        <td colSpan="9">
                          <div className="expanded-details-content">
                            <div className="details-grid">
                              <div><strong>Log ID:</strong> {log._id}</div>
                              <div><strong>User Agent:</strong> {log.userAgent || '—'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <div className="page-btns">
            <button 
              className="page-btn" 
              disabled={page <= 1 || loading} 
              onClick={() => onPageChange?.(page - 1)}
            >
              ← Previous
            </button>
            
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, index, array) => (
                <React.Fragment key={`page-wrapper-${p}`}>
                  {index > 0 && array[index - 1] !== p - 1 && (
                    <span className="page-ellipsis">…</span>
                  )}
                  <button 
                    className={`page-btn ${page === p ? 'active' : ''}`} 
                    disabled={loading} 
                    onClick={() => onPageChange?.(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            
            <button 
              className="page-btn" 
              disabled={page >= totalPages || loading} 
              onClick={() => onPageChange?.(page + 1)}
            >
              Next →
            </button>
          </div>
          
          <div className="page-size-selector">
            <select 
              value={limit} 
              onChange={handlePageSizeChange}
              className="page-size-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="page-size-label">per page</span>
          </div>
        </div>
      )}

      {/* ✅ SLIDE-IN DETAILS PANEL */}
      <div className={`details-panel-overlay ${isPanelOpen ? 'open' : ''}`} onClick={closeDetailsPanel}>
        <div className={`details-panel ${isPanelOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          {selectedLog && (
            <>
              {/* Panel Header */}
              <div className={`panel-header ${selectedLog.severity}`}>
                <div className="panel-header-content">
                  <div className="panel-header-left">
                    <span className="panel-icon">🔍</span>
                    <div>
                      <h3>Audit Details</h3>
                      <p>Log ID: {selectedLog._id}</p>
                    </div>
                  </div>
                  <button className="panel-close-btn" onClick={closeDetailsPanel}>✕</button>
                </div>
              </div>

              {/* Panel Body */}
              <div className="panel-body">
                {/* User Profile Section */}
                <div className="panel-user-card">
                  {getUserImage(selectedLog) ? (
                    <img 
                      src={getUserImage(selectedLog)} 
                      alt={getUserDisplayName(selectedLog)} 
                      className="panel-user-avatar" 
                    />
                  ) : (
                    <div className="panel-user-avatar-fallback">
                      {getInitial(getUserDisplayName(selectedLog))}
                    </div>
                  )}
                  <div className="panel-user-info">
                    <h4>{getUserDisplayName(selectedLog)}</h4>
                    <span className="panel-user-role">
                      {getUserRole(selectedLog)}
                    </span>
                    <p className="panel-user-email">
                      {getUserEmail(selectedLog)}
                    </p>
                  </div>
                </div>

                {/* Activity Details */}
                <div className="panel-section">
                  <div className="panel-section-title">Activity Information</div>
                  <div className="panel-details-grid">
                    <div className="panel-detail-item">
                      <span className="detail-label">Action</span>
                      <span className="detail-value action-value">{selectedLog.action}</span>
                    </div>
                    <div className="panel-detail-item">
                      <span className="detail-label">Module</span>
                      <span className="detail-value">{selectedLog.module}</span>
                    </div>
                    <div className="panel-detail-item">
                      <span className="detail-label">Timestamp</span>
                      <span className="detail-value">{formatTimestamp(selectedLog.createdAt)}</span>
                    </div>
                    <div className="panel-detail-item">
                      <span className="detail-label">Severity</span>
                      <span className={`severity-tag ${selectedLog.severity}`}>{selectedLog.severity}</span>
                    </div>
                    <div className="panel-detail-item">
                      <span className="detail-label">IP Address</span>
                      <span className="detail-value mono">{selectedLog.ipAddress || '—'}</span>
                    </div>
                    <div className="panel-detail-item">
                      <span className="detail-label">Branch</span>
                      <span className="detail-value">{selectedLog.branchName || selectedLog.branchId?.name || selectedLog.branch?.name || 'Main Branch'}</span>
                    </div>
                  </div>
                </div>

                {/* User Email Section */}
                <div className="panel-section">
                  <div className="panel-section-title">User Information</div>
                  <div className="panel-description" style={{ background: 'var(--bg-secondary, #f8fafc)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📧</span>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Email Address
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                          {getUserEmail(selectedLog)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="panel-section">
                  <div className="panel-section-title">Description</div>
                  <div className="panel-description">
                    {selectedLog.description || 'No description provided'}
                  </div>
                </div>

                {/* User Agent */}
                <div className="panel-section">
                  <div className="panel-section-title">System Context</div>
                  <div className="panel-agent">
                    <strong>User Agent:</strong> {selectedLog.userAgent || '—'}
                  </div>
                </div>

                {/* Metadata */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="panel-section">
                    <div className="panel-section-title">Payload Metadata</div>
                    <div className="panel-json">
                      <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="panel-footer">
                <button className="panel-close-footer-btn" onClick={closeDetailsPanel}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Dark/Light Theme Styles */}
      <style>{`
        /* ========================================
           LIGHT & DARK MODE VARIABLES
           ======================================== */
        .audit-table-container {
          background: var(--card-bg, #ffffff);
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px var(--shadow-color, rgba(0,0,0,.02));
          position: relative;
          transition: background 0.3s, border-color 0.3s, color 0.3s;
        }

        .theme-dark .audit-table-container {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        /* ========================================
           TABLE STYLES
           ======================================== */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: .85rem;
        }

        .audit-table th {
          background: var(--bg-secondary, #f8fafc);
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-secondary, #475569);
          font-size: .75rem;
          text-transform: uppercase;
          letter-spacing: .05em;
          border-bottom: 1.5px solid var(--border-color, #e2e8f0);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .theme-dark .audit-table th {
          background: #2d3a4f;
          color: #94a3b8;
          border-bottom-color: #475569;
        }

        .audit-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color, #f1f5f9);
          color: var(--text-primary, #334155);
          vertical-align: middle;
        }

        .theme-dark .audit-table td {
          border-bottom-color: #334155;
          color: #e2e8f0;
        }

        /* ========================================
           USER FLEX
           ======================================== */
        .table-user-flex {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--border-color, #e2e8f0);
        }

        .theme-dark .table-avatar {
          border-color: #475569;
        }

        .table-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          border: 1.5px solid #bae6fd;
          flex-shrink: 0;
        }

        .theme-dark .table-avatar-fallback {
          background: #1a2a4a;
          color: #60a5fa;
          border-color: #3b82f6;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-fallback-name {
          font-weight: 600;
          color: var(--text-primary, #0f172a);
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .theme-dark .user-fallback-name {
          color: #f1f5f9;
        }

        .user-fallback-role {
          font-size: .72rem;
          color: var(--text-muted, #94a3b8);
          font-weight: 500;
        }

        .theme-dark .user-fallback-role {
          color: #94a3b8;
        }

        /* ========================================
           LOG ROW
           ======================================== */
        .log-row {
          cursor: pointer;
          transition: background .1s;
        }

        .log-row:hover {
          background: var(--bg-secondary, #f8fafc);
        }

        .theme-dark .log-row:hover {
          background: #2d3a4f;
        }

        .log-row.expanded {
          background: var(--bg-secondary, #f8fafc);
        }

        .theme-dark .log-row.expanded {
          background: #2d3a4f;
        }

        .td-time {
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          color: var(--text-muted, #64748b);
          font-size: .78rem;
        }

        .theme-dark .td-time {
          color: #94a3b8;
        }

        /* ========================================
           ACTION BADGE
           ======================================== */
        .action-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: .72rem;
          font-weight: 700;
          display: inline-block;
          white-space: nowrap;
        }

        /* ========================================
           MODULE
           ======================================== */
        .td-module {
          font-weight: 500;
          color: var(--text-primary, #1e293b);
          font-size: .8rem;
        }

        .theme-dark .td-module {
          color: #e2e8f0;
        }

        /* ========================================
           EMAIL
           ======================================== */
        .td-email {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-secondary, #475569);
          font-size: .8rem;
        }

        .theme-dark .td-email {
          color: #cbd5e1;
        }

        /* ========================================
           SEVERITY BADGE
           ======================================== */
        .severity-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 99px;
          font-size: .72rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .sev-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ========================================
           IP ADDRESS
           ======================================== */
        .td-ip {
          font-family: monospace;
          font-size: .76rem;
          color: var(--text-muted, #94a3b8);
        }

        .theme-dark .td-ip {
          color: #94a3b8;
        }

        /* ========================================
           BRANCH
           ======================================== */
        .td-branch {
          color: var(--text-muted, #64748b);
          font-size: .8rem;
        }

        .theme-dark .td-branch {
          color: #94a3b8;
        }

        /* ========================================
           VIEW BUTTON
           ======================================== */
        .view-btn {
          padding: 5px 12px;
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 7px;
          font-size: .75rem;
          font-weight: 600;
          color: #3b82f6;
          background: var(--card-bg, #ffffff);
          transition: all .15s;
          cursor: pointer;
        }

        .theme-dark .view-btn {
          border-color: #475569;
          background: #2d3a4f;
          color: #60a5fa;
        }

        .view-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .theme-dark .view-btn:hover {
          background: #1a2a4a;
          border-color: #3b82f6;
        }

        /* ========================================
           EXPANDED DETAILS
           ======================================== */
        .expanded-details-row td {
          padding: 0;
          background: var(--bg-secondary, #fafafa);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .theme-dark .expanded-details-row td {
          background: #1e293b;
          border-bottom-color: #334155;
        }

        .expanded-details-content {
          padding: 10px 24px;
          font-size: .8rem;
          color: var(--text-muted, #64748b);
          border-left: 3px solid var(--border-color, #cbd5e1);
        }

        .theme-dark .expanded-details-content {
          color: #94a3b8;
          border-left-color: #475569;
        }

        .details-grid {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .details-grid strong {
          color: var(--text-secondary, #475569);
        }

        .theme-dark .details-grid strong {
          color: #94a3b8;
        }

        /* ========================================
           SKELETON LOADING
           ======================================== */
        .skeleton-bar {
          height: 16px;
          background: linear-gradient(90deg, var(--bg-secondary, #f1f5f9) 25%, var(--border-color, #e2e8f0) 50%, var(--bg-secondary, #f1f5f9) 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .theme-dark .skeleton-bar {
          background: linear-gradient(90deg, #2d3a4f 25%, #475569 50%, #2d3a4f 75%);
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ========================================
           EMPTY STATE
           ======================================== */
        .empty-cell {
          text-align: center;
          padding: 40px !important;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .empty-state span {
          font-size: 2.5rem;
        }

        .empty-state p {
          color: var(--text-muted, #94a3b8);
          margin: 0;
        }

        .theme-dark .empty-state p {
          color: #94a3b8;
        }

        /* ========================================
           PAGINATION
           ======================================== */
        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color, #f1f5f9);
          background: var(--bg-secondary, #fafafa);
        }

        .theme-dark .table-pagination {
          border-top-color: #334155;
          background: #1e293b;
        }

        .page-btns {
          display: flex;
          gap: 5px;
          align-items: center;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 6px 14px;
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 7px;
          font-size: .8rem;
          font-weight: 500;
          color: var(--text-secondary, #475569);
          background: var(--card-bg, #ffffff);
          transition: all .15s;
          cursor: pointer;
          min-width: 36px;
          text-align: center;
        }

        .theme-dark .page-btn {
          border-color: #475569;
          background: #2d3a4f;
          color: #cbd5e1;
        }

        .page-btn:hover:not(:disabled):not(.active) {
          background: var(--bg-secondary, #f8fafc);
          border-color: var(--text-muted, #94a3b8);
        }

        .theme-dark .page-btn:hover:not(:disabled):not(.active) {
          background: #3d4a5f;
          border-color: #94a3b8;
        }

        .page-btn.active {
          background: #1e3a5f;
          color: white;
          border-color: #1e3a5f;
        }

        .page-btn:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .page-ellipsis {
          padding: 0 6px;
          color: var(--text-muted, #94a3b8);
          font-size: .9rem;
        }

        .theme-dark .page-ellipsis {
          color: #94a3b8;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-size-select {
          padding: 6px 10px;
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 7px;
          font-size: .8rem;
          background: var(--card-bg, #ffffff);
          color: var(--text-primary, #0f172a);
          cursor: pointer;
          outline: none;
          min-width: 60px;
        }

        .theme-dark .page-size-select {
          border-color: #475569;
          background: #2d3a4f;
          color: #f1f5f9;
        }

        .page-size-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .page-size-label {
          font-size: .78rem;
          color: var(--text-muted, #94a3b8);
        }

        .theme-dark .page-size-label {
          color: #94a3b8;
        }

        /* ========================================
           MODAL / PANEL
           ======================================== */
        .details-panel-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: rgba(0, 0, 0, 0);
          z-index: 9998;
          pointer-events: none;
          transition: background 0.3s ease;
        }

        .details-panel-overlay.open {
          background: rgba(0, 0, 0, 0.5);
          pointer-events: all;
        }

        .theme-dark .details-panel-overlay.open {
          background: rgba(0, 0, 0, 0.7);
        }

        .details-panel {
          position: fixed;
          top: 0;
          right: -480px;
          bottom: 0;
          width: 460px;
          max-width: 92vw;
          background: var(--card-bg, #ffffff);
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          transition: right 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .theme-dark .details-panel {
          background: #1e293b;
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.5);
        }

        .details-panel.open {
          right: 0;
        }

        .panel-header {
          padding: 20px 24px;
          background: #1e3a5f;
          flex-shrink: 0;
        }

        .panel-header.LOW { background: linear-gradient(135deg, #1e3a5f 0%, #16a34a 100%); }
        .panel-header.MEDIUM { background: linear-gradient(135deg, #1e3a5f 0%, #ca8a04 100%); }
        .panel-header.HIGH { background: linear-gradient(135deg, #1e3a5f 0%, #ea580c 100%); }
        .panel-header.CRITICAL { background: linear-gradient(135deg, #1e3a5f 0%, #dc2626 100%); }

        .theme-dark .panel-header {
          background: #1e3a5f !important;
        }

        .panel-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .panel-icon {
          font-size: 1.4rem;
          background: rgba(255,255,255,0.15);
          padding: 6px 10px;
          border-radius: 10px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }

        .panel-header p {
          margin: 2px 0 0;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.75);
          font-family: monospace;
        }

        .panel-close-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          font-size: 1.4rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .panel-close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          background: var(--bg-primary, #fdfdfd);
        }

        .theme-dark .panel-body {
          background: #0f172a;
        }

        .panel-user-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-secondary, #f8fafc);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          margin-bottom: 20px;
        }

        .theme-dark .panel-user-card {
          background: #1e293b;
          border-color: #334155;
        }

        .panel-user-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #3b82f6;
          flex-shrink: 0;
        }

        .panel-user-avatar-fallback {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: #0369a1;
          font-weight: 800;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #3b82f6;
          flex-shrink: 0;
        }

        .theme-dark .panel-user-avatar-fallback {
          background: linear-gradient(135deg, #1a2a4a, #3b82f6);
          color: #60a5fa;
        }

        .panel-user-info h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
        }

        .theme-dark .panel-user-info h4 {
          color: #f1f5f9;
        }

        .panel-user-role {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          padding: 1px 10px;
          border-radius: 99px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-top: 2px;
        }

        .theme-dark .panel-user-role {
          background: #1a2a4a;
          color: #60a5fa;
        }

        .panel-user-email {
          margin: 4px 0 0;
          font-size: 0.78rem;
          color: var(--text-muted, #64748b);
        }

        .theme-dark .panel-user-email {
          color: #94a3b8;
        }

        .panel-section {
          margin-bottom: 16px;
        }

        .panel-section-title {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
          padding-bottom: 4px;
          border-bottom: 1px dashed var(--border-color, #e2e8f0);
        }

        .theme-dark .panel-section-title {
          color: #94a3b8;
          border-bottom-color: #334155;
        }

        .panel-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .panel-detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 12px;
          background: var(--bg-secondary, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--border-color, #f1f5f9);
        }

        .theme-dark .panel-detail-item {
          background: #1e293b;
          border-color: #334155;
        }

        .detail-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .theme-dark .detail-label {
          color: #94a3b8;
        }

        .detail-value {
          font-size: 0.85rem;
          color: var(--text-primary, #0f172a);
          font-weight: 500;
          word-break: break-word;
        }

        .theme-dark .detail-value {
          color: #e2e8f0;
        }

        .detail-value.action-value {
          font-weight: 700;
          color: #2563eb;
        }

        .theme-dark .detail-value.action-value {
          color: #60a5fa;
        }

        .detail-value.mono {
          font-family: monospace;
          font-size: 0.78rem;
        }

        .severity-tag {
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          display: inline-block;
          width: fit-content;
        }

        .severity-tag.LOW { background: #f0fdf4; color: #16a34a; }
        .severity-tag.MEDIUM { background: #fffbeb; color: #d97706; }
        .severity-tag.HIGH { background: #fff7ed; color: #ea580c; }
        .severity-tag.CRITICAL { background: #fef2f2; color: #dc2626; }

        .theme-dark .severity-tag.LOW { background: #0a2e1a; color: #4ade80; }
        .theme-dark .severity-tag.MEDIUM { background: #3d2a00; color: #fbbf24; }
        .theme-dark .severity-tag.HIGH { background: #3d1a00; color: #fb923c; }
        .theme-dark .severity-tag.CRITICAL { background: #3d0a0a; color: #f87171; }

        .panel-description {
          background: var(--card-bg, #ffffff);
          border: 1.5px solid var(--border-color, #e2e8f0);
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          color: var(--text-primary, #0f172a);
          line-height: 1.6;
          font-weight: 500;
        }

        .theme-dark .panel-description {
          background: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
        }

        .panel-agent {
          font-size: 0.78rem;
          color: var(--text-secondary, #64748b);
          padding: 10px 14px;
          background: var(--bg-secondary, #f8fafc);
          border-radius: 8px;
          border: 1px solid var(--border-color, #e2e8f0);
          line-height: 1.5;
        }

        .theme-dark .panel-agent {
          color: #94a3b8;
          background: #1e293b;
          border-color: #334155;
        }

        .panel-json {
          background: #0f172a;
          padding: 14px;
          border-radius: 10px;
          overflow-x: auto;
          max-height: 200px;
        }

        .panel-json pre {
          margin: 0;
          font-family: monospace;
          font-size: 0.75rem;
          color: #38bdf8;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .panel-footer {
          padding: 14px 24px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #f8fafc);
          flex-shrink: 0;
          display: flex;
          justify-content: flex-end;
        }

        .theme-dark .panel-footer {
          border-top-color: #334155;
          background: #1e293b;
        }

        .panel-close-footer-btn {
          padding: 9px 24px;
          background: #1e3a5f;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .panel-close-footer-btn:hover {
          background: #2563eb;
        }

        /* ========================================
           RESPONSIVE
           ======================================== */
        @media (max-width: 768px) {
          .details-panel {
            width: 100%;
            max-width: 100%;
            right: -100%;
          }

          .details-panel.open {
            right: 0;
          }

          .panel-details-grid {
            grid-template-columns: 1fr;
          }

          .table-pagination {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .page-btns {
            justify-content: center;
          }

          .page-size-selector {
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .panel-header {
            padding: 16px 18px;
          }

          .panel-body {
            padding: 16px 18px;
          }

          .panel-footer {
            padding: 12px 18px;
          }

          .panel-user-card {
            flex-direction: column;
            text-align: center;
          }

          .panel-user-info {
            align-items: center;
          }

          .page-size-select {
            min-width: 50px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditLogsTable;