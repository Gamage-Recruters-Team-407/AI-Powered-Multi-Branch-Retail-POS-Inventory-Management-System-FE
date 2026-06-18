import React from 'react';

const DEMO_PRODUCTS = [
  { rank: 1, product_name: 'Anchor Butter 200g', category: 'Dairy', units_sold: 842, revenue: '$4,210', times_sold: 312, growth: 18.4 },
  { rank: 2, product_name: 'Milo 400g Tin', category: 'Beverages', units_sold: 721, revenue: '$3,605', times_sold: 289, growth: 12.1 },
  { rank: 3, product_name: 'Keells Sausages 400g', category: 'Meat', units_sold: 614, revenue: '$5,526', times_sold: 241, growth: 8.7 },
  { rank: 4, product_name: 'Astra Margarine 250g', category: 'Dairy', units_sold: 582, revenue: '$2,328', times_sold: 198, growth: -3.2 },
  { rank: 5, product_name: 'Ceylon Tea 500g', category: 'Beverages', units_sold: 498, revenue: '$3,486', times_sold: 187, growth: 22.6 },
];

const TopProducts = ({ data }) => {
  const products = data?.top_products || DEMO_PRODUCTS;

  return (
    <div className="tp-card">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="section-title">Top Selling Products</h2>
          <p className="section-sub">Ranked by units sold this period</p>
        </div>
        <button className="view-all-btn">Full Report →</button>
      </div>

      <div className="tp-table">
        <div className="tp-head">
          <div>#</div>
          <div>Product</div>
          <div>Units Sold</div>
          <div>Revenue</div>
          <div>Growth</div>
        </div>
        {products.map((p, i) => (
          <div key={i} className="tp-row">
            <div className={`tp-rank rank-${Math.min(p.rank, 4)}`}>{p.rank}</div>
            <div className="tp-product">
              <div className="tp-name">{p.product_name}</div>
              <div className="tp-cat">{p.category}</div>
            </div>
            <div>
              <div className="tp-units">{p.units_sold.toLocaleString()}</div>
              <div className="tp-times">{p.times_sold} orders</div>
            </div>
            <div className="tp-rev">{p.revenue}</div>
            <div className={`tp-growth ${p.growth >= 0 ? 'up' : 'down'}`}>
              {p.growth >= 0 ? '↑' : '↓'} {Math.abs(p.growth)}%
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .tp-card {
          background: white; border-radius: var(--radius);
          border: 1.5px solid var(--gray-200);
          padding: 20px;
          animation: fadeIn .5s ease both;
        }
        .tp-table {}
        .tp-head {
          display: grid; grid-template-columns: 40px 2fr 1fr 1fr 0.8fr;
          padding: 9px 12px;
          background: var(--gray-50); border-radius: 8px;
          font-size: .72rem; font-weight: 700; color: var(--gray-400);
          text-transform: uppercase; letter-spacing: .05em;
          margin-bottom: 4px;
        }
        .tp-row {
          display: grid; grid-template-columns: 40px 2fr 1fr 1fr 0.8fr;
          padding: 12px 12px;
          border-radius: 8px;
          align-items: center;
          transition: background var(--transition);
        }
        .tp-row:hover { background: var(--gray-50); }
        .tp-rank {
          width: 26px; height: 26px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: .8rem; font-weight: 800;
        }
        .rank-1 { background: #fef3c7; color: #d97706; }
        .rank-2 { background: var(--gray-100); color: var(--gray-500); }
        .rank-3 { background: #fde8e0; color: #c05621; }
        .rank-4 { background: var(--blue-50); color: var(--blue-600); }
        .tp-name { font-size: .88rem; font-weight: 600; color: var(--gray-800); }
        .tp-cat { font-size: .72rem; color: var(--gray-400); margin-top: 1px; }
        .tp-units { font-size: .9rem; font-weight: 700; color: var(--gray-800); }
        .tp-times { font-size: .72rem; color: var(--gray-400); margin-top: 1px; }
        .tp-rev { font-size: .9rem; font-weight: 700; color: var(--blue-700); }
        .tp-growth { font-size: .8rem; font-weight: 700; }
        .tp-growth.up { color: var(--success); }
        .tp-growth.down { color: var(--danger); }

        .section-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: var(--gray-900); font-family: 'Syne', sans-serif; }
        .section-sub { font-size: .78rem; color: var(--gray-400); margin-top: 2px; }
        .view-all-btn { font-size: .82rem; font-weight: 600; color: var(--blue-600); background: var(--blue-50); padding: 7px 14px; border-radius: 8px; transition: all var(--transition); border: 1px solid var(--blue-200); }
        .view-all-btn:hover { background: var(--blue-100); }
      `}</style>
    </div>
  );
};

export default TopProducts;
