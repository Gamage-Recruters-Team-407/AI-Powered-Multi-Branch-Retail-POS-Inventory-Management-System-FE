import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/dashboard', roles: ['admin', 'manager', 'cashier'] },
  { id: 'pos', label: 'Point of Sale', icon: '🛒', path: '/pos', roles: ['admin', 'manager', 'cashier'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory', roles: ['admin', 'manager'] },
  { id: 'products', label: 'Products', icon: '🏷️', path: '/products', roles: ['admin', 'manager'] },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭', path: '/warehouse', roles: ['admin', 'manager'] },
  { id: 'branches', label: 'Branches', icon: '🏢', path: '/branches', roles: ['admin'] },
  { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', roles: ['admin', 'manager'] },
  { id: 'customers', label: 'Customers', icon: '👤', path: '/customers', roles: ['admin', 'manager', 'cashier'] },
  { id: 'suppliers', label: 'Suppliers', icon: '🚚', path: '/suppliers', roles: ['admin', 'manager'] },
  { id: 'reports', label: 'Reports', icon: '📊', path: '/reports', roles: ['admin', 'manager'] },
  { id: 'ai', label: 'AI Forecasting', icon: '🤖', path: '/ai', badge: 'NEW', roles: ['admin', 'manager'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', roles: ['admin'] },
  { id: 'audit', label: 'Audit & Security', icon: '🛡️', path: '/audit', roles: ['admin'] },
];

const Sidebar = ({ activeRoute, onNavigate }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  // 🔥 Force Navigation Function
  const handleForceNavigation = (item) => {
    if (onNavigate) {
      onNavigate(item.id); 
    }
    // Kelinma URL eka change karanawa browser ekenma!
    window.location.href = item.path; 
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#2563eb"/>
            <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="22" r="4" fill="white" opacity=".9"/>
            <path d="M22.5 22l1 1 2-2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">RetailPOS</span>
            <span className="logo-sub">Multi-Branch</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* User role badge */}
      {!collapsed && (
        <div className="sidebar-user-info">
          <div className="user-avatar-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="user-name-sm">{user?.name || 'User'}</div>
            <span className={`role-badge role-${user?.role || 'admin'}`}>{user?.role || 'Admin'}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">{!collapsed && 'MAIN MENU'}</div>
        {filtered.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeRoute === item.id ? 'active' : ''}`}
            onClick={() => handleForceNavigation(item)} // 🔥 Use Force Navigation
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="nav-label-text">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </>
            )}
            {activeRoute === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--blue-950);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 100;
          transition: width var(--transition);
          overflow: hidden;
        }
        .sidebar.collapsed { width: 68px; }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          min-height: 68px;
        }
        .logo-icon svg { width: 36px; height: 36px; flex-shrink: 0; }
        .logo-text { flex: 1; overflow: hidden; }
        .logo-name { display: block; color: white; font-weight: 800; font-size: 1rem; font-family: 'Syne', sans-serif; white-space: nowrap; }
        .logo-sub { display: block; color: var(--blue-400); font-size: .7rem; font-weight: 500; letter-spacing: .05em; white-space: nowrap; }
        .collapse-btn {
          color: var(--blue-400);
          background: rgba(255,255,255,.06);
          border-radius: 6px;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          transition: background var(--transition);
        }
        .collapse-btn:hover { background: rgba(255,255,255,.12); }

        .sidebar-user-info {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .user-avatar-sm {
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--blue-600);
          color: white; font-weight: 700; font-size: .9rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .user-name-sm { color: white; font-size: .82rem; font-weight: 600; }
        .role-badge {
          font-size: .65rem; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; padding: 2px 7px; border-radius: 99px;
        }
        .role-admin { background: var(--blue-600); color: white; }
        .role-manager { background: rgba(16,185,129,.2); color: #6ee7b7; }
        .role-cashier { background: rgba(245,158,11,.15); color: #fcd34d; }

        .sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
        .nav-label {
          color: var(--blue-500);
          font-size: .65rem; font-weight: 700; letter-spacing: .1em;
          padding: 8px 8px 4px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 10px;
          border-radius: 9px;
          color: rgba(255,255,255,.6);
          background: transparent;
          transition: all var(--transition);
          position: relative;
          margin-bottom: 2px;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .nav-item:hover { background: rgba(255,255,255,.07); color: white; }
        .nav-item.active { background: var(--blue-600); color: white; box-shadow: 0 4px 12px rgba(37,99,235,.4); }
        .nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 22px; text-align: center; }
        .nav-label-text { font-size: .875rem; font-weight: 500; flex: 1; text-align: left; }
        .nav-badge { font-size: .6rem; font-weight: 700; background: #f59e0b; color: #1e293b; padding: 2px 5px; border-radius: 99px; }
        .nav-indicator { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 18px; background: white; border-radius: 99px 0 0 99px; }

        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .logout-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px;
          border-radius: 9px;
          color: rgba(255,255,255,.5);
          background: transparent;
          transition: all var(--transition);
          font-size: .875rem;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .logout-btn:hover { background: rgba(239,68,68,.15); color: #fca5a5; }
      `}</style>
    </aside>
  );
};

export default Sidebar;