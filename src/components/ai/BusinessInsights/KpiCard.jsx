import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KpiCard = ({ title, value, change, isPositive, neutral, darkMode }) => {
  const surface = darkMode ? '#243044' : '#F8FAFC';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';

  return (
    <div style={{
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: '14px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'box-shadow 0.2s',
    }}>
      <p style={{ fontSize: '12px', color: text2, margin: 0, fontWeight: 500 }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: text }}>{value}</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '11px', fontWeight: 700,
          padding: '3px 8px', borderRadius: '999px',
          background: neutral ? (darkMode ? 'rgba(100,116,139,0.2)' : '#F1F5F9')
                     : isPositive ? (darkMode ? 'rgba(16,185,129,0.2)' : '#D1FAE5')
                     : (darkMode ? 'rgba(239,68,68,0.2)' : '#FEE2E2'),
          color: neutral ? text2 : isPositive ? '#10B981' : '#EF4444',
        }}>
          {neutral ? <Minus size={11} /> : (isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
