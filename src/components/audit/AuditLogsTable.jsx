import React, { useState } from 'react';

const SEVERITY_STYLES = {
  LOW:      { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  MEDIUM:   { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', dot: '#f97316' },
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
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
  REJECT:  { bg: '#fef2f2', color: '#b91c1c' },
};

const SeverityBadge = ({ severity }) => {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '.7rem', fontWeight: 700,
      padding: '3px 9px', borderRadius: 99,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      textTransform: 'uppercase', letterSpacing: '.05em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {severity}
    </span>
  );
};

const ActionBadge = ({ action }) => {
  const s = ACTION_STYLES[action] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '.7rem', fontWeight: 700,
      padding: '3px 9px', borderRadius: 6,
      textTransform: 'uppercase', letterSpacing: '.04em',
    }}>
      {action}
    </span>
  );
};

const AuditDetailModal = ({ log, onClose }) => {
  if (!log) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Audit Log Detail</h3>
            <p className="modal-sub">ID: {log._id || log.id}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-key">Timestamp</span>
              <span className="detail-val">{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-key">User</span>
              <span className="detail-val">{log.userName || log.userId || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-key">Action</span>
              <span className="detail-val"><ActionBadge action={log.action} /></span>
            </div>
            <div className="detail-item">
              <span className="detail-key">Module</span>
              <span className="detail-val">{log.module || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-key">Severity</span>
              <span className="detail-val"><SeverityBadge severity={log.severity || 'LOW'} /></span>
            </div>
            <div className="detail-item">
              <span className="detail-key">IP Address</span>
              <span className="detail-val">{log.ipAddress || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-key">Branch</span>
              <span className="detail-val">{log.branchName || log.branchId || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-key">User Agent</span>
              <span className="detail-val">{log.userAgent || '—'}</span>
            </div>
          </div>

          {log.description && (
            <div className="detail-section">
              <span className="detail-key">Description</span>
              <p className="detail-desc">{log.description}</p>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="detail-section">
              <span className="detail-key">Metadata</span>
              <pre className="detail-pre">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )}

          {log.changes && (
            <div className="detail-section">
              <span className="detail-key">Changes</span>
              <div className="changes-wrap">
                {log.changes.before && (
                  <div className="change-block before">
                    <div className="change-label">Before</div>
                    <pre className="detail-pre">{JSON.stringify(log.changes.before, null, 2)}</pre>
                  </div>
                )}
                {log.changes.after && (
                  <div className="change-block after">
                    <div className="change-label">After</div>
                    <pre className="detail-pre">{JSON.stringify(log.changes.after, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
          .modal-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.45);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }
          .modal-panel {
            background: white;
            border-radius: 16px;
            width: 100%; max-width: 680px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,.2);
          }
          .modal-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 24px 24px 18px;
            border-bottom: 1px solid #e2e8f0;
            position: sticky; top: 0;
            background: white; z-index: 10;
          }
          .modal-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
          .modal-sub { font-size: .75rem; color: #94a3b8; margin-top: 2px; font-family: monospace; }
          .modal-close {
            width: 32px; height: 32px; border-radius: 8px;
            background: #f1f5f9; color: #64748b;
            display: flex; align-items: center; justify-content: center;
            font-size: .85rem; flex-shrink: 0;
            transition: background .15s;
          }
          .modal-close:hover { background: #fee2e2; color: #ef4444; }
          .modal-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 20px; }
          .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 14px;
          }
          .detail-item { display: flex; flex-direction: column; gap: 4px; }
          .detail-key { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
          .detail-val { font-size: .875rem; color: #1e293b; font-weight: 500; }
          .detail-section { display: flex; flex-direction: column; gap: 8px; }
          .detail-desc { font-size: .875rem; color: #475569; line-height: 1.6; }
          .detail-pre {
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
            padding: 12px; font-size: .75rem; color: #334155;
            overflow-x: auto; white-space: pre-wrap; line-height: 1.6;
          }
          .changes-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .change-block { display: flex; flex-direction: column; gap: 6px; }
          .change-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
          .change-block.before .change-label { color: #ef4444; }
          .change-block.after .change-label { color: #16a34a; }
          .change-block.before .detail-pre { border-color: #fecaca; background: #fff5f5; }
          .change-block.after .detail-pre { border-color: #bbf7d0; background: #f0fdf4; }
        `}</style>
      </div>
    </div>
  );
};

const AuditLogsTable = ({ logs, loading, pagination, onPageChange }) => {
  const [selectedLog, setSelectedLog] = useState(null);

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner" />
        <span>Loading audit logs…</span>
        <style>{`
          .table-loading {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; gap: 14px;
            padding: 60px 20px;
            background: white; border-radius: 14px;
            border: 1.5px solid #e2e8f0;
            color: #64748b; font-size: .9rem;
          }
          .loading-spinner {
            width: 32px; height: 32px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin .7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const baseTimestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
  const mockLogs = logs?.length ? logs : Array.from({ length: 8 }, (_, i) => ({
    _id: `log_${i + 1}`,
    createdAt: new Date(baseTimestamp - i * 1800000).toISOString(),
    userName: ['Admin User', 'John Manager', 'Sarah Cashier', 'Mike Admin'][i % 4],
    action: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'EXPORT', 'APPROVE', 'REJECT'][i % 8],
    module: ['Products', 'Inventory', 'POS', 'Employees', 'Auth', 'Reports', 'Purchase Orders', 'Returns'][i % 8],
    description: [
      'Created new product: Nike Air Max 270',
      'Updated stock quantity for SKU-001',
      'Deleted customer record #4421',
      'Viewed sales report for Q4',
      'Successful login from 192.168.1.42',
      'Exported inventory CSV report',
      'Approved purchase order PO-2024-089',
      'Rejected return request RET-2024-112',
    ][i % 8],
    severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'LOW', 'MEDIUM', 'LOW', 'HIGH'][i % 8],
    ipAddress: `192.168.${Math.floor(i / 3)}.${10 + i}`,
    branchName: ['Main Branch', 'City Centre', 'Kandy Branch'][i % 3],
  }));

  return (
    <div className="audit-table-wrap">
      <div className="audit-table-scroll">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>Severity</th>
              <th>IP Address</th>
              <th>Branch</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log) => (
              <tr key={log._id} className="audit-row" onClick={() => setSelectedLog(log)}>
                <td className="td-time">{formatTime(log.createdAt || log.timestamp)}</td>
                <td className="td-user">
                  <div className="user-cell">
                    <div className="user-avatar-xs">{(log.userName || 'U')[0]}</div>
                    <span>{log.userName || log.userId || '—'}</span>
                  </div>
                </td>
                <td><ActionBadge action={log.action} /></td>
                <td className="td-module">{log.module}</td>
                <td className="td-desc">{log.description}</td>
                <td><SeverityBadge severity={log.severity || 'LOW'} /></td>
                <td className="td-ip">{log.ipAddress || '—'}</td>
                <td className="td-branch">{log.branchName || '—'}</td>
                <td>
                  <button className="view-btn" onClick={e => { e.stopPropagation(); setSelectedLog(log); }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="table-pagination">
          <span className="page-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total?.toLocaleString()} records
          </span>
          <div className="page-btns">
            <button
              className="page-btn"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >← Prev</button>
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              const page = Math.max(1, (pagination.page || 1) - 2) + i;
              return (
                <button
                  key={page}
                  className={`page-btn ${page === pagination.page ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={pagination.page >= (pagination.totalPages || 1)}
              onClick={() => onPageChange(pagination.page + 1)}
            >Next →</button>
          </div>
        </div>
      )}

      {selectedLog && <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      <style>{`
        .audit-table-wrap {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .audit-table-scroll { overflow-x: auto; }
        .audit-table {
          width: 100%;
          border-collapse: collapse;
          font-size: .83rem;
        }
        .audit-table thead tr {
          background: #f8fafc;
          border-bottom: 1.5px solid #e2e8f0;
        }
        .audit-table th {
          padding: 12px 14px;
          text-align: left;
          font-size: .7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .06em;
          white-space: nowrap;
        }
        .audit-row {
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background .1s;
        }
        .audit-row:hover { background: #f8fafc; }
        .audit-row:last-child { border-bottom: none; }
        .audit-table td { padding: 12px 14px; vertical-align: middle; }
        .td-time { font-family: monospace; font-size: .76rem; color: #64748b; white-space: nowrap; }
        .td-user { white-space: nowrap; }
        .user-cell { display: flex; align-items: center; gap: 8px; }
        .user-avatar-xs {
          width: 26px; height: 26px; border-radius: 50%;
          background: #dbeafe; color: #2563eb;
          font-size: .72rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .td-module { color: #475569; font-weight: 500; }
        .td-desc {
          color: #374151;
          max-width: 260px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .td-ip { font-family: monospace; font-size: .76rem; color: #94a3b8; }
        .td-branch { color: #64748b; font-size: .8rem; }
        .view-btn {
          padding: 5px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 7px;
          font-size: .75rem;
          font-weight: 600;
          color: #3b82f6;
          background: white;
          transition: all .15s;
          white-space: nowrap;
        }
        .view-btn:hover { background: #eff6ff; border-color: #93c5fd; }
        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 10px;
        }
        .page-info { font-size: .8rem; color: #64748b; }
        .page-btns { display: flex; gap: 6px; }
        .page-btn {
          padding: 6px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 7px;
          font-size: .8rem;
          font-weight: 500;
          color: #475569;
          background: white;
          transition: all .15s;
        }
        .page-btn:hover:not(:disabled):not(.active) { background: #f8fafc; border-color: #cbd5e1; }
        .page-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
        .page-btn:disabled { opacity: .4; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default AuditLogsTable;
