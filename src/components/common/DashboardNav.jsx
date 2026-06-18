import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MODULE_NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard & Business O..', icon: '📊', page: 1, path: '/dashboard' },
  { id: 'user-mgmt',     label: 'User Management',          icon: '👥', page: 1, path: '/users' },
  { id: 'branch-mgmt',   label: 'Branch Management',        icon: '🏢', page: 1, path: '/branches' },
  { id: 'employee-mgmt', label: 'Employee Management',      icon: '👔', page: 1, path: '/employees' },
  { id: 'customer-mgmt', label: 'Customer Management',      icon: '👤', page: 2, path: '/customers' },
  { id: 'supplier-mgmt', label: 'Supplier Management',      icon: '🚚', page: 2, path: '/suppliers' },
  { id: 'product-mgmt',  label: 'Product Management',       icon: '📦', page: 2, path: '/products' },
  { id: 'inventory-mgmt',label: 'Inventory Management',     icon: '📊', page: 2, path: '/inventory' },
  { id: 'warehouse-mgmt',label: 'Warehouse Management',     icon: '🏭', page: 2, path: '/warehouse' },
  { id: 'purchase-order',label: 'Purchase Order Manage...',  icon: '📋', page: 2, path: '/purchase-orders' },
  { id: 'pos-sales',     label: 'POS Sales & Billing',      icon: '🛒', page: 3, path: '/pos' },
  { id: 'returns-refund',label: 'Returns & Refund Manag..', icon: '🔄', page: 3, path: '/returns' },
  { id: 'stock-transfer',label: 'Stock Transfer Managem..', icon: '🚛', page: 3, path: '/stock-transfer' },
  { id: 'promotion',     label: 'Promotion & Discount M..', icon: '🏷️', page: 3, path: '/promotions' },
  { id: 'ai-forecast',   label: 'AI Demand Forecasting',    icon: '🤖', page: 3, path: '/ai' },
  { id: 'ai-reorder',    label: 'AI Smart Reordering',      icon: '📈', page: 3, path: '/reordering' },
  { id: 'analytics',     label: 'Business Analytics',       icon: '📉', page: 3, path: '/analytics' },
  { id: 'reporting',     label: 'Reporting',                icon: '📄', page: 4, path: '/reports' },
  { id: 'notifications', label: 'Notifications & Alert',    icon: '🔔', page: 4, path: '/notifications' },
  { id: 'audit-logs',    label: 'Audit Logs & Security',    icon: '🛡️', page: 4, path: '/audit' },
];

export default function DashboardNav() {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = MODULE_NAV_ITEMS.find(item =>
    item.path !== '/dashboard' && location.pathname.startsWith(item.path)
  )?.id || (location.pathname === '/dashboard' ? 'dashboard' : '');

  return (
    <>
      <div className={`floating-nav ${expanded ? 'expanded' : 'collapsed'}`}>
        <button className="nav-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? '◀' : '▶'}
        </button>
        <div className="nav-header">
          <span className="nav-logo">📋</span>
          {expanded && <span className="nav-title">POS Modules</span>}
        </div>
        <div className="nav-items">
          {MODULE_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!expanded ? `${item.label} (Page ${item.page})` : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {expanded && (
                <>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-page">p.{item.page}</span>
                </>
              )}
            </button>
          ))}
        </div>
        {expanded && (
          <div className="nav-footer">
            <div className="nav-badge">Multi-Branch POS</div>
            <div className="nav-module-count">{MODULE_NAV_ITEMS.length} Active Modules</div>
          </div>
        )}
      </div>

      <style>{`
        .floating-nav { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(15px); border-right: 1px solid rgba(255,255,255,0.1); z-index: 100; display: flex; flex-direction: column; transition: width 0.3s ease; box-shadow: 2px 0 20px rgba(0,0,0,0.2); }
        .floating-nav.collapsed { width: 70px; }
        .nav-toggle { position: absolute; right: -12px; top: 20px; width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; cursor: pointer; border: 2px solid white; z-index: 101; transition: transform 0.2s; }
        .nav-toggle:hover { transform: scale(1.1); }
        .nav-header { padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; min-height: 68px; }
        .nav-logo { font-size: 28px; }
        .nav-title { font-size: 18px; font-weight: 700; color: white; }
        .nav-items { flex: 1; overflow-y: auto; padding: 12px 0; }
        .nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: all 0.2s; text-align: left; font-size: 13px; border-radius: 0; }
        .nav-item:hover { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .nav-item.active { background: linear-gradient(90deg, rgba(59,130,246,0.3), transparent); color: #3b82f6; border-left: 3px solid #3b82f6; }
        .nav-icon { font-size: 20px; min-width: 28px; }
        .nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-page { font-size: 10px; color: #64748b; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; }
        .nav-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b; text-align: center; }
        .nav-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 20px; display: inline-block; margin-bottom: 8px; font-weight: 600; font-size: 10px; }
        .nav-module-count { font-size: 10px; }
        .floating-nav.collapsed .nav-label,
        .floating-nav.collapsed .nav-page,
        .floating-nav.collapsed .nav-title,
        .floating-nav.collapsed .nav-footer { display: none; }
        .floating-nav.collapsed .nav-item { justify-content: center; padding: 12px; }
        .floating-nav.collapsed .nav-icon { font-size: 24px; min-width: auto; }
      `}</style>
    </>
  );
}
