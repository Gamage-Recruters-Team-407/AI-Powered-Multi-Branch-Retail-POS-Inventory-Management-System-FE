import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const DEMO_SALES = [
  { date: 'May 27', revenue: 6200, transactions: 84, profit: 1860 },
  { date: 'May 28', revenue: 7800, transactions: 102, profit: 2340 },
  { date: 'May 29', revenue: 5400, transactions: 71, profit: 1620 },
  { date: 'May 30', revenue: 9200, transactions: 128, profit: 2760 },
  { date: 'May 31', revenue: 11400, transactions: 154, profit: 3420 },
  { date: 'Jun 01', revenue: 8700, transactions: 116, profit: 2610 },
  { date: 'Jun 02', revenue: 10100, transactions: 139, profit: 3030 },
];

const BRANCH_PIE = [
  { name: 'Colombo', value: 38, color: '#2563eb' },
  { name: 'Kandy', value: 24, color: '#60a5fa' },
  { name: 'Galle', value: 18, color: '#93c5fd' },
  { name: 'Negombo', value: 12, color: '#bfdbfe' },
  { name: 'Others', value: 8, color: '#dbeafe' },
];

const CHART_TYPES = ['Area', 'Line', 'Bar'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#172554', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,.2)', border: 'none'
    }}>
      <p style={{ color: '#93c5fd', fontSize: '.78rem', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: '.88rem' }}>
          {p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

const SalesChart = ({ data }) => {
  const [chartType, setChartType] = useState('Area');
  const [metric, setMetric] = useState('revenue');
  const salesData = data?.sales || DEMO_SALES;

  const renderChart = () => {
    const commonProps = {
      data: salesData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    if (chartType === 'Area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey={metric} stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} />
        </AreaChart>
      );
    }
    if (chartType === 'Line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={metric} stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }
    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={metric} fill="#2563eb" radius={[6,6,0,0]} />
      </BarChart>
    );
  };

  return (
    <div className="charts-grid">
      {/* Main Revenue Chart */}
      <div className="chart-card main-chart">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-card-title">Revenue & Sales Trend</h3>
            <p className="chart-card-sub">Last 7 days performance</p>
          </div>
          <div className="chart-controls">
            <div className="chart-tabs">
              {['revenue', 'transactions', 'profit'].map(m => (
                <button key={m} className={`chart-tab ${metric === m ? 'active' : ''}`} onClick={() => setMetric(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <div className="chart-tabs">
              {CHART_TYPES.map(t => (
                <button key={t} className={`chart-tab ${chartType === t ? 'active' : ''}`} onClick={() => setChartType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Branch Revenue Share */}
      <div className="chart-card pie-chart">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-card-title">Branch Revenue Share</h3>
            <p className="chart-card-sub">Current period</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={BRANCH_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {BRANCH_PIE.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: 'none', background: '#172554', color: '#93c5fd' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-legend">
          {BRANCH_PIE.map((b, i) => (
            <div key={i} className="pie-legend-item">
              <span className="pie-dot" style={{ background: b.color }} />
              <span className="pie-name">{b.name}</span>
              <span className="pie-val">{b.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 16px;
        }
        @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card {
          background: white;
          border-radius: var(--radius);
          padding: 20px;
          border: 1.5px solid var(--gray-200);
          animation: fadeIn .5s ease both;
        }
        .chart-card-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 18px; flex-wrap: wrap; gap: 10px;
        }
        .chart-card-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); }
        .chart-card-sub { font-size: .75rem; color: var(--gray-400); margin-top: 2px; }
        .chart-controls { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
        .chart-tabs { display: flex; gap: 4px; background: var(--gray-100); padding: 3px; border-radius: 8px; }
        .chart-tab {
          padding: 4px 10px; border-radius: 6px; font-size: .75rem; font-weight: 600;
          color: var(--gray-500); background: none; transition: all var(--transition);
        }
        .chart-tab.active { background: white; color: var(--blue-600); box-shadow: var(--shadow-sm); }

        .pie-legend { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: .8rem; }
        .pie-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .pie-name { flex: 1; color: var(--gray-600); }
        .pie-val { font-weight: 700; color: var(--gray-800); }
      `}</style>
    </div>
  );
};

export default SalesChart;
