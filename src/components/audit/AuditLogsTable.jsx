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
  REJECT:  { bg: '#fff1f2', color: '#e11d48' },
};

const AuditLogsTable = ({ logs = [], pagination = {}, loading, onPageChange }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  // 💡 User ගේ නමේ මුල් අකුර ගන්නා Function එක (Default Avatar එක සඳහා)
  const getInitial = (name) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="audit-table-container">
      <div className="table-responsive">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>IP Address</th>
              <th>Branch</th>
              <th>Severity</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="skeleton-row">
                  <td colSpan="9"><div className="skeleton-bar" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">
                  <div className="empty-state">
                    <span>📋</span>
                    <p>No audit logs found matching the filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const sev = SEVERITY_STYLES[log.severity] || { bg: '#f8fafc', color: '#64748b', dot: '#cbd5e1' };
                const act = ACTION_STYLES[log.action] || { bg: '#f1f5f9', color: '#475569' };
                const isExpanded = expandedRow === log._id;
                const currentUserName = log.userId?.name || log.user?.name || log.userName || log.performedBy || 'System';

                return (
                  <React.Fragment key={log._id}>
                    <tr className={`log-row ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleRow(log._id)}>
                      <td className="td-time">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </td>
                      
                      <td className="td-user">
                        {/* Table එක ඇතුලෙත් පොඩි Avatar එකක් පෙන්වීම */}
                        <div className="table-user-flex">
                          {log.userId?.image || log.user?.image ? (
                            <img src={log.userId?.image || log.user?.image} alt="User" className="table-avatar" />
                          ) : (
                            <div className="table-avatar-fallback">{getInitial(currentUserName)}</div>
                          )}
                          <div className="user-info-text">
                            <span className="user-fallback-name">{currentUserName}</span>
                            <span className="user-fallback-role">{log.userId?.role || log.user?.role || log.userRole || 'Staff'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="action-badge" style={{ backgroundColor: act.bg, color: act.color }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="td-module">{log.module}</td>
                      <td className="td-desc" title={log.description}>{log.description}</td>
                      <td className="td-ip">{log.ipAddress || '—'}</td>
                      
                      <td className="td-branch">
                        {log.branchId?.name || log.branch?.name || log.branchName || 'Main Branch'}
                      </td>

                      <td>
                        <span className="severity-badge" style={{ backgroundColor: sev.bg, color: sev.color }}>
                          <span className="sev-dot" style={{ backgroundColor: sev.dot }} />
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button className="view-btn" onClick={() => setSelectedLog(log)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <div className="page-info">
            Showing <b>{startIdx}</b> to <b>{endIdx}</b> of <b>{total}</b> entries
          </div>
          <div className="page-btns">
            <button className="page-btn" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={`page-${p}`} className={`page-btn ${page === p ? 'active' : ''}`} disabled={loading} onClick={() => onPageChange(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* 🛠️ PREMIUM AUDIT LOG DETAILS MODAL POPUP */}
      {selectedLog && (() => {
        const modalUserName = selectedLog.userId?.name || selectedLog.user?.name || selectedLog.userName || 'System';
        return (
          <div className="audit-modal-overlay" onClick={() => setSelectedLog(null)}>
            <div className="audit-modal-content" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Banner Area */}
              <div className={`modal-premium-banner ${selectedLog.severity}`}>
                <div className="banner-title-wrap">
                  <span className="banner-icon">🔍</span>
                  <div>
                    <h3>Audit Trail Details</h3>
                    <p>Log ID: {selectedLog._id}</p>
                  </div>
                </div>
                <button className="modal-close-icon-btn" onClick={() => setSelectedLog(null)}>×</button>
              </div>
              
              <div className="audit-modal-body">
                
                {/* 🌟 USER PROFILE CARD SECTION */}
                <div className="modal-user-profile-card">
                  {selectedLog.userId?.image || selectedLog.user?.image ? (
                    <img src={selectedLog.userId?.image || selectedLog.user?.image} alt="User Avatar" className="modal-large-avatar" />
                  ) : (
                    <div className="modal-large-avatar-fallback">{getInitial(modalUserName)}</div>
                  )}
                  <div className="modal-user-meta">
                    <h4>{modalUserName}</h4>
                    <span className="modal-user-role-badge">{selectedLog.userId?.role || selectedLog.user?.role || selectedLog.userRole || 'Staff'}</span>
                    <p className="modal-user-email-text">{selectedLog.userId?.email || selectedLog.user?.email || 'No email attached'}</p>
                  </div>
                </div>

                {/* Core Meta Details */}
                <div className="modal-section-title">Activity Information</div>
                <div className="modal-details-grid">
                  <div className="modal-detail-item"><strong>Action Triggered:</strong> <span className="modal-text-badge">{selectedLog.action}</span></div>
                  <div className="modal-detail-item"><strong>Module Impacted:</strong> <b style={{ color: '#0f172a' }}>{selectedLog.module}</b></div>
                  <div className="modal-detail-item"><strong>Timestamp:</strong> {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : '—'}</div>
                  <div className="modal-detail-item"><strong>Branch Code/Name:</strong> {selectedLog.branchId?.name || selectedLog.branch?.name || selectedLog.branchName || 'Main Branch'}</div>
                  <div className="modal-detail-item"><strong>IP Address:</strong> <span className="mono-text">{selectedLog.ipAddress || '—'}</span></div>
                  <div className="modal-detail-item"><strong>Severity Level:</strong> <span className={`modal-sev-label ${selectedLog.severity}`}>{selectedLog.severity}</span></div>
                </div>

                <div className="modal-section-title" style={{ marginTop: '16px' }}>Operation Description</div>
                <div className="modal-desc-box">{selectedLog.description}</div>

                <div className="modal-section-title" style={{ marginTop: '16px' }}>System Environment Context</div>
                <div className="modal-agent-box">
                  <strong>User Agent:</strong> {selectedLog.userAgent || '—'}
                </div>

                {/* Metadata JSON Changes Block */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <>
                    <div className="modal-section-title" style={{ marginTop: '16px' }}>Payload Metadata / Changes</div>
                    <div className="modal-json-box">
                      <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                    </div>
                  </>
                )}
              </div>

              <div className="audit-modal-footer">
                <button className="modal-footer-close-btn" onClick={() => setSelectedLog(null)}>Dismiss View</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🎨 PREMIUM STYLES */}
      <style>{`
        .audit-table-container { background: white; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.02); position: relative; }
        .table-responsive { width: 100%; overflow-x: auto; }
        .audit-table { width: 100%; border-collapse: collapse; text-align: left; font-size: .85rem; }
        .audit-table th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1.5px solid #e2e8f0; }
        .audit-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        
        /* Table User Profile Custom Flex */
        .table-user-flex { display: flex; align-items: center; gap: 10px; }
        .table-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid #e2e8f0; }
        .table-avatar-fallback { width: 32px; height: 32px; border-radius: 50%; background: #e0f2fe; color: #0369a1; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; border: 1.5px solid #bae6fd; }
        .user-info-text { display: flex; flex-direction: column; }

        .log-row { cursor: pointer; transition: background .1s; }
        .log-row:hover { background: #f8fafc; }
        .log-row.expanded { background: #f8fafc; }
        .td-time { white-space: nowrap; font-variant-numeric: tabular-nums; color: #64748b; }
        .user-fallback-name { font-weight: 600; color: #0f172a; font-size: 0.85rem; }
        .user-fallback-role { font-size: .72rem; color: #94a3b8; font-weight: 500; }
        .action-badge { padding: 4px 8px; border-radius: 6px; font-size: .72rem; font-weight: 700; display: inline-block; }
        .td-module { font-weight: 500; color: #1e293b; }
        .td-desc { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; }
        .severity-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 99px; font-size: .72rem; font-weight: 600; }
        .sev-dot { width: 6px; height: 6px; border-radius: 50%; }
        .td-ip { font-family: monospace; font-size: .76rem; color: #94a3b8; }
        .td-branch { color: #64748b; font-size: .8rem; }
        
        .view-btn { padding: 5px 12px; border: 1.5px solid #e2e8f0; border-radius: 7px; font-size: .75rem; font-weight: 600; color: #3b82f6; background: white; transition: all .15s; cursor: pointer; }
        .view-btn:hover { background: #eff6ff; border-color: #93c5fd; }
        
        .expanded-details-row td { padding: 0; background: #fafafa; border-bottom: 1px solid #e2e8f0; }
        .expanded-details-content { padding: 10px 24px; font-size: .8rem; color: #64748b; border-left: 3px solid #cbd5e1; }
        .details-grid { display: flex; gap: 24px; }
        .skeleton-bar { height: 16px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 4px; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ====== PREMIUM MODAL POPUP STYLES ====== */
        .audit-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s ease-out; }
        .audit-modal-content { background: white; width: 90%; max-width: 620px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 85vh; overflow: hidden; animation: modalScale 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
        
        /* Modal Banner */
        .modal-premium-banner { padding: 20px 24px; color: white; display: flex; align-items: center; justify-content: space-between; position: relative; background: #1e3a5f; }
        .modal-premium-banner.LOW { background: linear-gradient(135deg, #1e3a5f 0%, #16a34a 100%); }
        .modal-premium-banner.MEDIUM { background: linear-gradient(135deg, #1e3a5f 0%, #ca8a04 100%); }
        .modal-premium-banner.HIGH { background: linear-gradient(135deg, #1e3a5f 0%, #ea580c 100%); }
        .modal-premium-banner.CRITICAL { background: linear-gradient(135deg, #1e3a5f 0%, #dc2626 100%); }
        
        .banner-title-wrap { display: flex; align-items: center; gap: 14px; }
        .banner-icon { font-size: 1.6rem; background: rgba(255,255,255,0.2); padding: 6px; border-radius: 10px; }
        .modal-premium-banner h3 { margin: 0; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
        .modal-premium-banner p { margin: 2px 0 0 0; font-size: 0.75rem; opacity: 0.8; font-family: monospace; }
        .modal-close-icon-btn { background: transparent; border: none; font-size: 1.8rem; color: white; opacity: 0.7; cursor: pointer; transition: opacity 0.15s; padding: 0; line-height: 1; }
        .modal-close-icon-btn:hover { opacity: 1; }
        
        .audit-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; background: #fdfdfd; }
        
        /* 🌟 PREMIUM USER CARD STYLES */
        .modal-user-profile-card { display: flex; align-items: center; gap: 18px; background: white; padding: 16px; border-radius: 14px; border: 1.5px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01); margin-bottom: 20px; }
        .modal-large-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 0 0 2px #3b82f6; }
        .modal-large-avatar-fallback { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); color: #0369a1; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; border: 2px solid white; box-shadow: 0 0 0 2px #0ea5e9; }
        .modal-user-meta { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
        .modal-user-meta h4 { margin: 0; font-size: 1rem; color: #0f172a; font-weight: 700; }
        .modal-user-role-badge { background: #eff6ff; color: #2563eb; padding: 1px 8px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 2px; }
        .modal-user-email-text { margin: 4px 0 0 0; font-size: 0.78rem; color: #64748b; }

        .modal-section-title { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; margin-top: 4px; padding-bottom: 4px; border-bottom: 1px dashed #e2e8f0; }
        .modal-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 24px; margin-bottom: 20px; }
        .modal-detail-item { font-size: 0.85rem; color: #475569; line-height: 1.5; display: flex; align-items: center; justify-content: space-between; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #f8fafc; }
        .modal-detail-item strong { color: #64748b; font-weight: 500; }
        
        .mono-text { font-family: monospace; font-size: 0.78rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155; font-weight: 600; }
        .modal-text-badge { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; color: #1e3a5f; }
        
        .modal-sev-label { padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; }
        .modal-sev-label.LOW { background: #f0fdf4; color: #16a34a; }
        .modal-sev-label.MEDIUM { background: #fffbeb; color: #d97706; }
        .modal-sev-label.HIGH { background: #fff7ed; color: #ea580c; }
        .modal-sev-label.CRITICAL { background: #fef2f2; color: #dc2626; }

        .modal-desc-box { background: #fff; border: 1.5px solid #e2e8f0; padding: 14px 16px; border-radius: 10px; font-size: 0.85rem; color: #0f172a; line-height: 1.5; font-weight: 500; box-shadow: inset 0 1px 2px rgba(0,0,0,0.01); margin-bottom: 20px; }
        .modal-agent-box { font-size: 0.76rem; color: #64748b; line-height: 1.4; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .modal-json-box { background: #0f172a; padding: 14px; border-radius: 10px; overflow-x: auto; max-height: 180px; margin-top: 4px; }
        .modal-json-box pre { margin: 0; font-family: monospace; font-size: 0.76rem; color: #38bdf8; }

        .audit-modal-footer { padding: 14px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; background: #f8fafc; }
        .modal-footer-close-btn { padding: 9px 20px; background: #1e3a5f; color: white; border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .modal-footer-close-btn:hover { background: #2563eb; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AuditLogsTable;