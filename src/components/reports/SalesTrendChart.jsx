import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const formatLKR = (value) => {
  if (value >= 1000000) return `LKR ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `LKR ${(value / 1000).toFixed(0)}K`;
  return `LKR ${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted = typeof val === 'number'
      ? `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : String(val);
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-slate-500">{label} 2026</p>
        <p className="text-sm font-bold text-blue-600">{formatted}</p>
      </div>
    );
  }
  return null;
};

const processSalesData = (salesArray) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTotals = months.reduce((acc, m) => {
    acc[m] = 0;
    return acc;
  }, {});

  let hasRealDbData = false;

  if (salesArray && salesArray.length > 0) {
    salesArray.forEach((sale) => {
      if (sale.createdAt) {
        hasRealDbData = true;
        const date = new Date(sale.createdAt);
        const m = months[date.getMonth()];
        const amount = sale.finalAmount || sale.totalAmount || 0;
        monthlyTotals[m] += amount;
      }
    });
  }

  if (hasRealDbData) {
    return months.map((m) => ({
      month: m,
      sales: monthlyTotals[m],
    }));
  }

  // Fallback to static curve
  return [
    { month: 'Jan', sales: 1200000 },
    { month: 'Feb', sales: 1450000 },
    { month: 'Mar', sales: 1380000 },
    { month: 'Apr', sales: 1620000 },
    { month: 'May', sales: 1890000 },
    { month: 'Jun', sales: 2150000 },
    { month: 'Jul', sales: 1970000 },
    { month: 'Aug', sales: 2240000 },
    { month: 'Sep', sales: 2100000 },
    { month: 'Oct', sales: 2380000 },
    { month: 'Nov', sales: 2650000 },
    { month: 'Dec', sales: 2400000 },
  ];
};

function SalesTrendChart({ salesData }) {
  const chartData = processSalesData(salesData);
  const isReal = salesData && salesData.some((s) => s.createdAt);

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
      aria-label="Sales Trend Chart"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Sales Trend</h2>
            <p className="text-xs text-slate-500">
              Monthly revenue — 2026 {isReal ? '(Live Database)' : '(Sample Data)'}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
          ↑ 12.4% YoY
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatLKR}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

export default SalesTrendChart;
