import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSecurityEvents } from '../services/auditApi';
import toast from 'react-hot-toast';

const EVENT_TYPE_CONFIG = {
  BRUTE_FORCE:        { icon: '🔨', color: '#ef4444', label: 'Brute Force Attack', severity: 'HIGH' },
  SUSPICIOUS_IP:      { icon: '🌐', color: '#f97316', label: 'Suspicious IP Detected', severity: 'MEDIUM' },
  PRIVILEGE_ESCALATION: { icon: '⬆️', color: '#8b5cf6', label: 'Privilege Escalation Attempt', severity: 'HIGH' },
  DATA_EXFILTRATION:  { icon: '📤', color: '#dc2626', label: 'Data Exfiltration Attempt', severity: 'CRITICAL' },
  UNAUTHORIZED_ACCESS:{ icon: '🔒', color: '#f59e0b', label: 'Unauthorized Access Attempt', severity: 'HIGH' },
  MULTIPLE_FAILURES:  { icon: '⚡', color: '#6366f1', label: 'Multiple Failures Detected', severity: 'MEDIUM' },
  SESSION_HIJACK:     { icon: '🎭', color: '#ec4899', label: 'Session Hijack Attempt', severity: 'CRITICAL' },
  CONFIG_CHANGE:      { icon: '⚙️', color: '#0ea5e9', label: 'Security Config Change', severity: 'MEDIUM' },
};

const SecurityEventCard = ({ event, onResolve }) => {
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const config = EVENT_TYPE_CONFIG[event.type] || { 
    icon: '⚠️', 
    color: '#ef4444', 
    label: event.type || 'Security Threat',
    severity: event.severity || 'MEDIUM'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error('Please enter resolution notes');
      return;
    }
    setResolving(true);
    try {
      if (onResolve) {
        await onResolve(event._id, notes);
        toast.success('Security event resolved successfully');
      }
      setShowNotes(false);
      setNotes('');
    } catch (err) {
      toast.error('Failed to resolve event: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`sec-event-card ${event.resolved ? 'resolved' : ''}`} style={{ '--type-color': config.color }}>
      <div className="sec-card-header">
        <div className="sec-type-badge">
          <span className="sec-icon">{config.icon}</span>
          <span className="sec-label">{config.label}</span>
        </div>
        <div className="sec-header-right">
          <span className={`sec-sev-badge ${event.severity?.toLowerCase() || config.severity?.toLowerCase()}`}>
            {event.severity || config.severity}
          </span>
          <span className="sec-time">{getRelativeTime(event.createdAt)}</span>
        </div>
      </div>

      <p className="sec-desc">{event.description}</p>

      <div className="sec-meta-grid">
        <div><strong>IP Address:</strong> <span>{event.ipAddress || '—'}</span></div>
        <div><strong>User:</strong> <span>{event.userName || event.userId?.name || 'System'}</span></div>
        <div><strong>Module:</strong> <span>{event.module || 'SECURITY'}</span></div>
        <div><strong>Time:</strong> <span>{event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</span></div>
      </div>

      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="sec-metadata">
          <strong>Details:</strong>
          <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
        </div>
      )}

      {event.resolved ? (
        <div className="sec-resolved-box">
          <div className="resolved-by">✅ Resolved</div>
          {event.resolutionNotes && <p className="resolved-notes">"{event.resolutionNotes}"</p>}
          {event.resolvedBy && <p className="resolved-by-name">Resolved by: {event.resolvedBy.name || 'Admin'}</p>}
        </div>
      ) : (
        <div className="sec-actions">
          {!showNotes ? (
            <button className="sec-btn-resolve" onClick={() => setShowNotes(true)}>
              Take Action / Resolve
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="sec-resolve-form">
              <textarea
                placeholder="Enter resolution notes (e.g., Blocked IP, Contacted user, etc.)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={resolving}
                required
                rows={3}
              />
              <div className="form-btns">
                <button type="button" className="sec-btn-cancel" onClick={() => setShowNotes(false)} disabled={resolving}>
                  Cancel
                </button>
                <button type="submit" className="sec-btn-submit" disabled={resolving}>
                  {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

const SecurityMonitor = ({ events: propEvents = [], onResolve, loading: propLoading = false }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const [localEvents, setLocalEvents] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLocalLoading(true);
    try {
      const response = await getSecurityEvents({ limit: 100 });
      const eventsData = response.data || response.events || [];
      setLocalEvents(eventsData);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
      setLocalEvents([]);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propEvents && propEvents.length > 0) {
      setLocalEvents(propEvents);
    } else {
      fetchEvents();
    }
  }, [propEvents, fetchEvents]);

  const eventsArray = Array.isArray(localEvents) ? localEvents : [];

  const filtered = useMemo(() => {
    return eventsArray.filter(ev => {
      if (activeTab === 'active' && ev.resolved) return false;
      if (activeTab === 'resolved' && !ev.resolved) return false;

      if (search.trim() !== '') {
        const query = search.toLowerCase();
        return (
          (ev.type || '').toLowerCase().includes(query) ||
          (ev.description || '').toLowerCase().includes(query) ||
          (ev.ipAddress || '').toLowerCase().includes(query) ||
          (ev.userName || ev.userId?.name || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [eventsArray, activeTab, search]);

  const counts = useMemo(() => {
    return {
      all: eventsArray.length,
      active: eventsArray.filter(e => !e.resolved).length,
      resolved: eventsArray.filter(e => e.resolved).length,
    };
  }, [eventsArray]);

  const isLoading = propLoading || localLoading;

  if (isLoading) {
    return (
      <div className="sec-loading">
        <div className="spinner" />
        <p>Loading security events...</p>
        <style>{`
          .sec-loading { text-align: center; padding: 60px; color: #64748b; }
          .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 16px auto; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sec-monitor">
      <div className="sec-monitor-header">
        <div className="sec-monitor-tabs">
          <button className={`sec-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active Threats <span className="tab-count active">{counts.active}</span>
          </button>
          <button className={`sec-tab ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>
            Resolved Cases <span className="tab-count resolved">{counts.resolved}</span>
          </button>
          <button className={`sec-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All History <span className="tab-count all">{counts.all}</span>
          </button>
        </div>

        <div className="sec-search-wrap">
          <input
            type="text"
            className="sec-search-input"
            placeholder="Search by IP, user, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sec-empty">
          <span className="empty-icon">🛡️</span>
          <h4>No security events found</h4>
          <p>All systems operational. No active threats detected.</p>
        </div>
      ) : (
        <div className="sec-events-grid">
          {filtered.map(ev => (
            <SecurityEventCard key={ev._id} event={ev} onResolve={onResolve} />
          ))}
        </div>
      )}

      <style>{`
        .sec-monitor { display: flex; flex-direction: column; gap: 20px; }
        .sec-monitor-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; background: white; padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .sec-monitor-tabs { display: flex; gap: 8px; background: #f8fafc; padding: 4px; border-radius: 10px; }
        .sec-tab { padding: 8px 16px; border-radius: 8px; font-size: .875rem; font-weight: 500; color: #64748b; background: transparent; display: flex; align-items: center; gap: 8px; transition: all .2s; border: none; cursor: pointer; }
        .sec-tab.active { background: white; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
        .tab-count { font-size: .7rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
        .tab-count.active { background: #fee2e2; color: #dc2626; }
        .tab-count.resolved { background: #dcfce7; color: #16a34a; }
        .tab-count.all { background: #e2e8f0; color: #475569; }
        
        .sec-search-wrap { min-width: 260px; }
        .sec-search-input { width: 100%; padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .875rem; transition: all .2s; }
        .sec-search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

        .sec-events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
        
        .sec-event-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; border-top: 4px solid var(--type-color); display: flex; flex-direction: column; gap: 12px; transition: all .2s; }
        .sec-event-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-2px); }
        .sec-event-card.resolved { border-top-color: #cbd5e1; opacity: 0.85; background: #f8fafc; }
        
        .sec-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .sec-type-badge { display: flex; align-items: center; gap: 8px; }
        .sec-icon { font-size: 1.2rem; }
        .sec-label { font-weight: 700; font-size: .9rem; color: #0f172a; }
        .sec-header-right { display: flex; align-items: center; gap: 10px; }
        .sec-time { font-size: .7rem; color: #94a3b8; }
        
        .sec-sev-badge { font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
        .sec-sev-badge.low { background: #f0fdf4; color: #16a34a; }
        .sec-sev-badge.medium { background: #fffbeb; color: #d97706; }
        .sec-sev-badge.high { background: #fff7ed; color: #ea580c; }
        .sec-sev-badge.critical { background: #fef2f2; color: #dc2626; }

        .sec-desc { font-size: .875rem; color: #334155; margin: 0; line-height: 1.5; font-weight: 500; }
        
        .sec-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: .8rem; }
        .sec-meta-grid div { color: #64748b; display: flex; justify-content: space-between; align-items: center; }
        .sec-meta-grid span { color: #1e293b; font-weight: 600; }

        .sec-metadata { background: #f1f5f9; padding: 10px; border-radius: 8px; font-size: .75rem; }
        .sec-metadata pre { margin: 8px 0 0 0; font-size: .7rem; overflow-x: auto; background: #0f172a; color: #e2e8f0; padding: 8px; border-radius: 6px; }

        .sec-btn-resolve { width: 100%; padding: 10px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; transition: all .2s; }
        .sec-btn-resolve:hover { background: #fee2e2; border-color: #fca5a5; }
        
        .sec-resolve-form { display: flex; flex-direction: column; gap: 10px; }
        .sec-resolve-form textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: .8rem; resize: vertical; font-family: inherit; }
        .form-btns { display: flex; gap: 10px; justify-content: flex-end; }
        .sec-btn-cancel { padding: 6px 14px; background: #f1f5f9; color: #475569; border: none; border-radius: 6px; font-size: .8rem; font-weight: 500; cursor: pointer; }
        .sec-btn-submit { padding: 6px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; font-size: .8rem; font-weight: 500; cursor: pointer; }
        .sec-btn-submit:hover { background: #15803d; }
        
        .sec-resolved-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; }
        .resolved-by { font-weight: 700; color: #16a34a; margin-bottom: 6px; }
        .resolved-notes { margin: 6px 0 0 0; color: #14532d; font-style: italic; font-size: .8rem; }
        .resolved-by-name { margin: 6px 0 0 0; font-size: .75rem; color: #64748b; }

        .sec-empty { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
        .sec-empty h4 { margin: 0 0 8px 0; color: #1e293b; font-size: 1.1rem; }
        .sec-empty p { margin: 0; color: #64748b; }
      `}</style>
    </div>
  );
};

export default SecurityMonitor;