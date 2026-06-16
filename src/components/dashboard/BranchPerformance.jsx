import React from 'react';

const DEMO_BRANCHES = [
  { branch_id: 1, branch_name: 'Colombo Head Office', location: 'Colombo 03', status: 'active', staff_count: 24, products_count: 486, total_stock: 12840, low_stock_items: 3, revenue: '$18,420', growth: 14.2 },
  { branch_id: 2, branch_name: 'Kandy City Branch', location: 'Kandy', status: 'active', staff_count: 14, products_count: 312, total_stock: 7620, low_stock_items: 8, revenue: '$11,640', growth: -2.1 },
  { branch_id: 3, branch_name: 'Galle Fort Branch', location: 'Galle', status: 'active', staff_count: 10, products_count: 248, total_stock: 5840, low_stock_items: 1, revenue: '$8,720', growth: 22.8 },
  { branch_id: 4, branch_name: 'Negombo Branch', location: 'Negombo', status: 'active', staff_count: 8, products_count: 198, total_stock: 4210, low_stock_items: 5, revenue: '$5,820', growth: 7.3 },
  { branch_id: 5, branch_name: 'Matara Branch', location: 'Matara', status: 'inactive', staff_count: 6, products_count: 140, total_stock: 2100, low_stock_items: 0, revenue: '$2,400', growth: -8.4 },
];

const BranchCard = ({ branch }) => {
  const maxStock = 15000;
  const stockPct = Math.round((branch.total_stock / maxStock) * 100);
  
  return (
    <div className="branch-card">
      <div className="branch-card-top">
        <div className="branch-info">
          <div className="branch-icon">🏢</div>
          <div>
            <div className="branch-name">{branch.branch_name}</div>
            <div className="branch-location">📍 {branch.location}</div>
          </div>
        </div>
        <span className={`branch-status ${branch.status}`}>{branch.status}</span>
      </div>

      <div className="branch-revenue">{branch.revenue}</div>
      <div className={`branch-growth ${branch.growth >= 0 ? 'up' : 'down'}`}>
        {branch.growth >= 0 ? '↑' : '↓'} {Math.abs(branch.growth)}% vs last period
      </div>

      <div className="branch-stock-bar">
        <div className="stock-bar-bg">
          <div className="stock-bar-fill" style={{ width: `${stockPct}%` }} />
        </div>
        <span className="stock-pct">{stockPct}%</span>
      </div>

      <div className="branch-metrics">
        <div className="bm">
          <div className="bm-val">{branch.staff_count}</div>
          <div className="bm-label">Staff</div>
        </div>
        <div className="bm">
          <div className="bm-val">{branch.products_count}</div>
          <div className="bm-label">Products</div>
        </div>
        <div className="bm">
          <div className="bm-val">{branch.total_stock.toLocaleString()}</div>
          <div className="bm-label">Stock</div>
        </div>
        <div className={`bm ${branch.low_stock_items > 0 ? 'warn' : ''}`}>
          <div className="bm-val">{branch.low_stock_items}</div>
          <div className="bm-label">Low Stock</div>
        </div>
      </div>

      <style>{`
        .branch-card {
          background: white;
          border-radius: var(--radius);
          padding: 18px;
          border: 1.5px solid var(--gray-200);
          transition: all var(--transition);
          animation: fadeIn .4s ease both;
        }
        .branch-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--blue-200); }
        .branch-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .branch-info { display: flex; gap: 10px; align-items: center; }
        .branch-icon { width: 38px; height: 38px; background: var(--blue-50); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .branch-name { font-size: .88rem; font-weight: 700; color: var(--gray-800); }
        .branch-location { font-size: .74rem; color: var(--gray-400); margin-top: 1px; }
        .branch-status { font-size: .68rem; font-weight: 700; text-transform: uppercase; padding: 3px 9px; border-radius: 99px; }
        .branch-status.active { background: var(--success-light); color: var(--success); }
        .branch-status.inactive { background: var(--gray-100); color: var(--gray-400); }
        .branch-revenue { font-size: 1.5rem; font-weight: 800; color: var(--gray-900); font-family: 'Syne', sans-serif; }
        .branch-growth { font-size: .78rem; font-weight: 600; margin-bottom: 12px; }
        .branch-growth.up { color: var(--success); }
        .branch-growth.down { color: var(--danger); }
        .branch-stock-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .stock-bar-bg { flex: 1; height: 6px; background: var(--gray-100); border-radius: 99px; overflow: hidden; }
        .stock-bar-fill { height: 100%; background: linear-gradient(90deg, var(--blue-400), var(--blue-600)); border-radius: 99px; transition: width .6s ease; }
        .stock-pct { font-size: .72rem; color: var(--gray-400); font-weight: 600; width: 30px; text-align: right; }
        .branch-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .bm { text-align: center; padding: 8px 4px; background: var(--gray-50); border-radius: 8px; }
        .bm.warn { background: var(--warning-light); }
        .bm.warn .bm-val { color: var(--warning); }
        .bm-val { font-size: .95rem; font-weight: 800; color: var(--gray-800); }
        .bm-label { font-size: .65rem; color: var(--gray-400); font-weight: 500; margin-top: 1px; }
      `}</style>
    </div>
  );
};

const BranchPerformance = ({ data }) => {
  const branches = data?.branches || DEMO_BRANCHES;

  return (
    <div className="branch-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Branch Performance</h2>
          <p className="section-sub">{branches.length} branches • Real-time data</p>
        </div>
        <button className="view-all-btn">View All Branches →</button>
      </div>
      <div className="branch-grid">
        {branches.map(b => <BranchCard key={b.branch_id} branch={b} />)}
      </div>
      <style>{`
        .branch-section {}
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: var(--gray-900); font-family: 'Syne', sans-serif; }
        .section-sub { font-size: .78rem; color: var(--gray-400); margin-top: 2px; }
        .view-all-btn {
          font-size: .82rem; font-weight: 600; color: var(--blue-600);
          background: var(--blue-50); padding: 7px 14px; border-radius: 8px;
          transition: all var(--transition); border: 1px solid var(--blue-200);
        }
        .view-all-btn:hover { background: var(--blue-100); }
        .branch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
      `}</style>
    </div>
  );
};

export default BranchPerformance;
