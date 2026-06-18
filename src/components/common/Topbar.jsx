import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Topbar = ({ pageTitle, onRoleChange }) => {
  const { user } = useAuth();
  const { notifications = [], wsConnected = false, removeNotification, clearAll } = useNotification() || {};
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{pageTitle}</h1>
        <div className="breadcrumb">
          <span>RetailPOS</span>
          <span className="bc-sep">›</span>
          <span className="bc-active">{pageTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live clock */}
        <div className="live-clock">
          <span className="clock-time">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="clock-date">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* WS Status */}
        <div className={`ws-status ${wsConnected ? 'online' : 'offline'}`}>
          <span className="ws-dot" />
          <span>{wsConnected ? 'Live' : 'Offline'}</span>
        </div>

        {/* Role switcher (demo) */}
        <select className="role-switcher" onChange={e => onRoleChange?.(e.target.value)} defaultValue={user?.role}>
          <option value="admin">Admin View</option>
          <option value="manager">Manager View</option>
          <option value="cashier">Cashier View</option>
        </select>

        {/* Notifications */}
        <div className="notif-wrapper">
          <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
          </button>
          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                <div style={{display: 'flex', gap: '10px'}}>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} style={{fontSize: '0.8rem', color: 'var(--blue-500)', fontWeight: 'bold'}}>Clear</button>
                  )}
                  <button onClick={() => setNotifOpen(false)}>×</button>
                </div>
              </div>
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {notifications.length === 0 ? (
                  <div style={{padding: '20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.9rem'}}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item notif-${n.type}`}>
                      <span className="notif-dot" />
                      <div style={{flex: 1}}>
                        <div className="notif-msg">{n.msg}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      <button 
                        onClick={() => removeNotification(n.id)}
                        style={{background: 'none', border: 'none', color: 'var(--gray-300)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px'}}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="user-avatar">
          {user?.name?.charAt(0)}
          <span className="user-tooltip">{user?.name} • {user?.branch}</span>
        </div>
      </div>

      <style>{`
        .topbar {
          height: var(--topbar-h);
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px;
          position: sticky; top: 0; z-index: 50;
          box-shadow: var(--shadow-sm);
        }
        .topbar-left {}
        .page-title { font-size: 1.3rem; font-weight: 700; color: var(--gray-900); font-family: 'Syne', sans-serif; }
        .breadcrumb { display: flex; align-items: center; gap: 4px; font-size: .75rem; color: var(--gray-400); margin-top: 1px; }
        .bc-sep { color: var(--gray-300); }
        .bc-active { color: var(--blue-600); font-weight: 500; }

        .topbar-right { display: flex; align-items: center; gap: 14px; }

        .live-clock { text-align: right; }
        .clock-time { display: block; font-size: .95rem; font-weight: 700; color: var(--gray-800); }
        .clock-date { font-size: .72rem; color: var(--gray-400); }

        .ws-status {
          display: flex; align-items: center; gap: 5px;
          font-size: .75rem; font-weight: 600;
          padding: 5px 10px; border-radius: 99px;
        }
        .ws-status.online { background: var(--success-light); color: var(--success); }
        .ws-status.offline { background: var(--danger-light); color: var(--danger); }
        .ws-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: currentColor;
          animation: blink 1.5s infinite;
        }

        .role-switcher {
          padding: 6px 10px; border-radius: 8px;
          border: 1.5px solid var(--gray-200);
          font-size: .8rem; font-weight: 600; color: var(--gray-700);
          background: var(--gray-50); cursor: pointer;
          transition: border-color var(--transition);
        }
        .role-switcher:hover { border-color: var(--blue-400); }

        .notif-wrapper { position: relative; }
        .notif-btn {
          position: relative; background: var(--gray-50); border: 1.5px solid var(--gray-200);
          border-radius: 9px; padding: 7px 10px; font-size: 1rem;
          transition: all var(--transition);
        }
        .notif-btn:hover { border-color: var(--blue-400); background: var(--blue-50); }
        .notif-count {
          position: absolute; top: -4px; right: -4px;
          background: var(--danger); color: white;
          font-size: .6rem; font-weight: 800;
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .notif-panel {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: var(--white); border-radius: var(--radius);
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-md);
          width: 320px; z-index: 200;
          animation: fadeIn .18s ease;
        }
        .notif-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px; border-bottom: 1px solid var(--gray-100);
          font-weight: 700; font-size: .9rem; color: var(--gray-800);
        }
        .notif-header button { background: none; color: var(--gray-400); font-size: 1.2rem; }
        .notif-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 12px 16px; border-bottom: 1px solid var(--gray-50);
          transition: background var(--transition);
        }
        .notif-item:hover { background: var(--gray-50); }
        .notif-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .notif-warning .notif-dot { background: var(--warning); }
        .notif-success .notif-dot { background: var(--success); }
        .notif-info .notif-dot { background: var(--blue-500); }
        .notif-msg { font-size: .82rem; color: var(--gray-700); line-height: 1.4; }
        .notif-time { font-size: .72rem; color: var(--gray-400); margin-top: 2px; }

        .user-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--blue-600);
          color: white; font-weight: 700; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative;
          border: 2px solid var(--blue-200);
          transition: border-color var(--transition);
        }
        .user-avatar:hover { border-color: var(--blue-500); }
        .user-tooltip {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: var(--gray-900); color: white;
          font-size: .75rem; font-weight: 500;
          padding: 6px 12px; border-radius: 8px;
          white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity var(--transition);
        }
        .user-avatar:hover .user-tooltip { opacity: 1; }
      `}</style>
    </header>
  );
};

export default Topbar;
