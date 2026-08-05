import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import KpiCard from './KpiCard';
import ChartWidget from './ChartWidget';

const BusinessInsights = ({ darkMode }) => {
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [loading, setLoading] = useState(true);

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const shadow = darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Fetch current period data from Flask ML API
        const res = await fetch('http://localhost:5001/predict/analytics');
        const json = await res.json();
        if (json.kpis) {
          setData(json);
        }

        // Fetch previous period data for computing change%
        const prevRes = await fetch('http://localhost:5001/predict/analytics?period=previous');
        const prevJson = await prevRes.json();
        if (prevJson.kpis) {
          setPrevData(prevJson);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  // Compute real change percentage between current and previous period
  const computeChange = (current, previous) => {
    if (!previous || previous === 0) return { text: 'N/A', isPositive: true, neutral: true };
    const change = ((current - previous) / previous) * 100;
    const formatted = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    return { text: formatted, isPositive: change >= 0, neutral: Math.abs(change) < 0.1 };
  };

  const getRevenueChange = () => {
    if (!data || !prevData) return { text: 'N/A', isPositive: true, neutral: true };
    return computeChange(data.kpis.totalRevenue, prevData.kpis?.totalRevenue);
  };

  const getOrderValueChange = () => {
    if (!data || !prevData) return { text: 'N/A', isPositive: true, neutral: true };
    return computeChange(data.kpis.averageOrderValue, prevData.kpis?.averageOrderValue);
  };

  const getOrdersChange = () => {
    if (!data || !prevData) return { text: 'N/A', isPositive: true, neutral: true };
    return computeChange(data.kpis.totalOrders, prevData.kpis?.totalOrders);
  };

  const revenueChange = getRevenueChange();
  const orderValueChange = getOrderValueChange();
  const ordersChange = getOrdersChange();

  return (
    <div style={{ background: surface, borderRadius: '20px', border: `1px solid ${border}`, padding: '20px', boxShadow: shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(124,58,237,0.12)', padding: '8px', borderRadius: '12px', color: '#7C3AED' }}>
          <BarChart3 size={20} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: text }}>Business Insights</h2>
      </div>

      {loading && (
        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: '10px', height: '10px', background: '#7C3AED', borderRadius: '50%' }}
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: darkMode ? '#94A3B8' : '#64748B' }}>
            Analyzing business data...
          </span>
        </div>
      )}

      {!loading && data && (
        <>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <KpiCard title="Total Revenue" value={`Rs ${data.kpis.totalRevenue.toLocaleString()}`} change={revenueChange.text} isPositive={revenueChange.isPositive} neutral={revenueChange.neutral} darkMode={darkMode} />
            <KpiCard title="Avg Order Value" value={`Rs ${data.kpis.averageOrderValue}`} change={orderValueChange.text} isPositive={orderValueChange.isPositive} neutral={orderValueChange.neutral} darkMode={darkMode} />
            <KpiCard title="Orders" value={data.kpis.totalOrders} change={ordersChange.text} isPositive={ordersChange.isPositive} neutral={ordersChange.neutral} darkMode={darkMode} />
            <KpiCard title="Low Stock Alerts" value={`${data.kpis.lowStockCount} alerts`} change="Across all branches" neutral={true} darkMode={darkMode} />
            <KpiCard title="Top Product" value={data.kpis.topProduct} change="Best Seller" neutral={true} darkMode={darkMode} />
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
