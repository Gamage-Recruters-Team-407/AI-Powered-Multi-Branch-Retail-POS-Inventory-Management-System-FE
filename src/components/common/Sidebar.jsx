import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/dashboard', roles: ['admin', 'manager', 'cashier', 'super_admin'] },
  { id: 'pos', label: 'Point of Sale', icon: '🛒', path: '/pos', roles: ['admin', 'manager', 'cashier', 'super_admin'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'products', label: 'Products', icon: '🏷️', path: '/products', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭', path: '/warehouse', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'branches', label: 'Branches', icon: '🏢', path: '/branches', roles: ['admin', 'super_admin'] },
  { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'customers', label: 'Customers', icon: '👤', path: '/customers', roles: ['admin', 'manager', 'cashier', 'super_admin'] },
  { id: 'suppliers', label: 'Suppliers', icon: '🚚', path: '/suppliers', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'reports', label: 'Reports', icon: '📊', path: '/reports', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'ai', label: 'AI Forecasting', icon: '🤖', path: '/ai', badge: 'NEW', roles: ['admin', 'manager', 'super_admin'] },
  { id: 'audit', label: 'Audit & Security', icon: '🛡️', path: '/audit', badge: 'SECURE', roles: ['admin', 'super_admin'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', roles: ['admin', 'super_admin'] },
];

const Sidebar = ({ activeRoute, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Get current route from location
  const currentPath = location.pathname;
  
  // Find active route based on current path
  const getActiveRouteFromPath = () => {
    const matchedItem = NAV_ITEMS.find(item => currentPath === item.path || currentPath.startsWith(item.path + '/'));
    return matchedItem?.id || activeRoute || 'dashboard';
  };
  
  const activeRouteId = getActiveRouteFromPath();

  // Filter navigation items based on user role
  const filteredItems = NAV_ITEMS.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role) || item.roles.includes('super_admin');
  });

  // Handle navigation
  const handleNavigation = (item) => {
    if (onNavigate) {
      onNavigate(item.id);
    }
    // Use React Router navigation instead of window.location
    navigate(item.path);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
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
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* User role badge */}
      {!collapsed && user && (
        <div className="sidebar-user-info">
          <div className="user-avatar-sm">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="user-name-sm">{user?.name?.split(' ')[0] || 'User'}</div>
            <span className={`role-badge role-${user?.role || 'admin'}`}>
              {user?.role === 'super_admin' ? 'SUPER ADMIN' : (user?.role || 'Admin').toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-label">MAIN MENU</div>}
        {filteredItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeRouteId === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="nav-label-text">{item.label}</span>
                {item.badge && <span className={`nav-badge ${item.id === 'audit' ? 'audit-badge' : ''}`}>{item.badge}</span>}
              </>
            )}
            {activeRouteId === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-w, 260px);
          min-height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 100;
          transition: width 0.2s ease;
          overflow: hidden;
          box-shadow: 2px 0 12px rgba(0,0,0,0.1);
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
        .logo-sub { display: block; color: #60a5fa; font-size: .7rem; font-weight: 500; letter-spacing: .05em; white-space: nowrap; }
        .collapse-btn {
          color: #60a5fa;
          background: rgba(255,255,255,.06);
          border-radius: 6px;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
        }
        .collapse-btn:hover { background: rgba(255,255,255,.12); }

        .sidebar-user-info {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .user-avatar-sm {
          width: 34px; height: 34px; border-radius: 50%;
          background: #3b82f6;
          color: white; font-weight: 700; font-size: .9rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .user-name-sm { color: white; font-size: .82rem; font-weight: 600; }
        .role-badge {
          font-size: .65rem; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; padding: 2px 7px; border-radius: 99px;
        }
        .role-admin { background: #3b82f6; color: white; }
        .role-super_admin { background: #8b5cf6; color: white; }
        .role-manager { background: rgba(16,185,129,.2); color: #6ee7b7; }
        .role-cashier { background: rgba(245,158,11,.15); color: #fcd34d; }

        .sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: rgba(255,255,255,.05); border-radius: 4px; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 4px; }
        
        .nav-label {
          color: #3b82f6;
          font-size: .65rem; font-weight: 700; letter-spacing: .1em;
          padding: 8px 8px 4px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 10px;
          border-radius: 9px;
          color: rgba(255,255,255,.6);
          background: transparent;
          transition: all 0.2s;
          position: relative;
          margin-bottom: 2px;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .nav-item:hover { background: rgba(255,255,255,.07); color: white; }
        .nav-item.active { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59,130,246,.4); }
        .nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 22px; text-align: center; }
        .nav-label-text { font-size: .875rem; font-weight: 500; flex: 1; text-align: left; }
        .nav-badge { 
          font-size: .6rem; font-weight: 700; 
          background: #f59e0b; color: #1e293b; 
          padding: 2px 5px; border-radius: 99px; 
        }
        .nav-badge.audit-badge {
          background: #ef4444;
          color: white;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .nav-indicator { 
          position: absolute; right: 0; top: 50%; 
          transform: translateY(-50%); 
          width: 3px; height: 18px; 
          background: white; 
          border-radius: 99px 0 0 99px; 
        }

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
          transition: all 0.2s;
          font-size: .875rem;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .logout-btn:hover { background: rgba(239,68,68,.15); color: #fca5a5; }

        /* Collapsed state */
        .sidebar.collapsed .nav-label { display: none; }
        .sidebar.collapsed .nav-item { justify-content: center; padding: 10px; }
        .sidebar.collapsed .nav-icon { width: auto; }
        .sidebar.collapsed .logout-btn { justify-content: center; }
      `}</style>
    </aside>
  );
};

export default Sidebar;