import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import KpiCard from './KpiCard';
import ChartWidget from './ChartWidget';

const BusinessInsights = ({ darkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const shadow = darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/recommendations/analytics/insights');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div style={{ background: surface, borderRadius: '20px', border: `1px solid ${border}`, padding: '20px', boxShadow: shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(124,58,237,0.12)', padding: '8px', borderRadius: '12px', color: '#7C3AED' }}>
          <BarChart3 size={20} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: text }}>Business Insights</h2>
      </div>

      {!loading && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <KpiCard title="Total Revenue" value={`$${data.kpis.totalRevenue.toLocaleString()}`} change="+16.8%" isPositive={true} darkMode={darkMode} />
            <KpiCard title="Orders" value={data.kpis.totalOrders} change="+3.2%" isPositive={true} darkMode={darkMode} />
            <KpiCard title="Avg Order Value" value={`$${data.kpis.averageOrderValue}`} change="-0.5%" isPositive={true} darkMode={darkMode} />
            <KpiCard title="Low Stock" value={`${data.kpis.lowStockCount} items`} change="0.0%" neutral={true} darkMode={darkMode} />
            <KpiCard title="Top Product" value={data.kpis.topProduct} change="Trending" neutral={true} darkMode={darkMode} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: text, marginBottom: '10px' }}>Key Insights</h3>
            <ul style={{ paddingLeft: '20px', color: darkMode ? '#94A3B8' : '#64748B', fontSize: '13px' }}>
              {data.insights.map((insight, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{insight}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <ChartWidget darkMode={darkMode} />
    </div>
  );
};

export default BusinessInsights;

