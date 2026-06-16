import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WEEK_DATA = [
  { name: 'Mon', sales: 4200, expected: 3800 },
  { name: 'Tue', sales: 3800, expected: 4000 },
  { name: 'Wed', sales: 5200, expected: 4500 },
  { name: 'Thu', sales: 4800, expected: 4700 },
  { name: 'Fri', sales: 6100, expected: 5500 },
  { name: 'Sat', sales: 7400, expected: 6000 },
  { name: 'Sun', sales: 6800, expected: 6200 },
];

const LAST_WEEK_DATA = [
  { name: 'Mon', sales: 3900, expected: 3700 },
  { name: 'Tue', sales: 3500, expected: 3600 },
  { name: 'Wed', sales: 4800, expected: 4200 },
  { name: 'Thu', sales: 4100, expected: 4400 },
  { name: 'Fri', sales: 5200, expected: 5100 },
  { name: 'Sat', sales: 6200, expected: 5800 },
  { name: 'Sun', sales: 5900, expected: 5600 },
];

const MONTH_DATA = [
  { name: 'Week 1', sales: 25000, expected: 24000 },
  { name: 'Week 2', sales: 28000, expected: 26000 },
  { name: 'Week 3', sales: 31000, expected: 29000 },
  { name: 'Week 4', sales: 35000, expected: 32000 },
];

const ChartWidget = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('This Week');

  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';
  const grid = darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB';
  const tooltipBg = darkMode ? '#1E293B' : '#FFFFFF';

  let currentData = WEEK_DATA;
  if (timeRange === 'Last Week') currentData = LAST_WEEK_DATA;
  if (timeRange === 'Last Month') currentData = MONTH_DATA;

  return (
    <div style={{
      borderTop: `1px solid ${border}`,
      paddingTop: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: text }}>Weekly Sales Trend</h3>
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              name="Expected"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
