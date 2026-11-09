import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  inventory: 'Inventory Management',
  products: 'Products',
  branches: 'Branch Management',
  employees: 'Employees',
  customers: 'Customers',
  suppliers: 'Suppliers',
  reports: 'Reports & Analytics',
  ai: 'AI Forecasting',
  settings: 'Settings',
};

const MainLayout = ({ children, activeRoute, onNavigate, wsConnected, onRoleChange }) => {
  return (
    <div className="main-layout">
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />
      <div className="layout-main">
        <Topbar
          pageTitle={PAGE_TITLES[activeRoute] || 'Dashboard'}
          wsConnected={wsConnected}
          onRoleChange={onRoleChange}
        />
        <main className="layout-content">
          {children}
        </main>
      </div>
      <style>{`
        .main-layout {
          display: flex;
          min-height: 100vh;
        }
        .layout-main {
          flex: 1;
          margin-left: var(--sidebar-w);
          transition: margin-left var(--transition);
          min-width: 0;
        }
        .layout-content {
          min-height: calc(100vh - var(--topbar-h));
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
