import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartWidget = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('This Week');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';
  const grid = darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB';
  const tooltipBg = darkMode ? '#1E293B' : '#FFFFFF';

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let fromDate, toDate, granularity;

        if (timeRange === 'This Week') {
          // Get the start of this week (Monday)
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(now);
          monday.setDate(now.getDate() - diff);
          monday.setHours(0, 0, 0, 0);
          fromDate = monday.toISOString().split('T')[0];
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          toDate = sunday.toISOString().split('T')[0];
          
          granularity = 'day';
        } else if (timeRange === 'Last Week') {
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const thisMonday = new Date(now);
          thisMonday.setDate(now.getDate() - diff);
          const lastMonday = new Date(thisMonday);
          lastMonday.setDate(thisMonday.getDate() - 7);
          const lastSunday = new Date(thisMonday);
          lastSunday.setDate(thisMonday.getDate() - 1);
          fromDate = lastMonday.toISOString().split('T')[0];
          toDate = lastSunday.toISOString().split('T')[0];
          granularity = 'day';
        } else {
          // Last Month
          const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastMonth = new Date(firstOfThisMonth);
          lastMonth.setDate(lastMonth.getDate() - 1);
          const firstOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
          fromDate = firstOfLastMonth.toISOString().split('T')[0];
          toDate = lastMonth.toISOString().split('T')[0];
          granularity = 'week';
        }

        const res = await fetch(
          `http://localhost:5000/api/recommendations/sales-chart?fromDate=${fromDate}&toDate=${toDate}&granularity=${granularity}`
        );
        const json = await res.json();

        let filledData = [];
        if (granularity === 'day') {
          let currDate = new Date(fromDate);
          const endDate = new Date(toDate);
          const dataMap = {};
          
          if (json.success && json.data) {
            json.data.forEach(item => {
              dataMap[item.name] = item;
            });
          }
          const avgExpected = json.success && json.data && json.data.length > 0 ? json.data[0].expected : 0;
          
          while (currDate <= endDate) {
            const dateStr = currDate.toISOString().split('T')[0];
            if (dataMap[dateStr]) {
              filledData.push(dataMap[dateStr]);
            } else {
              filledData.push({
                name: dateStr,
                sales: 0,
                expected: avgExpected
              });
            }
            currDate.setDate(currDate.getDate() + 1);
          }
        } else {
          filledData = json.success && json.data ? json.data : [];
        }

        if (filledData.length > 0) {
          setChartData(filledData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error('Error fetching sales chart data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatLabel = (label) => {
    // For daily data, try to show day name
    if (label && label.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(label + 'T00:00:00');
      return dayNames[date.getDay()];
    }
    // For weekly data
    if (label && label.includes('-W')) {
      return label.replace(/^\d{4}-/, '');
    }
    return label;
  };

  const displayData = chartData.map(item => ({
    name: formatLabel(item.name),
    sales: Math.round(item.sales || 0),
    expected: Math.round(item.expected || 0)
  }));

  return (
    <div style={{
      borderTop: `1px solid ${border}`,
      paddingTop: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: text }}>Sales Trend</h3>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
          background: darkMode ? '#243044' : '#F8FAFC',
          border: `1px solid ${border}`,
          color: text2, fontSize: '11px',
          borderRadius: '8px', padding: '4px 8px', outline: 'none', cursor: 'pointer',
        }}>
          <option>This Week</option>
          <option>Last Week</option>
          <option>Last Month</option>
        </select>
      </div>

      <div style={{ width: '100%', height: '200px' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            height: '100%', color: text2, fontSize: '13px' 
          }}>
            Loading sales data...
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            height: '100%', color: text2, fontSize: '13px' 
          }}>
            No sales data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: text2 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: text2 }}
              />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${border}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  fontSize: '12px',
                  color: text,
                }}
                formatter={(value) => [`Rs ${value.toLocaleString()}`, undefined]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="Actual Sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: '#2563EB' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expected"
                name="Avg Expected"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartWidget;
