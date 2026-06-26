import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { getSecurityEvents } from '../services/auditApi';
import { ThemeContext } from '../../src/pages/audit/AuditSecurityPage';
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

// ✅ Security Event Detail Modal
const SecurityEventModal = ({ event, onClose, onResolve }) => {
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const context = useContext(ThemeContext);
  const isDark = context?.theme === 'dark';

  const config = EVENT_TYPE_CONFIG[event?.type] || { 
    icon: '⚠️', 
    color: '#ef4444', 
    label: event?.type || 'Security Threat',
    severity: event?.severity || 'MEDIUM'
  };

  const getRelativeTime = (date) => {
    if (!date) return '—';
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

  const handleResolve = async () => {
    if (!notes.trim()) {
      toast.error('Please enter resolution notes');
      return;
    }
    setResolving(true);
    try {
      if (onResolve) {
        await onResolve(event._id, notes);
        toast.success('Security event resolved successfully');
        onClose();
      }
    } catch (err) {
      toast.error('Failed to resolve event: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  if (!event) return null;

  return (
    <div className={`security-modal-overlay theme-${isDark ? 'dark' : 'light'}`} onClick={onClose}>
      <div className={`security-modal-content theme-${isDark ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="security-modal-header" style={{ borderTopColor: config.color }}>
          <div className="security-modal-header-left">
            <span className="security-modal-icon">{config.icon}</span>
            <div>
              <h3>{config.label}</h3>
              <p>Event ID: {event._id}</p>
            </div>
          </div>
          <button className="security-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="security-modal-body">
          {/* Status Badge */}
          <div className="security-modal-status">
            <span className={`status-badge ${event.resolved ? 'resolved' : 'active'}`}>
              {event.resolved ? '✅ Resolved' : '🟡 Active'}
            </span>
            <span className="security-modal-time">{getRelativeTime(event.createdAt)}</span>
          </div>

          {/* Description */}
          <div className="security-modal-description">
            <p>{event.description}</p>
          </div>

          {/* Details Grid */}
          <div className="security-modal-grid">
            <div className="security-modal-item">
              <span className="modal-item-label">Severity</span>
              <span className={`severity-tag ${event.severity?.toLowerCase() || config.severity?.toLowerCase()}`}>
                {event.severity || config.severity}
              </span>
            </div>
            <div className="security-modal-item">
              <span className="modal-item-label">Module</span>
              <span className="modal-item-value">{event.module || 'SECURITY'}</span>
            </div>
            <div className="security-modal-item">
              <span className="modal-item-label">IP Address</span>
              <span className="modal-item-value mono">{event.ipAddress || '—'}</span>
            </div>
            <div className="security-modal-item">
              <span className="modal-item-label">User</span>
              <span className="modal-item-value">{event.userName || event.userId?.name || 'System'}</span>
            </div>
            <div className="security-modal-item">
              <span className="modal-item-label">Time</span>
              <span className="modal-item-value">{event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}</span>
            </div>
            <div className="security-modal-item">
              <span className="modal-item-label">Status</span>
              <span className={`modal-item-value ${event.resolved ? 'text-green' : 'text-yellow'}`}>
                {event.resolved ? 'Resolved' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="security-modal-metadata">
              <h4>📋 Additional Details</h4>
              <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
            </div>
          )}

          {/* Resolution Section */}
          {event.resolved ? (
            <div className="security-modal-resolved">
              <div className="resolved-badge">✅ Resolved</div>
              {event.resolutionNotes && (
                <div className="resolved-notes">
                  <strong>Resolution Notes:</strong>
                  <p>{event.resolutionNotes}</p>
                </div>
              )}
              {event.resolvedBy && (
                <div className="resolved-by">
                  <strong>Resolved by:</strong> {event.resolvedBy.name || 'Admin'}
                </div>
              )}
            </div>
          ) : (
            <div className="security-modal-resolve">
              {!showNotes ? (
                <button className="resolve-trigger-btn" onClick={() => setShowNotes(true)}>
                  ✏️ Take Action / Resolve
                </button>
              ) : (
                <div className="resolve-form">
                  <textarea
                    placeholder="Enter resolution notes (e.g., Blocked IP, Contacted user, etc.)..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    disabled={resolving}
                    rows={3}
                  />
                  <div className="resolve-form-btns">
                    <button className="resolve-cancel" onClick={() => setShowNotes(false)} disabled={resolving}>
                      Cancel
                    </button>
                    <button className="resolve-submit" onClick={handleResolve} disabled={resolving}>
                      {resolving ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="security-modal-footer">
          <button className="security-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <style>{`
          .security-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: modalFadeIn 0.2s ease-out;
          }

          .security-modal-content {
            background: var(--card-bg, #ffffff);
            border-radius: 16px;
            width: 92%;
            max-width: 580px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            animation: modalScaleIn 0.25s ease-out;
          }

          .theme-dark .security-modal-content {
            background: #1e293b;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          }

          .security-modal-header {
            padding: 20px 24px;
            border-top: 4px solid var(--border-color, #e2e8f0);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-secondary, #f8fafc);
            flex-shrink: 0;
          }

          .theme-dark .security-modal-header {
            background: #2d3a4f;
          }

          .security-modal-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .security-modal-icon {
            font-size: 1.5rem;
            background: rgba(0,0,0,0.05);
            padding: 8px 10px;
            border-radius: 10px;
          }

          .theme-dark .security-modal-icon {
            background: rgba(255,255,255,0.05);
          }

          .security-modal-header-left h3 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-primary, #0f172a);
          }

          .theme-dark .security-modal-header-left h3 {
            color: #f1f5f9;
          }

          .security-modal-header-left p {
            margin: 2px 0 0;
            font-size: 0.7rem;
            color: var(--text-muted, #94a3b8);
            font-family: monospace;
          }

          .security-modal-close {
            background: rgba(0,0,0,0.05);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 1.2rem;
            color: var(--text-secondary, #475569);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
          }

          .security-modal-close:hover {
            background: rgba(0,0,0,0.1);
          }

          .theme-dark .security-modal-close {
            color: #cbd5e1;
            background: rgba(255,255,255,0.05);
          }

          .theme-dark .security-modal-close:hover {
            background: rgba(255,255,255,0.1);
          }

          .security-modal-body {
            padding: 20px 24px;
            overflow-y: auto;
            flex: 1;
            background: var(--bg-primary, #ffffff);
          }

          .theme-dark .security-modal-body {
            background: #0f172a;
          }

          .security-modal-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
          }

          .status-badge.active {
            background: #fef3c7;
            color: #d97706;
          }

          .status-badge.resolved {
            background: #d1fae5;
            color: #059669;
          }

          .theme-dark .status-badge.active {
            background: #3d2a00;
            color: #fbbf24;
          }

          .theme-dark .status-badge.resolved {
            background: #0a2e1a;
            color: #34d399;
          }

          .security-modal-time {
            font-size: 0.78rem;
            color: var(--text-muted, #94a3b8);
          }

          .security-modal-description {
            background: var(--bg-secondary, #f8fafc);
            padding: 14px 16px;
            border-radius: 10px;
            margin-bottom: 18px;
            border: 1px solid var(--border-color, #e2e8f0);
          }

          .theme-dark .security-modal-description {
            background: #1e293b;
            border-color: #334155;
          }

          .security-modal-description p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-primary, #0f172a);
            line-height: 1.6;
          }

          .theme-dark .security-modal-description p {
            color: #e2e8f0;
          }

          .security-modal-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 18px;
          }

          .security-modal-item {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 8px 12px;
            background: var(--bg-secondary, #f8fafc);
            border-radius: 8px;
            border: 1px solid var(--border-color, #f1f5f9);
          }

          .theme-dark .security-modal-item {
            background: #1e293b;
            border-color: #334155;
          }

          .modal-item-label {
            font-size: 0.6rem;
            font-weight: 700;
            color: var(--text-muted, #94a3b8);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .modal-item-value {
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-primary, #0f172a);
          }

          .theme-dark .modal-item-value {
            color: #e2e8f0;
          }

          .modal-item-value.mono {
            font-family: monospace;
            font-size: 0.8rem;
          }

          .modal-item-value.text-green {
            color: #16a34a;
          }

          .modal-item-value.text-yellow {
            color: #d97706;
          }

          .severity-tag {
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 700;
            display: inline-block;
            width: fit-content;
          }

          .severity-tag.low { background: #f0fdf4; color: #16a34a; }
          .severity-tag.medium { background: #fffbeb; color: #d97706; }
          .severity-tag.high { background: #fff7ed; color: #ea580c; }
          .severity-tag.critical { background: #fef2f2; color: #dc2626; }

          .theme-dark .severity-tag.low { background: #0a2e1a; color: #4ade80; }
          .theme-dark .severity-tag.medium { background: #3d2a00; color: #fbbf24; }
          .theme-dark .severity-tag.high { background: #3d1a00; color: #fb923c; }
          .theme-dark .severity-tag.critical { background: #3d0a0a; color: #f87171; }

          .security-modal-metadata {
            background: var(--bg-secondary, #f8fafc);
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid var(--border-color, #e2e8f0);
            margin-bottom: 16px;
          }

          .theme-dark .security-modal-metadata {
            background: #1e293b;
            border-color: #334155;
          }

          .security-modal-metadata h4 {
            margin: 0 0 8px 0;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted, #94a3b8);
          }

          .security-modal-metadata pre {
            margin: 0;
            font-family: monospace;
            font-size: 0.7rem;
            color: var(--text-primary, #334155);
            background: var(--bg-tertiary, #f1f5f9);
            padding: 8px;
            border-radius: 6px;
            overflow-x: auto;
          }

          .theme-dark .security-modal-metadata pre {
            color: #e2e8f0;
            background: #0f172a;
          }

          .security-modal-resolved {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 14px 16px;
            border-radius: 10px;
          }

          .theme-dark .security-modal-resolved {
            background: #0a2e1a;
            border-color: #166534;
          }

          .resolved-badge {
            font-weight: 700;
            color: #16a34a;
            margin-bottom: 6px;
          }

          .resolved-notes {
            margin-top: 8px;
          }

          .resolved-notes strong {
            font-size: 0.75rem;
            color: var(--text-muted, #94a3b8);
          }

          .resolved-notes p {
            margin: 4px 0 0;
            font-size: 0.85rem;
            color: var(--text-primary, #0f172a);
          }

          .theme-dark .resolved-notes p {
            color: #e2e8f0;
          }

          .resolved-by {
            margin-top: 8px;
            font-size: 0.75rem;
            color: var(--text-muted, #94a3b8);
          }

          .security-modal-resolve {
            margin-top: 4px;
          }

          .resolve-trigger-btn {
            width: 100%;
            padding: 10px;
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .resolve-trigger-btn:hover {
            background: #fee2e2;
          }

          .theme-dark .resolve-trigger-btn {
            background: #3d0a0a;
            color: #f87171;
            border-color: #7f1d1d;
          }

          .theme-dark .resolve-trigger-btn:hover {
            background: #5c1a1a;
          }

          .resolve-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .resolve-form textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            font-size: 0.8rem;
            resize: vertical;
            font-family: inherit;
            background: var(--card-bg, #ffffff);
            color: var(--text-primary, #0f172a);
          }

          .theme-dark .resolve-form textarea {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
          }

          .resolve-form-btns {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }

          .resolve-cancel {
            padding: 6px 14px;
            background: var(--bg-tertiary, #f1f5f9);
            color: var(--text-secondary, #475569);
            border: none;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
          }

          .theme-dark .resolve-cancel {
            background: #2d3a4f;
            color: #cbd5e1;
          }

          .resolve-submit {
            padding: 6px 14px;
            background: #16a34a;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
          }

          .resolve-submit:hover {
            background: #15803d;
          }

          .resolve-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .security-modal-footer {
            padding: 14px 24px;
            border-top: 1px solid var(--border-color, #e2e8f0);
            display: flex;
            justify-content: flex-end;
            background: var(--bg-secondary, #f8fafc);
            flex-shrink: 0;
          }

          .theme-dark .security-modal-footer {
            border-top-color: #334155;
            background: #1e293b;
          }

          .security-modal-close-btn {
            padding: 8px 20px;
            background: #1e3a5f;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
          }

          .security-modal-close-btn:hover {
            background: #2563eb;
          }

          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modalScaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @media (max-width: 600px) {
            .security-modal-grid {
              grid-template-columns: 1fr;
            }

            .security-modal-content {
              width: 95%;
              max-height: 95vh;
            }

            .security-modal-body {
              padding: 16px;
            }

            .security-modal-header {
              padding: 16px 18px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

const SecurityMonitor = ({ events: propEvents = [], onResolve, loading: propLoading = false }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const [localEvents, setLocalEvents] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const context = useContext(ThemeContext);
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  const fetchEvents = useCallback(async () => {
    setLocalLoading(true);
    try {
      const response = await getSecurityEvents({ limit: 100 });
      const eventsData = response.data || response.events || [];
      setLocalEvents(eventsData);
      setCurrentPage(1);
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
      setCurrentPage(1);
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

  // ✅ Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // ✅ Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const isLoading = propLoading || localLoading;

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const getSeverityClass = (severity) => {
    return severity?.toLowerCase() || 'medium';
  };

  const getStatusBadge = (resolved) => {
    return resolved ? 'resolved' : 'active';
  };

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
        hour12: true
      });
    } catch {
      return '—';
    }
  };

  if (isLoading) {
    return (
      <div className={`sec-loading theme-${theme}`}>
        <div className="spinner" />
        <p>Loading security events...</p>
        <style>{`
          .sec-loading {
            text-align: center;
            padding: 60px;
            color: var(--text-muted, #64748b);
            background: var(--card-bg, #ffffff);
            border-radius: 14px;
            border: 1px solid var(--border-color, #e2e8f0);
          }
          .theme-dark .sec-loading {
            background: #1e293b;
            border-color: #334155;
            color: #94a3b8;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color, #e2e8f0);
            border-top-color: #3b82f6;
            border-radius: 50%;
            margin: 0 auto 16px auto;
            animation: spin 0.8s linear infinite;
          }
          .theme-dark .spinner {
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
    <div className={`sec-monitor theme-${theme}`}>
      {/* Header */}
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

      {/* ✅ Table View */}
      {filtered.length === 0 ? (
        <div className="sec-empty">
          <span className="empty-icon">🛡️</span>
          <h4>No security events found</h4>
          <p>All systems operational. No active threats detected.</p>
        </div>
      ) : (
        <>
          <div className="sec-table-wrap">
            <table className="sec-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((ev) => {
                  const config = EVENT_TYPE_CONFIG[ev.type] || { icon: '⚠️', label: ev.type || 'Security Threat' };
                  return (
                    <tr key={ev._id} className={`sec-row ${ev.resolved ? 'resolved' : ''}`}>
                      <td>
                        <div className="sec-type-cell">
                          <span className="sec-type-icon">{config.icon}</span>
                          <span className="sec-type-label">{config.label}</span>
                        </div>
                      </td>
                      <td className="sec-desc-cell" title={ev.description}>
                        {ev.description}
                      </td>
                      <td>
                        <span className={`severity-badge ${getSeverityClass(ev.severity || config.severity)}`}>
                          {ev.severity || config.severity}
                        </span>
                      </td>
                      <td className="sec-user-cell">{ev.userName || ev.userId?.name || 'System'}</td>
                      <td className="sec-ip-cell">{ev.ipAddress || '—'}</td>
                      <td className="sec-time-cell">{formatTimestamp(ev.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(ev.resolved)}`}>
                          {ev.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="sec-view-btn" onClick={() => handleViewEvent(ev)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination - Without "Showing" text */}
          {totalPages > 1 && (
            <div className="sec-pagination">
              <div className="page-btns">
                <button 
                  className="page-btn" 
                  disabled={currentPage <= 1} 
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, index, array) => (
                    <React.Fragment key={`page-wrapper-${p}`}>
                      {index > 0 && array[index - 1] !== p - 1 && (
                        <span className="page-ellipsis">…</span>
                      )}
                      <button 
                        className={`page-btn ${currentPage === p ? 'active' : ''}`} 
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button 
                  className="page-btn" 
                  disabled={currentPage >= totalPages} 
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
              
              <div className="page-size-selector">
                <select 
                  value={pageSize} 
                  onChange={handlePageSizeChange}
                  className="page-size-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="page-size-label">per page</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ✅ Security Event Modal */}
      {isModalOpen && selectedEvent && (
        <SecurityEventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onResolve={onResolve}
        />
      )}

      <style>{`
        .sec-monitor {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sec-monitor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: var(--card-bg, #ffffff);
          padding: 16px 20px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
        }

        .theme-dark .sec-monitor-header {
          background: #1e293b;
          border-color: #334155;
        }

        .sec-monitor-tabs {
          display: flex;
          gap: 8px;
          background: var(--bg-secondary, #f8fafc);
          padding: 4px;
          border-radius: 10px;
        }

        .theme-dark .sec-monitor-tabs {
          background: #2d3a4f;
        }

        .sec-tab {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: .875rem;
          font-weight: 500;
          color: var(--text-muted, #64748b);
          background: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all .2s;
          border: none;
          cursor: pointer;
        }

        .theme-dark .sec-tab {
          color: #94a3b8;
        }

        .sec-tab.active {
          background: var(--card-bg, #ffffff);
          color: var(--text-primary, #1e293b);
          box-shadow: 0 1px 3px rgba(0,0,0,.1);
        }

        .theme-dark .sec-tab.active {
          background: #2d3a4f;
          color: #f1f5f9;
        }

        .tab-count {
          font-size: .7rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
        }

        .tab-count.active {
          background: #fee2e2;
          color: #dc2626;
        }

        .theme-dark .tab-count.active {
          background: #3d0a0a;
          color: #f87171;
        }

        .tab-count.resolved {
          background: #dcfce7;
          color: #16a34a;
        }

        .theme-dark .tab-count.resolved {
          background: #0a2e1a;
          color: #4ade80;
        }

        .tab-count.all {
          background: #e2e8f0;
          color: #475569;
        }

        .theme-dark .tab-count.all {
          background: #2d3a4f;
          color: #94a3b8;
        }

        .sec-search-wrap {
          min-width: 260px;
        }

        .sec-search-input {
          width: 100%;
          padding: 8px 14px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          font-size: .875rem;
          transition: all .2s;
          background: var(--input-bg, #ffffff);
          color: var(--text-primary, #0f172a);
        }

        .theme-dark .sec-search-input {
          background: #2d3a4f;
          border-color: #475569;
          color: #f1f5f9;
        }

        .sec-search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.1);
        }

        /* ========================================
           TABLE STYLES
           ======================================== */
        .sec-table-wrap {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          overflow: hidden;
        }

        .theme-dark .sec-table-wrap {
          background: #1e293b;
          border-color: #334155;
        }

        .sec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: .85rem;
        }

        .sec-table th {
          background: var(--bg-secondary, #f8fafc);
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-secondary, #475569);
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .05em;
          border-bottom: 1.5px solid var(--border-color, #e2e8f0);
          text-align: left;
          white-space: nowrap;
        }

        .theme-dark .sec-table th {
          background: #2d3a4f;
          color: #94a3b8;
          border-bottom-color: #475569;
        }

        .sec-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color, #f1f5f9);
          color: var(--text-primary, #334155);
          vertical-align: middle;
        }

        .theme-dark .sec-table td {
          border-bottom-color: #334155;
          color: #e2e8f0;
        }

        .sec-row {
          transition: background 0.1s;
        }

        .sec-row:hover {
          background: var(--bg-secondary, #f8fafc);
        }

        .theme-dark .sec-row:hover {
          background: #2d3a4f;
        }

        .sec-row.resolved {
          opacity: 0.7;
        }

        .sec-type-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sec-type-icon {
          font-size: 1rem;
        }

        .sec-type-label {
          font-weight: 500;
          font-size: 0.82rem;
          color: var(--text-primary, #0f172a);
        }

        .theme-dark .sec-type-label {
          color: #e2e8f0;
        }

        .sec-desc-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sec-user-cell {
          font-weight: 500;
        }

        .sec-ip-cell {
          font-family: monospace;
          font-size: 0.78rem;
        }

        .sec-time-cell {
          font-size: 0.78rem;
          color: var(--text-muted, #64748b);
          white-space: nowrap;
        }

        .theme-dark .sec-time-cell {
          color: #94a3b8;
        }

        .severity-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          display: inline-block;
        }

        .severity-badge.low { background: #f0fdf4; color: #16a34a; }
        .severity-badge.medium { background: #fffbeb; color: #d97706; }
        .severity-badge.high { background: #fff7ed; color: #ea580c; }
        .severity-badge.critical { background: #fef2f2; color: #dc2626; }

        .theme-dark .severity-badge.low { background: #0a2e1a; color: #4ade80; }
        .theme-dark .severity-badge.medium { background: #3d2a00; color: #fbbf24; }
        .theme-dark .severity-badge.high { background: #3d1a00; color: #fb923c; }
        .theme-dark .severity-badge.critical { background: #3d0a0a; color: #f87171; }

        .status-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.active {
          background: #fef3c7;
          color: #d97706;
        }

        .status-badge.resolved {
          background: #d1fae5;
          color: #059669;
        }

        .theme-dark .status-badge.active {
          background: #3d2a00;
          color: #fbbf24;
        }

        .theme-dark .status-badge.resolved {
          background: #0a2e1a;
          color: #34d399;
        }

        .sec-view-btn {
          padding: 5px 14px;
          border: 1.5px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #3b82f6;
          background: var(--card-bg, #ffffff);
          cursor: pointer;
          transition: all 0.15s;
        }

        .sec-view-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .theme-dark .sec-view-btn {
          border-color: #475569;
          background: #2d3a4f;
          color: #60a5fa;
        }

        .theme-dark .sec-view-btn:hover {
          background: #1a2a4a;
          border-color: #3b82f6;
        }

        .sec-empty {
          text-align: center;
          padding: 60px;
          background: var(--card-bg, #ffffff);
          border-radius: 12px;
          border: 1px solid var(--border-color, #e2e8f0);
        }

        .theme-dark .sec-empty {
          background: #1e293b;
          border-color: #334155;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .sec-empty h4 {
          margin: 0 0 8px 0;
          color: var(--text-primary, #1e293b);
          font-size: 1.1rem;
        }

        .theme-dark .sec-empty h4 {
          color: #f1f5f9;
        }

        .sec-empty p {
          margin: 0;
          color: var(--text-muted, #64748b);
        }

        .theme-dark .sec-empty p {
          color: #94a3b8;
        }

        /* ========================================
           PAGINATION - Without "Showing" text
           ======================================== */
        .sec-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color, #f1f5f9);
          background: var(--bg-secondary, #fafafa);
          border-radius: 0 0 12px 12px;
        }

        .theme-dark .sec-pagination {
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

        @media (max-width: 768px) {
          .sec-monitor-header {
            flex-direction: column;
            align-items: stretch;
          }

          .sec-monitor-tabs {
            flex-wrap: wrap;
          }

          .sec-tab {
            flex: 1;
            justify-content: center;
          }

          .sec-search-wrap {
            min-width: auto;
          }

          .sec-table-wrap {
            overflow-x: auto;
          }

          .sec-table {
            font-size: 0.75rem;
            min-width: 700px;
          }

          .sec-table th,
          .sec-table td {
            padding: 8px 12px;
          }

          .sec-desc-cell {
            max-width: 120px;
          }

          .sec-pagination {
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

export default SecurityMonitor;