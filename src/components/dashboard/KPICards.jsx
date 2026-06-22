// components/dashboard/KPICards.jsx

import React from 'react';

const KPICard = ({ title, value, sub, change, trend, icon, color = 'blue', loading }) => {
  const colors = {
    blue: { bg: '#eff6ff', icon: '#2563eb', border: '#bfdbfe', text: '#1d4ed8' },
    green: { bg: '#d1fae5', icon: '#059669', border: '#6ee7b7', text: '#065f46' },
    amber: { bg: '#fef3c7', icon: '#d97706', border: '#fcd34d', text: '#92400e' },
    purple: { bg: '#ede9fe', icon: '#7c3aed', border: '#c4b5fd', text: '#4c1d95' },
    rose: { bg: '#ffe4e6', icon: '#e11d48', border: '#fda4af', text: '#881337' },
    cyan: { bg: '#cffafe', icon: '#0891b2', border: '#67e8f9', text: '#164e63' },
  };
  const c = colors[color] || colors.blue;

  if (loading) {
    return (
      <div className="kpi-card skeleton">
        <div className="skel-line" style={{ width: '60%', height: 14 }} />
        <div className="skel-line" style={{ width: '80%', height: 32, marginTop: 8 }} />
        <div className="skel-line" style={{ width: '40%', height: 12, marginTop: 8 }} />
      </div>
    );
  }

  return (
    <div className="kpi-card" style={{ '--card-border': c.border }}>
      <div className="kpi-top">
        <div>
          <div className="kpi-title">{title}</div>
          {sub && <div className="kpi-sub">{sub}</div>}
        </div>
        <div className="kpi-icon-wrap" style={{ background: c.bg }}>
          <span className="kpi-icon" style={{ color: c.icon }}>{icon}</span>
        </div>
      </div>
      <div className="kpi-value">{value || 'Rs. 0'}</div>
      {change !== undefined && change !== null && (
        <div className={`kpi-change ${trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral'}`}>
          <span className="change-arrow">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{Math.abs(Number(change) || 0)}%</span>
          <span className="change-label">vs last period</span>
        </div>
      )}
      <style>{`
        .kpi-card {
          background: white;
          border-radius: var(--radius, 16px);
          padding: 20px;
          border: 1.5px solid var(--card-border, var(--gray-200, #e2e8f0));
          transition: all var(--transition, 0.2s);
          animation: fadeIn .4s ease both;
          position: relative;
          overflow: hidden;
        }
        .kpi-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--card-border, var(--blue-300, #93c5fd)), transparent);
        }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1)); }
        .kpi-card.skeleton { background: var(--gray-100, #f1f5f9); border: none; }
        .kpi-card.skeleton::before { display: none; }
        .skel-line {
          background: linear-gradient(90deg, var(--gray-200, #e2e8f0) 25%, var(--gray-100, #f1f5f9) 50%, var(--gray-200, #e2e8f0) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .kpi-title { font-size: .8rem; font-weight: 600; color: var(--gray-500, #64748b); text-transform: uppercase; letter-spacing: .05em; }
        .kpi-sub { font-size: .72rem; color: var(--gray-400, #94a3b8); margin-top: 2px; }
        .kpi-icon-wrap { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kpi-icon { font-size: 1.3rem; }
        .kpi-value { 
          font-size: 1.7rem; 
          font-weight: 800; 
          color: var(--gray-900, #0f172a); 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.2;
          margin: 4px 0;
        }
        .kpi-change { 
          display: flex; 
          align-items: center; 
          gap: 4px; 
          font-size: .78rem; 
          font-weight: 600; 
          margin-top: 10px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .kpi-change.up { color: var(--success, #10b981); }
        .kpi-change.down { color: var(--danger, #ef4444); }
        .kpi-change.neutral { color: var(--gray-500, #64748b); }
        .change-arrow { font-size: .9rem; }
        .change-label { font-weight: 400; color: var(--gray-400, #94a3b8); margin-left: 2px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const KPICards = ({ data, loading, role }) => {
  const kpi = data?.kpi || {};
  const inventory = data?.inventory || {};

  const cards = [
    {
      title: 'Total Revenue',
      value: kpi.revenue?.total || 'Rs. 0',
      sub: 'This period',
      change: kpi.revenue?.growth_percentage ?? 0,
      trend: kpi.revenue?.trend || 'neutral',
      icon: '💰',
      color: 'blue',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Total Sales',
      value: kpi.sales?.count ?? 0,
      sub: 'Transactions',
      change: kpi.sales?.growth_percentage ?? 0,
      trend: (kpi.sales?.growth_percentage ?? 0) >= 0 ? 'up' : 'down',
      icon: '🛍️',
      color: 'green',
      roles: ['admin', 'manager', 'cashier'],
    },
    {
      title: 'Net Profit',
      value: kpi.profit?.total || 'Rs. 0',
      sub: 'This period',
      change: kpi.profit?.margin_percentage ?? 0,
      trend: (kpi.profit?.margin_percentage ?? 0) >= 0 ? 'up' : 'down',
      icon: '📈',
      color: 'purple',
      roles: ['admin'],
    },
    {
      title: 'Stock Turnover',
      value: kpi.stock_turnover?.avg_rate || '0.0x',
      sub: 'Efficiency',
      change: 0,
      trend: 'neutral',
      icon: '📦',
      color: 'amber',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Total Stock Value',
      value: inventory.inventory_value || 'Rs. 0',
      sub: 'Cumulative cost',
      trend: 'neutral',
      icon: '🪙',
      color: 'cyan',
      roles: ['admin', 'manager'],
    },
  ];

  const visible = cards.filter(c => c.roles.includes(role));

  return (
    <div className="kpi-grid">
      {visible.map((card, i) => (
        <KPICard key={card.title + i} {...card} loading={loading} />
      ))}
      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default KPICards;