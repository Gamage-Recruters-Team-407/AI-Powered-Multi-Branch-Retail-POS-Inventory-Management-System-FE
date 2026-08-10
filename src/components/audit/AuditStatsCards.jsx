import React, { useContext } from 'react';
import { ThemeContext } from '../../pages/audit/AuditSecurityPage';

const StatCard = ({ icon, label, value, sub, color, trend }) => {
  const context = useContext(ThemeContext);
  const theme = context?.theme || 'light';
  const isDark = theme === 'dark';

  return (
    <div className={`audit-stat-card theme-${theme}`} style={{ '--accent': color }}>
      <div className="stat-icon-wrap">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-body">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
      <style>{`
        .audit-stat-card {
          background: var(--card-bg, #ffffff);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border: 1.5px solid var(--border-color, #e2e8f0);
          box-shadow: 0 1px 4px var(--shadow-color, rgba(0,0,0,.04));
          position: relative;
          overflow: hidden;
          transition: box-shadow .2s, transform .2s;
        }

        .theme-dark .audit-stat-card {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }

        .audit-stat-card:hover {
          box-shadow: 0 4px 16px var(--shadow-hover, rgba(0,0,0,.08));
          transform: translateY(-2px);
        }

        .theme-dark .audit-stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        }

        .audit-stat-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent, #3b82f6);
          border-radius: 14px 0 0 14px;
        }

        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: color-mix(in srgb, var(--accent, #3b82f6) 12%, var(--bg-secondary, #ffffff));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .theme-dark .stat-icon-wrap {
          background: color-mix(in srgb, var(--accent, #3b82f6) 20%, #1e293b);
        }

        .stat-icon {
          font-size: 1.3rem;
        }

        .stat-body {
          flex: 1;
          min-width: 0;
        }

        .stat-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          line-height: 1;
        }

        .theme-dark .stat-value {
          color: #f1f5f9;
        }

        .stat-label {
          font-size: .78rem;
          color: var(--text-muted, #64748b);
          font-weight: 600;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: .05em;
        }

        .stat-sub {
          font-size: .73rem;
          color: var(--text-muted, #94a3b8);
          margin-top: 2px;
        }

        .stat-trend {
          font-size: .72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          align-self: flex-start;
          flex-shrink: 0;
        }

        .stat-trend.up {
          background: #dcfce7;
          color: #16a34a;
        }

        .theme-dark .stat-trend.up {
          background: #0a2e1a;
          color: #4ade80;
        }

        .stat-trend.down {
          background: #fee2e2;
          color: #dc2626;
        }

        .theme-dark .stat-trend.down {
          background: #3d0a0a;
          color: #f87171;
        }
      `}</style>
    </div>
  );
};

const AuditStatsCards = ({ stats, loading }) => {
  const cards = [
    {
      icon: '📋',
      label: 'Total Events',
      value: loading ? '…' : (stats?.totalEvents?.toLocaleString() ?? '0'),
      sub: 'Last 30 days',
      color: '#3b82f6',
      trend: stats?.eventsTrend,
    },
    {
      icon: '🔐',
      label: 'Login Attempts',
      value: loading ? '…' : (stats?.loginAttempts?.toLocaleString() ?? '0'),
      sub: `${stats?.failedLogins ?? 0} failed`,
      color: '#8b5cf6',
      trend: stats?.loginTrend,
    },
    {
      icon: '⚠️',
      label: 'Security Alerts',
      value: loading ? '…' : (stats?.securityAlerts ?? '0'),
      sub: `${stats?.unresolvedAlerts ?? 0} unresolved`,
      color: '#f59e0b',
      trend: stats?.alertsTrend,
    },
    {
      icon: '🌐',
      label: 'Active Sessions',
      value: loading ? '…' : (stats?.activeSessions ?? '0'),
      sub: `${stats?.uniqueUsers ?? 0} unique users`,
      color: '#10b981',
    },
  ];

  return (
    <div className="audit-stats-grid">
      {cards.map((c, i) => <StatCard key={i} {...c} />)}
      <style>{`
        .audit-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
      `}</style>
    </div>
  );
};

export default AuditStatsCards;