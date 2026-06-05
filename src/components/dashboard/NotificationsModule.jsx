import React, { useState, useEffect } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getEmailLogs
} from '../../services/notificationApi';
import toast from 'react-hot-toast';

const formatDistanceToNow = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const NotificationsModule = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'settings'
  const [notifications, setNotifications] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, prefRes, emailRes] = await Promise.all([
        getNotifications(),
        getPreferences(),
        getEmailLogs()
      ]);
      setNotifications(notifRes.data || []);
      setEmailLogs(emailRes.data || []);
      if (prefRes.data) {
        setPreferences({
          emailEnabled: prefRes.data.emailEnabled,
          smsEnabled: prefRes.data.smsEnabled,
          inAppEnabled: prefRes.data.inAppEnabled
        });
      }
    } catch (error) {
      toast.error('Failed to load notifications data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleTogglePref = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await updatePreferences(preferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'low_stock': return '⚠️';
      case 'new_product': return '📦';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="notifications-module" style={{ background: 'white', borderRadius: '28px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <div className="module-header-custom" style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div className="module-icon-custom" style={{ fontSize: '32px', marginRight: '16px' }}>🔔</div>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px', color: '#1e293b', fontWeight: 'bold' }}>Notifications & Alerts</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View your recent alerts and manage your delivery settings.</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'history' ? '#eff6ff' : 'transparent',
            color: activeTab === 'history' ? '#2563eb' : '#64748b',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          History
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'settings' ? '#eff6ff' : 'transparent',
            color: activeTab === 'settings' ? '#2563eb' : '#64748b',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Alert Settings
        </button>
        <button 
          onClick={() => setActiveTab('emails')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'emails' ? '#eff6ff' : 'transparent',
            color: activeTab === 'emails' ? '#2563eb' : '#64748b',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Emails
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading data...</div>
      ) : activeTab === 'history' ? (
        // HISTORY TAB
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button 
              onClick={handleMarkAllAsRead}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              ✓ Mark All Read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              You have no notifications yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {notifications.map(notif => (
                <div 
                  key={notif._id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: '16px', 
                    background: notif.isRead ? '#f8fafc' : '#eff6ff', 
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: notif.isRead ? '#e2e8f0' : '#bfdbfe',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '24px', marginRight: '16px', marginTop: '2px' }}>
                    {getIconForType(notif.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: notif.isRead ? '500' : '700' }}>{notif.title || 'System Alert'}</h4>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      style={{ marginLeft: '16px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'settings' ? (
        // SETTINGS TAB
        <div style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Delivery Channels</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Choose how you want to receive critical alerts like low stock and report generations.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Toggle Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>In-App Dashboard Alerts</h4>
                  <p style={{ margin: 0, marginTop: '4px', color: '#64748b', fontSize: '13px' }}>See notifications right here in the top right corner.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={preferences.inAppEnabled} onChange={() => handleTogglePref('inAppEnabled')} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '24px', background: preferences.inAppEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '24px', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: preferences.inAppEnabled ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </div>
                </label>
              </div>

              {/* Toggle Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Email Notifications</h4>
                  <p style={{ margin: 0, marginTop: '4px', color: '#64748b', fontSize: '13px' }}>Receive detailed alerts directly to your registered inbox.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={preferences.emailEnabled} onChange={() => handleTogglePref('emailEnabled')} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '24px', background: preferences.emailEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '24px', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: preferences.emailEnabled ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </div>
                </label>
              </div>

              {/* Toggle Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>SMS Notifications</h4>
                  <p style={{ margin: 0, marginTop: '4px', color: '#64748b', fontSize: '13px' }}>Get instant text messages for urgent low-stock events.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={preferences.smsEnabled} onChange={() => handleTogglePref('smsEnabled')} style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '24px', background: preferences.smsEnabled ? '#3b82f6' : '#cbd5e1', borderRadius: '24px', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: preferences.smsEnabled ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={savePreferences}
              disabled={savingPrefs}
              style={{ marginTop: '24px', padding: '12px 24px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: savingPrefs ? 'not-allowed' : 'pointer', opacity: savingPrefs ? 0.7 : 1 }}
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      ) : (
        // EMAILS TAB
        <div>
          {emailLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              No email logs found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
              {emailLogs.map(log => (
                <div 
                  key={log._id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontSize: '24px', marginRight: '16px', marginTop: '2px' }}>
                    {log.status === 'Sent' ? '📧' : '❌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>To: {log.recipient}</h4>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {log.createdAt ? formatDistanceToNow(new Date(log.createdAt)) : 'Unknown time'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 8px 0', color: '#475569', fontSize: '14px', fontWeight: '500' }}>Subject: {log.subject}</p>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', whiteSpace: 'pre-wrap' }}>
                      {log.text}
                    </div>
                    {log.status === 'Failed' && (
                      <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '500' }}>
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsModule;
