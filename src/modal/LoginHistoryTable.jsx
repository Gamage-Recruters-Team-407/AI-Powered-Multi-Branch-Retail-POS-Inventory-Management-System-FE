import React, { useState } from 'react';

const STATUS_STYLES = {
  success: { bg: '#f0fdf4', color: '#16a34a', icon: '✓' },
  failed:  { bg: '#fef2f2', color: '#dc2626', icon: '✕' },
  blocked: { bg: '#fff7ed', color: '#ea580c', icon: '⊘' },
};

const LoginHistoryTable = ({ history, loading, onRevokeSession }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const now = new Date().getTime();

  const mockHistory = history?.length ? history : Array.from({ length: 10 }, (_, i) => ({
    _id: `session_${i + 1}`,
    createdAt: new Date(now - i * 3600000 * (i + 1)).toISOString(),
    userName: ['Admin User', 'John Manager', 'Sarah Cashier', 'Mike Admin', 'Priya Staff'][i % 5],
    email: ['admin@retailpos.com', 'john@retailpos.com', 'sarah@retailpos.com', 'mike@retailpos.com', 'priya@retailpos.com'][i % 5],
    status: i % 4 === 3 ? 'failed' : i % 7 === 6 ? 'blocked' : 'success',
    ipAddress: `203.${94 + i % 3}.${12 + i}.${200 + i}`,
    location: ['Colombo, LK', 'Kandy, LK', 'Galle, LK', 'Unknown', 'Colombo, LK'][i % 5],
    device: ['Chrome on Windows', 'Safari on macOS', 'Chrome on Android', 'Firefox on Windows', 'Safari on iPhone'][i % 5],
    // use deterministic sessionId and duration to avoid impure functions during render
    sessionId: `sess_${String(i + 1).padStart(4, '0')}`,
    active: i < 3,
    duration: i < 3 ? null : `${10 + ((i * 37) % 120)}m`,
    failReason: i % 4 === 3 ? 'Invalid password' : null,
  }));

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

  if (loading) {
    return (
      <div className="lh-loading">
        <div className="loading-spinner-sm" />
        Loading login history…
        <style>{`
          .lh-loading { display: flex; align-items: center; gap: 10px; padding: 40px 20px; color: #64748b; justify-content: center; }
          .loading-spinner-sm { width: 20px; height: 20px; border: 2.5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin .7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lh-wrap">
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
            {mockHistory.map((row) => {
              const s = STATUS_STYLES[row.status] || STATUS_STYLES.success;
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

      <style>{`
        .lh-wrap { background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
        .lh-scroll { overflow-x: auto; }
        .lh-table { width: 100%; border-collapse: collapse; font-size: .83rem; }
        .lh-table thead tr { background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; }
        .lh-table th {
          padding: 12px 14px;
          text-align: left;
          font-size: .7rem; font-weight: 700;
          color: #64748b;
          text-transform: uppercase; letter-spacing: .06em;
          white-space: nowrap;
        }
        .lh-row { border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background .1s; }
        .lh-row:hover, .lh-row.expanded { background: #f8fafc; }
        .lh-row:last-child { border-bottom: none; }
        .lh-table td { padding: 12px 14px; vertical-align: middle; }
        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          font-size: .73rem; font-weight: 700;
          text-transform: capitalize;
        }
        .lh-user { display: flex; align-items: center; gap: 9px; }
        .lh-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #dbeafe; color: #2563eb;
          font-size: .75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lh-name { font-weight: 600; color: #0f172a; white-space: nowrap; }
        .lh-email { font-size: .73rem; color: #94a3b8; }
        .lh-time { color: #64748b; font-size: .8rem; white-space: nowrap; }
        .lh-ip { font-family: monospace; font-size: .78rem; color: #475569; }
        .lh-loc { font-size: .8rem; color: #64748b; }
        .lh-device { font-size: .78rem; color: #64748b; max-width: 160px; }
        .session-active { color: #16a34a; font-size: .75rem; font-weight: 700; }
        .session-ended { color: #94a3b8; font-size: .75rem; }
        .revoke-btn {
          padding: 5px 11px;
          border: 1.5px solid #fee2e2;
          border-radius: 7px;
          font-size: .73rem; font-weight: 600;
          color: #ef4444; background: #fff5f5;
          transition: all .15s;
          white-space: nowrap;
        }
        .revoke-btn:hover { background: #fee2e2; }
        .lh-expanded-row { background: #f8fafc; }
        .lh-expanded-body {
          padding: 12px 20px;
          display: flex; flex-wrap: wrap; gap: 24px;
        }
        .exp-item { display: flex; flex-direction: column; gap: 3px; }
        .exp-key { font-size: .68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
        .exp-val { font-size: .8rem; color: #334155; font-weight: 500; }
        .mono { font-family: monospace; }
      `}</style>
    </div>
  );
};

export default LoginHistoryTable;
