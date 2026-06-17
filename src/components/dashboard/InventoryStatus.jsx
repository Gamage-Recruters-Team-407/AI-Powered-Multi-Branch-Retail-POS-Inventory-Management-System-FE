import React from 'react';

const DEMO_LOW_STOCK = [
  { id: 1, name: 'Basmati Rice 5kg', sku: 'GRC-001', stock: 12, threshold: 50, branch: 'Kandy', category: 'Groceries' },
  { id: 2, name: 'Sunflower Oil 1L', sku: 'OIL-042', stock: 8, threshold: 30, branch: 'Colombo', category: 'Cooking' },
  { id: 3, name: 'Laundry Detergent 2kg', sku: 'CLN-118', stock: 5, threshold: 25, branch: 'Galle', category: 'Household' },
  { id: 4, name: 'Tomato Paste 400g', sku: 'GRC-098', stock: 15, threshold: 40, branch: 'Negombo', category: 'Groceries' },
  { id: 5, name: 'Coconut Milk 400ml', sku: 'GRC-201', stock: 9, threshold: 35, branch: 'Kandy', category: 'Groceries' },
];

const InventoryStatus = ({ data, role }) => {
  const inventory = data?.inventory || {};
  const lowStock = data?.low_stock_alerts?.items || DEMO_LOW_STOCK;
  const lowCount = data?.low_stock_alerts?.count || DEMO_LOW_STOCK.length;
  const isCashier = role?.toUpperCase() === 'CASHIER';

  const stats = [
    { label: 'Total Products', value: inventory.total_products?.toLocaleString() || '486', icon: '🏷️', color: 'blue' },
    { label: 'Total Stock Units', value: inventory.total_stock?.toLocaleString() || '32,610', icon: '📦', color: 'green' },
    ...(!isCashier ? [{ label: 'Low Stock Items', value: lowCount, icon: '⚠️', color: 'warning', alert: true }] : []),
    { label: 'Avg Stock Level', value: inventory.avg_stock_level || '67.1', icon: '📊', color: 'purple' },
  ];

  return (
    <div className="inv-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Inventory Health</h2>
          <p className="section-sub">Stock levels across all branches</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="inv-stats-row">
        {stats.map((s, i) => (
          <div key={i} className={`inv-stat-card ${s.alert ? 'alert-card' : ''}`}>
            <span className="inv-stat-icon">{s.icon}</span>
            <div className="inv-stat-val">{s.value}</div>
            <div className="inv-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Table */}
      {!isCashier && lowCount > 0 && (
        <div className="low-stock-card">
          <div className="lsc-header">
            <div className="lsc-title">
              <span className="alert-badge">⚠️ {lowCount} Low Stock Alerts</span>
            </div>
            <button className="view-all-btn">View All →</button>
          </div>
          <div className="stock-table">
            <div className="st-head">
              <div>Product</div><div>SKU</div><div>Stock</div><div>Threshold</div><div>Branch</div><div>Status</div>
            </div>
            {lowStock.slice(0, 5).map(item => {
              const pct = Math.round((item.stock / item.threshold) * 100);
              const critical = pct < 30;
              return (
                <div key={item.id} className="st-row">
                  <div className="st-product">
                    <div className="st-name">{item.name}</div>
                    <div className="st-cat">{item.category}</div>
                  </div>
                  <div className="st-sku">{item.sku}</div>
                  <div className={`st-stock ${critical ? 'critical' : 'low'}`}>{item.stock}</div>
                  <div className="st-threshold">{item.threshold}</div>
                  <div className="st-branch">{item.branch}</div>
                  <div>
                    <div className="st-bar-wrap">
                      <div className="st-bar-bg">
                        <div className="st-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: critical ? '#ef4444' : '#f59e0b' }} />
                      </div>
                      <span className="st-pct">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .inv-section {}
        .inv-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
        @media (max-width: 900px) { .inv-stats-row { grid-template-columns: repeat(2, 1fr); } }
        .inv-stat-card {
          background: white; border-radius: var(--radius); padding: 18px;
          border: 1.5px solid var(--gray-200); text-align: center;
          transition: all var(--transition); animation: fadeIn .4s ease both;
        }
        .inv-stat-card:hover { border-color: var(--blue-200); box-shadow: var(--shadow); }
        .inv-stat-card.alert-card { border-color: var(--warning); background: var(--warning-light); }
        .inv-stat-icon { font-size: 1.5rem; }
        .inv-stat-val { font-size: 1.6rem; font-weight: 800; color: var(--gray-900); font-family: 'Syne', sans-serif; margin: 6px 0 2px; }
        .inv-stat-label { font-size: .75rem; color: var(--gray-500); font-weight: 500; }

        .low-stock-card { background: white; border-radius: var(--radius); border: 1.5px solid var(--gray-200); overflow: hidden; }
        .lsc-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--gray-100); }
        .lsc-title {}
        .alert-badge { font-size: .85rem; font-weight: 700; color: #92400e; background: var(--warning-light); padding: 5px 12px; border-radius: 8px; }
        .view-all-btn { font-size: .82rem; font-weight: 600; color: var(--blue-600); background: var(--blue-50); padding: 7px 14px; border-radius: 8px; transition: all var(--transition); border: 1px solid var(--blue-200); }
        .view-all-btn:hover { background: var(--blue-100); }

        .stock-table {}
        .st-head {
          display: grid; grid-template-columns: 2fr 1fr 0.6fr 0.8fr 1fr 1.2fr;
          padding: 10px 20px;
          background: var(--gray-50); font-size: .72rem; font-weight: 700;
          color: var(--gray-400); text-transform: uppercase; letter-spacing: .05em;
        }
        .st-row {
          display: grid; grid-template-columns: 2fr 1fr 0.6fr 0.8fr 1fr 1.2fr;
          padding: 12px 20px;
          border-bottom: 1px solid var(--gray-50);
          align-items: center;
          transition: background var(--transition);
          font-size: .83rem;
        }
        .st-row:hover { background: var(--gray-50); }
        .st-name { font-weight: 600; color: var(--gray-800); }
        .st-cat { font-size: .7rem; color: var(--gray-400); margin-top: 1px; }
        .st-sku { color: var(--gray-400); font-family: monospace; font-size: .78rem; }
        .st-stock { font-weight: 800; }
        .st-stock.critical { color: var(--danger); }
        .st-stock.low { color: var(--warning); }
        .st-threshold { color: var(--gray-500); }
        .st-branch { color: var(--blue-600); font-weight: 600; }
        .st-bar-wrap { display: flex; align-items: center; gap: 6px; }
        .st-bar-bg { flex: 1; height: 6px; background: var(--gray-100); border-radius: 99px; overflow: hidden; }
        .st-bar-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
        .st-pct { font-size: .72rem; color: var(--gray-400); font-weight: 600; min-width: 28px; }
      `}</style>
    </div>
  );
};

export default InventoryStatus;
