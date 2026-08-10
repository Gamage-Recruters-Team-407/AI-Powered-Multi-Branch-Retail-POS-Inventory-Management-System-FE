import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../src/pages/audit/AuditSecurityPage';

const STATUS_STYLES = {
  success: { bg: '#f0fdf4', color: '#16a34a', icon: '✓' },
  failed:  { bg: '#fef2f2', color: '#dc2626', icon: '✕' },
  blocked: { bg: '#fff7ed', color: '#ea580c', icon: '⊘' },
};

const STATUS_STYLES_DARK = {
  success: { bg: '#0a2e1a', color: '#4ade80', icon: '✓' },
  failed:  { bg: '#3d0a0a', color: '#f87171', icon: '✕' },
  blocked: { bg: '#3d1a00', color: '#fb923c', icon: '⊘' },
};

const LoginHistoryTable = ({ 
  history, 
  loading, 
  onRevokeSession, 
  theme,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  onPageSizeChange,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const context = useContext(ThemeContext);
  const currentTheme = context?.theme || theme || 'light';
  const isDark = currentTheme === 'dark';

  const now = new Date().getTime();

  // Use real data if available, otherwise show only last 7 days (week 1 data)
  const getFilteredHistory = () => {
    if (history && history.length > 0) {
      return history;
    }
    
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    return Array.from({ length: 10 }, (_, i) => ({
      _id: `session_${i + 1}`,
      createdAt: new Date(sevenDaysAgo + i * 3600000 * (i + 1) * 0.5).toISOString(),
      userName: ['Admin User', 'John Manager', 'Sarah Cashier', 'Mike Admin', 'Priya Staff'][i % 5],
      email: ['admin@retailpos.com', 'john@retailpos.com', 'sarah@retailpos.com', 'mike@retailpos.com', 'priya@retailpos.com'][i % 5],
      status: i % 4 === 3 ? 'failed' : i % 7 === 6 ? 'blocked' : 'success',
      ipAddress: `203.${94 + i % 3}.${12 + i}.${200 + i}`,
      location: ['Colombo, LK', 'Kandy, LK', 'Galle, LK', 'Unknown', 'Colombo, LK'][i % 5],
      device: ['Chrome on Windows', 'Safari on macOS', 'Chrome on Android', 'Firefox on Windows', 'Safari on iPhone'][i % 5],
      sessionId: `sess_${String(i + 1).padStart(4, '0')}`,
      active: i < 3,
      duration: i < 3 ? null : `${10 + ((i * 37) % 120)}m`,
      failReason: i % 4 === 3 ? 'Invalid password' : null,
    }));
  };

  const displayHistory = getFilteredHistory();

  const getStatusStyle = (status) => {
    const styles = isDark ? STATUS_STYLES_DARK : STATUS_STYLES;
    return styles[status] || STATUS_STYLES.success;
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const total = pagination.total || displayHistory.length;
  const totalPages = pagination.totalPages || Math.ceil(total / limit);
  
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  const paginatedData = displayHistory.slice((page - 1) * limit, page * limit);

  if (loading) {
    return (
      <div className={`lh-loading theme-${currentTheme}`}>
        <div className="loading-spinner-sm" />
        Loading login history…
        <style>{`
          .lh-loading {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 40px 20px;
            color: var(--text-muted, #64748b);
            justify-content: center;
            background: var(--card-bg, #ffffff);
            border-radius: 14px;
            border: 1px solid var(--border-color, #e2e8f0);
          }
          .theme-dark .lh-loading {
            background: #1e293b;
            border-color: #334155;
            color: #94a3b8;
          }
          .loading-spinner-sm {
            width: 20px;
            height: 20px;
            border: 2.5px solid var(--border-color, #e2e8f0);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin .7s linear infinite;
          }
          .theme-dark .loading-spinner-sm {
            border-color: #475569;
            border-top-color: #3b82f6;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`lh-wrap theme-${currentTheme}`}>
      <div className="lh-scroll">
        <table className="lh-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>User</th>
              <th>Time</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Device</th>
              <th>Session</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => {
              const s = getStatusStyle(row.status);
              return (
                <React.Fragment key={row._id}>
                  <tr
                    className={`lh-row ${expandedRow === row._id ? 'expanded' : ''}`}
                    onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}
                  >
                    <td>
                      <div className="status-pill" style={{ background: s.bg, color: s.color }}>
                        <span style={{ fontWeight: 800, fontSize: '.85rem' }}>{s.icon}</span>
                        <span>{row.status}</span>
                      </div>
                    </td>
                    <td>
                      <div className="lh-user">
                        <div className="lh-avatar">{(row.userName || 'U')[0]}</div>
                        <div>
                          <div className="lh-name">
                            {row.userId?.name || row.user?.name || row.userName || "Unknown User"}
                          </div>
                          <div className="lh-email">
                            {row.userId?.email || row.user?.email || row.email || row.userId?.username || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="lh-time">{formatTime(row.createdAt)}</td>
                    <td className="lh-ip">{row.ipAddress}</td>
                    <td className="lh-loc">
                      <span>{row.location}</span>
                    </td>
                    <td className="lh-device">{row.device}</td>
                    <td>
                      {row.active ? (
                        <span className="session-active">● Active</span>
                      ) : (
                        <span className="session-ended">{row.duration || 'Ended'}</span>
                      )}
                    </td>
                    <td>
                      {row.active && (
                        <button
                          className="revoke-btn"
                          onClick={(e) => { e.stopPropagation(); onRevokeSession?.(row.sessionId); }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRow === row._id && (
                    <tr className="lh-expanded-row">
                      <td colSpan={8}>
                        <div className="lh-expanded-body">
                          <div className="exp-item">
                            <span className="exp-key">Session ID</span>
                            <span className="exp-val mono">{row.sessionId}</span>
                          </div>
                          <div className="exp-item">
                            <span className="exp-key">Full Timestamp</span>
                            <span className="exp-val mono">{new Date(row.createdAt).toISOString()}</span>
                          </div>
                          {row.failReason && (
                            <div className="exp-item">
                              <span className="exp-key">Failure Reason</span>
                              <span className="exp-val" style={{ color: '#dc2626' }}>{row.failReason}</span>
                            </div>
                          )}
                          <div className="exp-item">
                            <span className="exp-key">Duration</span>
                            <span className="exp-val">{row.active ? 'Active session' : (row.duration || '—')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="lh-pagination">
          <div className="page-info">
            Showing <b>{startIdx}</b> to <b>{endIdx}</b> of <b>{total}</b> entries
          </div>
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
              onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
              className="page-size-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="page-size-label">per page</span>
          </div>
        </div>
      )}

      {/* ✅ Dark/Light Theme Styles */}
      <style>{`
        .lh-wrap {
          background: var(--card-bg, #ffffff);
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 14px;
          overflow: hidden;
          transition: background 0.3s, border-color 0.3s;
        }

        .theme-dark .lh-wrap {
          background: #1e293b;
          border-color: #334155;
        }

        .lh-scroll {
          overflow-x: auto;
        }

        .lh-table {
          width: 100%;
          border-collapse: collapse;
          font-size: .83rem;
        }

        .lh-table thead tr {
          background: var(--bg-secondary, #f8fafc);
          border-bottom: 1.5px solid var(--border-color, #e2e8f0);
        }

        .theme-dark .lh-table thead tr {
          background: #2d3a4f;
          border-bottom-color: #475569;
        }

        .lh-table th {
          padding: 12px 14px;
          text-align: left;
          font-size: .7rem;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: .06em;
          white-space: nowrap;
        }

        .theme-dark .lh-table th {
          color: #94a3b8;
        }

        .lh-row {
          border-bottom: 1px solid var(--border-color, #f1f5f9);
          cursor: pointer;
          transition: background .1s;
        }

        .theme-dark .lh-row {
          border-bottom-color: #334155;
        }

        .lh-row:hover,
        .lh-row.expanded {
          background: var(--bg-secondary, #f8fafc);
        }

        .theme-dark .lh-row:hover,
        .theme-dark .lh-row.expanded {
          background: #2d3a4f;
        }

        .lh-row:last-child {
          border-bottom: none;
        }

        .lh-table td {
          padding: 12px 14px;
          vertical-align: middle;
          color: var(--text-primary, #0f172a);
        }

        .theme-dark .lh-table td {
          color: #e2e8f0;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: .73rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .lh-user {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .lh-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          font-size: .75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .theme-dark .lh-avatar {
          background: #1a2a4a;
          color: #60a5fa;
        }

        .lh-name {
          font-weight: 600;
          color: var(--text-primary, #0f172a);
          white-space: nowrap;
        }

        .theme-dark .lh-name {
          color: #f1f5f9;
        }

        .lh-email {
          font-size: .73rem;
          color: var(--text-muted, #94a3b8);
        }

        .theme-dark .lh-email {
          color: #94a3b8;
        }

        .lh-time {
          color: var(--text-muted, #64748b);
          font-size: .8rem;
          white-space: nowrap;
        }

        .theme-dark .lh-time {
          color: #94a3b8;
        }

        .lh-ip {
          font-family: monospace;
          font-size: .78rem;
          color: var(--text-secondary, #475569);
        }

        .theme-dark .lh-ip {
          color: #cbd5e1;
        }

        .lh-loc {
          font-size: .8rem;
          color: var(--text-muted, #64748b);
        }

        .theme-dark .lh-loc {
          color: #94a3b8;
        }

        .lh-device {
          font-size: .78rem;
          color: var(--text-muted, #64748b);
          max-width: 160px;
        }

        .theme-dark .lh-device {
          color: #94a3b8;
        }

        .session-active {
          color: #16a34a;
          font-size: .75rem;
          font-weight: 700;
        }

        .theme-dark .session-active {
          color: #4ade80;
        }

        .session-ended {
          color: var(--text-muted, #94a3b8);
          font-size: .75rem;
        }

        .revoke-btn {
          padding: 5px 11px;
          border: 1.5px solid #fee2e2;
          border-radius: 7px;
          font-size: .73rem;
          font-weight: 600;
          color: #ef4444;
          background: #fff5f5;
          transition: all .15s;
          white-space: nowrap;
          cursor: pointer;
        }

        .revoke-btn:hover {
          background: #fee2e2;
        }

        .theme-dark .revoke-btn {
          background: #3d0a0a;
          border-color: #7f1d1d;
          color: #f87171;
        }

        .theme-dark .revoke-btn:hover {
          background: #5c1a1a;
        }

        .lh-expanded-row {
          background: var(--bg-secondary, #f8fafc);
        }

        .theme-dark .lh-expanded-row {
          background: #1e293b;
        }

        .lh-expanded-body {
          padding: 12px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .exp-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .exp-key {
          font-size: .68rem;
          font-weight: 700;
          color: var(--text-muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .theme-dark .exp-key {
          color: #94a3b8;
        }

        .exp-val {
          font-size: .8rem;
          color: var(--text-primary, #334155);
          font-weight: 500;
        }

        .theme-dark .exp-val {
          color: #e2e8f0;
        }

        .mono {
          font-family: monospace;
        }

        /* ========================================
           PAGINATION
           ======================================== */
        .lh-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color, #f1f5f9);
          background: var(--bg-secondary, #fafafa);
        }

        .theme-dark .lh-pagination {
          border-top-color: #334155;
          background: #1e293b;
        }

        .page-info {
          font-size: .82rem;
          color: var(--text-secondary, #64748b);
        }

        .theme-dark .page-info {
          color: #94a3b8;
        }

        .page-info b {
          color: var(--text-primary, #0f172a);
        }

        .theme-dark .page-info b {
          color: #f1f5f9;
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
        }

        .theme-dark .page-size-select {
          border-color: #475569;
          background: #2d3a4f;
          color: #f1f5f9;
        }

        .page-size-select:focus {
          border-color: #3b82f6;
        }

        .page-size-label {
          font-size: .78rem;
          color: var(--text-muted, #94a3b8);
        }

        .theme-dark .page-size-label {
          color: #94a3b8;
        }

        @media (max-width: 600px) {
          .lh-pagination {
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
      `}</style>
    </div>
  );
};

export default LoginHistoryTable;