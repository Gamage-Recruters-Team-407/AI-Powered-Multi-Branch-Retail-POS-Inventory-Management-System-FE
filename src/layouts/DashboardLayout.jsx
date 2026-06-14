import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { id: 'pos', label: 'Point of Sale', icon: '🛒', path: '/pos', roles: ['admin', 'manager', 'cashier'] },
  { id: 'products', label: 'Products', icon: '🏷️', path: '/products', roles: ['admin', 'manager'] },
  { id: 'warehouse', label: 'Warehouse', icon: '🏭', path: '/warehouse', roles: ['admin', 'manager'] },
  { id: 'branches', label: 'Branches', icon: '🏢', path: '/branches', roles: ['admin'] },
  { id: 'employees', label: 'Employees', icon: '👥', path: '/employees', roles: ['admin', 'manager'] },
  { id: 'customers', label: 'Customers', icon: '👤', path: '/customers', roles: ['admin', 'manager', 'cashier'] },
  { id: 'reports', label: 'Reports', icon: '📊', path: '/reports', roles: ['admin', 'manager'] },
  { id: 'ai', label: 'AI Forecasting', icon: '🤖', path: '/ai', badge: 'NEW', roles: ['admin', 'manager'] },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/warehouse': 'Warehouse Management',
  '/products': 'Products',
  '/branches': 'Branches',
  '/employees': 'Employees',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/ai': 'AI Forecasting',
  '/pos': 'Point of Sale',
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  // active route: match /warehouse/:id → 'warehouse', /warehouse → 'warehouse'
  const getActiveId = () => {
    const path = location.pathname;
    for (const item of NAV_ITEMS) {
      if (path === item.path || path.startsWith(item.path + '/')) return item.id;
    }
    return 'dashboard';
  };
  const activeId = getActiveId();

  const pageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/warehouse/')) return 'Warehouse Details';
    return PAGE_TITLES[path] || 'RetailPOS';
  };

  const sidebarW = collapsed ? 68 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 100,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 14px', borderBottom: '1px solid rgba(255,255,255,.08)',
          minHeight: 64,
        }}>
          <div style={{ width: 34, height: 34, flexShrink: 0 }}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#2563eb"/>
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="22" r="4" fill="white" opacity=".9"/>
              <path d="M22.5 22l1 1 2-2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>RetailPOS</div>
              <div style={{ color: '#60a5fa', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.05em' }}>Multi-Branch</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: '#60a5fa', background: 'rgba(255,255,255,.06)',
              border: 'none', borderRadius: 6,
              width: 24, height: 24, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.06)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#2563eb', color: 'white', fontWeight: 700,
              fontSize: '0.85rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', padding: '2px 7px', borderRadius: 99,
                background: '#2563eb', color: 'white',
              }}>{user?.role || 'Admin'}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {!collapsed && (
            <div style={{ color: '#3b82f6', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', padding: '8px 8px 4px' }}>
              MAIN MENU
            </div>
          )}
          {filtered.map(item => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 10px',
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,.6)',
                  transition: 'all 0.2s',
                  marginBottom: 2, whiteSpace: 'nowrap', position: 'relative',
                  boxShadow: isActive ? '0 4px 12px rgba(37,99,235,.4)' : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}
              >
                <span style={{ fontSize: '1.05rem', flexShrink: 0, width: 22, textAlign: 'center' }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, background: '#f59e0b', color: '#1e293b', padding: '2px 5px', borderRadius: 99 }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isActive && (
                  <span style={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 18, background: 'white', borderRadius: '99px 0 0 99px',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 10px',
              borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,.5)',
              fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ marginLeft: sidebarW, flex: 1, transition: 'margin-left 0.25s ease', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 60, background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{pageTitle()}</h1>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
              RetailPOS › {pageTitle()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
