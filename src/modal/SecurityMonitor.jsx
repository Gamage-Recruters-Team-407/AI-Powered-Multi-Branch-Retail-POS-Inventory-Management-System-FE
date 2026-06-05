import React, { useState, useMemo } from 'react';

const EVENT_TYPE_CONFIG = {
  BRUTE_FORCE:        { icon: '🔨', color: '#ef4444', label: 'Brute Force' },
  SUSPICIOUS_IP:      { icon: '🌐', color: '#f97316', label: 'Suspicious IP' },
  PRIVILEGE_ESCALATION: { icon: '⬆️', color: '#8b5cf6', label: 'Privilege Escalation' },
  DATA_EXFILTRATION:  { icon: '📤', color: '#dc2626', label: 'Data Exfiltration' },
  UNAUTHORIZED_ACCESS:{ icon: '🔒', color: '#f59e0b', label: 'Unauthorized Access' },
  MULTIPLE_FAILURES:  { icon: '⚡', color: '#6366f1', label: 'Multiple Failures' },
  SESSION_HIJACK:     { icon: '🎭', color: '#ec4899', label: 'Session Hijack' },
  CONFIG_CHANGE:      { icon: '⚙️', color: '#0ea5e9', label: 'Config Change' },
};

const SecurityEventCard = ({ event, onResolve }) => {
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const config = EVENT_TYPE_CONFIG[event.type] || { icon: '⚠️', color: '#f59e0b', label: event.type };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve?.(event._id, notes);
    } finally {
      setResolving(false);
      setShowNotes(false);
    }
  };

  const severityColor = {
    LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#ea580c', CRITICAL: '#dc2626',
  }[event.severity] || '#64748b';

  return (
    <div className={`sec-card ${event.resolved ? 'resolved' : ''}`} style={{ '--ev-color': config.color }}>
      <div className="sec-card-header">
        <div className="sec-icon-wrap">
          <span className="sec-icon">{config.icon}</span>
        </div>
        <div className="sec-card-meta">
          <div className="sec-card-type">{config.label}</div>
          <div className="sec-card-time">{event.createdAt ? new Date(event.createdAt).toLocaleString() : 'N/A'}</div>
        </div>
        <div className="sec-card-badges">
          <span className="sev-badge" style={{ color: severityColor, background: severityColor + '18' }}>
            {event.severity}
          </span>
          {event.resolved ? (
            <span className="resolved-badge">✓ Resolved</span>
          ) : (
            <span className="unresolved-badge">● Open</span>
          )}
        </div>
      </div>

      <p className="sec-card-desc">{event.description}</p>

      <div className="sec-card-details">
        {event.ipAddress && (
          <div className="sec-detail">
            <span className="sec-dk">IP</span>
            <span className="sec-dv">{event.ipAddress}</span>
          </div>
        )}
        {event.userName && (
          <div className="sec-detail">
            <span className="sec-dk">User</span>
            <span className="sec-dv">{event.userName}</span>
          </div>
        )}
        {event.attemptCount && (
          <div className="sec-detail">
            <span className="sec-dk">Attempts</span>
            <span className="sec-dv" style={{ color: '#ef4444', fontWeight: 700 }}>{event.attemptCount}</span>
          </div>
        )}
        {event.affectedResource && (
          <div className="sec-detail">
            <span className="sec-dk">Resource</span>
            <span className="sec-dv">{event.affectedResource}</span>
          </div>
        )}
      </div>

      {!event.resolved && (
        <div className="sec-card-actions">
          {showNotes ? (
            <div className="resolve-form">
              <textarea
                className="resolve-notes"
                placeholder="Resolution notes (optional)…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
              <div className="resolve-btns">
                <button className="btn-resolve-confirm" onClick={handleResolve} disabled={resolving}>
                  {resolving ? 'Resolving…' : 'Confirm Resolve'}
                </button>
                <button className="btn-resolve-cancel" onClick={() => setShowNotes(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-resolve" onClick={() => setShowNotes(true)}>
              Mark Resolved
            </button>
          )}
        </div>
      )}

      {event.resolved && event.resolvedBy && (
        <div className="resolved-info">
          Resolved by {event.resolvedBy} · {event.resolvedNotes}
        </div>
      )}

      <style>{`
        .sec-card {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-left: 4px solid var(--ev-color);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: box-shadow .2s;
        }
        .sec-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }
        .sec-card.resolved { opacity: .65; border-left-color: #94a3b8; }
        .sec-card-header { display: flex; align-items: flex-start; gap: 12px; }
        .sec-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 9px;
          background: color-mix(in srgb, var(--ev-color) 12%, white);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sec-icon { font-size: 1.1rem; }
        .sec-card-meta { flex: 1; }
        .sec-card-type { font-size: .9rem; font-weight: 700; color: #0f172a; }
        .sec-card-time { font-size: .72rem; color: #94a3b8; margin-top: 2px; }
        .sec-card-badges { display: flex; gap: 6px; flex-shrink: 0; align-items: center; flex-wrap: wrap; }
        .sev-badge {
          font-size: .68rem; font-weight: 700;
          padding: 3px 8px; border-radius: 99px;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .resolved-badge { font-size: .73rem; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 3px 9px; border-radius: 99px; }
        .unresolved-badge { font-size: .73rem; font-weight: 700; color: #ef4444; background: #fef2f2; padding: 3px 9px; border-radius: 99px; }
        .sec-card-desc { font-size: .85rem; color: #475569; line-height: 1.5; }
        .sec-card-details { display: flex; gap: 20px; flex-wrap: wrap; }
        .sec-detail { display: flex; flex-direction: column; gap: 2px; }
        .sec-dk { font-size: .68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
        .sec-dv { font-size: .8rem; color: #334155; font-weight: 600; font-family: monospace; }
        .sec-card-actions {}
        .btn-resolve {
          padding: 7px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: .8rem; font-weight: 600;
          color: #475569; background: #f8fafc;
          transition: all .15s;
        }
        .btn-resolve:hover { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
        .resolve-form { display: flex; flex-direction: column; gap: 8px; }
        .resolve-notes {
          width: 100%; padding: 8px 10px;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: .82rem; color: #334155;
          resize: vertical; outline: none;
          transition: border-color .15s;
        }
        .resolve-notes:focus { border-color: #3b82f6; }
        .resolve-btns { display: flex; gap: 8px; }
        .btn-resolve-confirm {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: .8rem; font-weight: 600;
          color: white; background: #16a34a;
          border: none; transition: background .15s;
        }
        .btn-resolve-confirm:hover:not(:disabled) { background: #15803d; }
        .btn-resolve-confirm:disabled { opacity: .6; cursor: not-allowed; }
        .btn-resolve-cancel {
          padding: 7px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: .8rem; font-weight: 500;
          color: #64748b; background: white;
          transition: background .15s;
        }
        .btn-resolve-cancel:hover { background: #f8fafc; }
        .resolved-info { font-size: .75rem; color: #94a3b8; font-style: italic; }
      `}</style>
    </div>
  );
};

const createMockEvents = () => [
  {
    _id: 'ev1', type: 'BRUTE_FORCE', severity: 'CRITICAL',
    description: '12 failed login attempts detected from IP 203.94.12.87 targeting admin account within 5 minutes.',
    ipAddress: '203.94.12.87', userName: 'admin@retailpos.com', attemptCount: 12,
    createdAt: new Date(Date.now() - 900000).toISOString(), resolved: false,
  },
  {
    _id: 'ev2', type: 'SUSPICIOUS_IP', severity: 'HIGH',
    description: 'Login from unusual geographic location detected. User logged in from Singapore but last session was from Colombo (2h ago).',
    ipAddress: '103.252.118.55', userName: 'john@retailpos.com',
    createdAt: new Date(Date.now() - 7200000).toISOString(), resolved: false,
  },
  {
    _id: 'ev3', type: 'PRIVILEGE_ESCALATION', severity: 'HIGH',
    description: 'User attempted to access admin-only endpoint /api/users/bulk-delete without sufficient privileges.',
    userName: 'sarah@retailpos.com', affectedResource: '/api/users/bulk-delete',
    createdAt: new Date(Date.now() - 14400000).toISOString(), resolved: false,
  },
  {
    _id: 'ev4', type: 'DATA_EXFILTRATION', severity: 'CRITICAL',
    description: 'Unusually large data export detected. User exported 15,000 customer records in a single CSV download.',
    userName: 'mike@retailpos.com', affectedResource: 'Customer Database',
    createdAt: new Date(Date.now() - 86400000).toISOString(), resolved: true,
    resolvedBy: 'Admin User', resolvedNotes: 'Verified as authorized bulk export for CRM migration.',
  },
  {
    _id: 'ev5', type: 'MULTIPLE_FAILURES', severity: 'MEDIUM',
    description: '5 consecutive failed POS transaction authorizations from terminal T-003 at Main Branch.',
    affectedResource: 'Terminal T-003 · Main Branch', attemptCount: 5,
    createdAt: new Date(Date.now() - 172800000).toISOString(), resolved: true,
    resolvedBy: 'John Manager', resolvedNotes: 'Hardware issue confirmed. Terminal replaced.',
  },
  {
    _id: 'ev6', type: 'CONFIG_CHANGE', severity: 'MEDIUM',
    description: 'System configuration modified: Tax rate changed from 8% to 12% by admin user outside business hours.',
    userName: 'admin@retailpos.com', affectedResource: 'Tax Configuration',
    createdAt: new Date(Date.now() - 259200000).toISOString(), resolved: false,
  },
];

const SecurityMonitor = ({ events, loading, onResolve }) => {
  const [filter, setFilter] = useState('all');

  const mockEvents = events?.length ? events : createMockEvents();

  const filtered = filter === 'all' ? mockEvents
    : filter === 'open' ? mockEvents.filter(e => !e.resolved)
    : mockEvents.filter(e => e.resolved);

  const openCount = mockEvents.filter(e => !e.resolved).length;

  return (
    <div className="sec-monitor">
      {/* Header with filter tabs */}
      <div className="sec-monitor-header">
        <div className="sec-monitor-tabs">
          <button
            className={`sec-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events <span className="tab-count">{mockEvents.length}</span>
          </button>
          <button
            className={`sec-tab ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Open <span className="tab-count alert">{openCount}</span>
          </button>
          <button
            className={`sec-tab ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved <span className="tab-count">{mockEvents.length - openCount}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="sec-loading">Loading security events…</div>
      ) : filtered.length === 0 ? (
        <div className="sec-empty">
          <span style={{ fontSize: '2rem' }}>🛡️</span>
          <div>No security events found</div>
        </div>
      ) : (
        <div className="sec-events-grid">
          {filtered.map(ev => (
            <SecurityEventCard key={ev._id} event={ev} onResolve={onResolve} />
          ))}
        </div>
      )}

      <style>{`
        .sec-monitor { display: flex; flex-direction: column; gap: 16px; }
        .sec-monitor-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .sec-monitor-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .sec-tab {
          padding: 7px 14px; border-radius: 7px;
          font-size: .82rem; font-weight: 600;
          color: #64748b; background: transparent;
          display: flex; align-items: center; gap: 6px;
          transition: all .15s;
        }
        .sec-tab.active { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .tab-count {
          font-size: .68rem; padding: 2px 7px; border-radius: 99px;
          background: #e2e8f0; color: #475569; font-weight: 700;
        }
        .tab-count.alert { background: #fee2e2; color: #ef4444; }
        .sec-loading, .sec-empty {
          text-align: center; padding: 50px 20px; color: #94a3b8;
          font-size: .9rem;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .sec-events-grid { display: flex; flex-direction: column; gap: 12px; }
      `}</style>
    </div>
  );
};

export default SecurityMonitor;
