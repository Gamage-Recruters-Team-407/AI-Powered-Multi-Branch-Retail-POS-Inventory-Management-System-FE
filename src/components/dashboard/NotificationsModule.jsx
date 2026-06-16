import React, { useState, useEffect } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getEmailLogs,
  sendSmsToSuppliers,
  sendSmsToWarehouses,
  sendSupplierNotifications,
  sendEmployeeNotifications,
  sendCustomerNotifications
} from '../../services/notificationApi';
import { getAllSuppliers } from '../../services/supplierManagementApi';
import { getAllWarehouses } from '../../services/warehouseService';
import { getAllEmployees } from '../../services/employeeApi';
import { getAllCustomers } from '../../services/customerApi';
import { getPromotions } from '../../services/promotionApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const isCashier = user?.role === 'CASHIER' || user?.role === 'cashier';
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

  // Supplier Notification Feature State
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [smsMessage, setSmsMessage] = useState('');
  const [supplierSubject, setSupplierSubject] = useState('');
  const [sendViaSms, setSendViaSms] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  // Warehouse SMS Feature State
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [warehouseSmsMessage, setWarehouseSmsMessage] = useState('');
  const [sendingWarehouseSms, setSendingWarehouseSms] = useState(false);

  // Employee Notification Feature State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSubject, setEmployeeSubject] = useState('');
  const [employeeMessage, setEmployeeMessage] = useState('');
  const [sendEmployeeViaSms, setSendEmployeeViaSms] = useState(true);
  const [sendEmployeeViaEmail, setSendEmployeeViaEmail] = useState(false);
  const [sendingEmployeeNotif, setSendingEmployeeNotif] = useState(false);

  // Customer Promos Feature State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState('');
  const [customerSubject, setCustomerSubject] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [sendCustomerViaSms, setSendCustomerViaSms] = useState(true);
  const [sendCustomerViaEmail, setSendCustomerViaEmail] = useState(false);
  const [sendingCustomerNotif, setSendingCustomerNotif] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, prefRes, emailRes, supplierRes, warehouseRes, employeeRes, customerRes, promotionRes] = await Promise.all([
        getNotifications(),
        getPreferences(),
        !isCashier ? getEmailLogs() : Promise.resolve({ data: [] }),
        !isCashier ? getAllSuppliers() : Promise.resolve({ data: [] }),
        !isCashier ? getAllWarehouses() : Promise.resolve({ data: [] }),
        !isCashier ? getAllEmployees() : Promise.resolve({ data: [] }),
        !isCashier ? getAllCustomers() : Promise.resolve({ data: [] }),
        !isCashier ? getPromotions() : Promise.resolve({ data: [] })
      ]);
      setNotifications(notifRes.data || []);
      setEmailLogs(emailRes.data || []);
      setSuppliers(supplierRes.data?.data || []);
      setWarehouses(warehouseRes.data || []);
      
      // employeeRes.data structure is { success: true, employees: [...] }
      const empData = employeeRes.data || {};
      setEmployees(empData.employees || empData.data || (Array.isArray(empData) ? empData : []));
      
      const custData = customerRes.data || {};
      setCustomers(custData.customers || custData.data || (Array.isArray(custData) ? custData : []));

      const promoData = promotionRes.data || {};
      const allPromotions = promoData.promotions || promoData.data || (Array.isArray(promoData) ? promoData : []);
      // Filter out inactive or expired promotions
      const now = new Date();
      const validPromotions = allPromotions.filter(p => p.isActive && new Date(p.endDate) >= now);
      setPromotions(validPromotions);
      
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
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
        {!isCashier && (
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
        )}
        {!isCashier && (
          <button
            onClick={() => setActiveTab('sms')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'sms' ? '#eff6ff' : 'transparent',
              color: activeTab === 'sms' ? '#2563eb' : '#64748b',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Supplier Notifications
          </button>
        )}
        {!isCashier && (
          <button
            onClick={() => setActiveTab('warehouse-sms')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'warehouse-sms' ? '#eff6ff' : 'transparent',
              color: activeTab === 'warehouse-sms' ? '#2563eb' : '#64748b',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Warehouse SMS
          </button>
        )}
        {!isCashier && (
          <button
            onClick={() => setActiveTab('employee-notif')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'employee-notif' ? '#eff6ff' : 'transparent',
              color: activeTab === 'employee-notif' ? '#2563eb' : '#64748b',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Employee Notifications
          </button>
        )}
        {!isCashier && (
          <button
            onClick={() => setActiveTab('customer-promo')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'customer-promo' ? '#eff6ff' : 'transparent',
              color: activeTab === 'customer-promo' ? '#2563eb' : '#64748b',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Customer Promos
          </button>
        )}
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
      ) : activeTab === 'emails' && !isCashier ? (
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
      ) : activeTab === 'sms' && !isCashier ? (
        // SUPPLIER NOTIFICATIONS TAB
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Send Notifications to Suppliers</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Select suppliers and broadcast a custom message via SMS, Email, or both.</p>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Left side: Supplier List */}
            <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '550px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>Select Suppliers</h4>
                <button
                  onClick={() => {
                    if (selectedSuppliers.length === suppliers.length && suppliers.length > 0) {
                      setSelectedSuppliers([]);
                    } else {
                      setSelectedSuppliers(suppliers.map(s => s._id));
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  {selectedSuppliers.length === suppliers.length && suppliers.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {suppliers.length === 0 ? (
                <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No suppliers available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {suppliers.map(supplier => (
                    <label key={supplier._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuppliers(prev => [...prev, supplier._id]);
                          } else {
                            setSelectedSuppliers(prev => prev.filter(id => id !== supplier._id));
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{supplier.companyName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{supplier.contactPerson} • {supplier.phone} • {supplier.email || 'No email'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Message Composition */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: 0, marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>Broadcast Settings</h4>

                {/* Channel Selection */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1e293b' }}>
                    <input type="checkbox" checked={sendViaSms} onChange={e => setSendViaSms(e.target.checked)} />
                    Send via SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1e293b' }}>
                    <input type="checkbox" checked={sendViaEmail} onChange={e => setSendViaEmail(e.target.checked)} />
                    Send via Email
                  </label>
                </div>

                {sendViaEmail && (
                  <input
                    type="text"
                    value={supplierSubject}
                    onChange={(e) => setSupplierSubject(e.target.value)}
                    placeholder="Email Subject Line"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                  />
                )}

                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type your message content here..."
                  style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedSuppliers.length} supplier(s) selected
                  </span>
                  <button
                    disabled={
                      sendingSms ||
                      selectedSuppliers.length === 0 ||
                      !smsMessage.trim() ||
                      (!sendViaSms && !sendViaEmail) ||
                      (sendViaEmail && !supplierSubject.trim())
                    }
                    onClick={async () => {
                      setSendingSms(true);
                      try {
                        await sendSupplierNotifications(selectedSuppliers, smsMessage, supplierSubject, sendViaSms, sendViaEmail);
                        toast.success('Broadcast sent successfully!');
                        setSmsMessage('');
                        setSupplierSubject('');
                        setSelectedSuppliers([]);
                      } catch (error) {
                        toast.error(`Failed to send notifications: ${error.message}`);
                      } finally {
                        setSendingSms(false);
                      }
                    }}
                    style={{
                      background: (sendingSms || selectedSuppliers.length === 0 || !smsMessage.trim()) ? '#cbd5e1' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: (sendingSms || selectedSuppliers.length === 0 || !smsMessage.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {sendingSms ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'warehouse-sms' && !isCashier ? (
        // WAREHOUSE SMS TAB
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Send SMS to Warehouses</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Select warehouses and broadcast a custom SMS message to managers.</p>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Left side: Warehouse List */}
            <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>Select Warehouses</h4>
                <button
                  onClick={() => {
                    if (selectedWarehouses.length === warehouses.length && warehouses.length > 0) {
                      setSelectedWarehouses([]);
                    } else {
                      setSelectedWarehouses(warehouses.map(w => w._id));
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  {selectedWarehouses.length === warehouses.length && warehouses.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {warehouses.length === 0 ? (
                <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No warehouses available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {warehouses.map(warehouse => (
                    <label key={warehouse._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="checkbox"
                        checked={selectedWarehouses.includes(warehouse._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWarehouses(prev => [...prev, warehouse._id]);
                          } else {
                            setSelectedWarehouses(prev => prev.filter(id => id !== warehouse._id));
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{warehouse.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{warehouse.location} • {warehouse.phone || 'No phone'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Message Composition */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: 0, marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>Message Content</h4>
                <textarea
                  value={warehouseSmsMessage}
                  onChange={(e) => setWarehouseSmsMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedWarehouses.length} warehouse(s) selected
                  </span>
                  <button
                    disabled={sendingWarehouseSms || selectedWarehouses.length === 0 || !warehouseSmsMessage.trim()}
                    onClick={async () => {
                      setSendingWarehouseSms(true);
                      try {
                        await sendSmsToWarehouses(selectedWarehouses, warehouseSmsMessage);
                        toast.success('Warehouse SMS sent successfully!');
                        setWarehouseSmsMessage('');
                        setSelectedWarehouses([]);
                      } catch (error) {
                        toast.error(`Failed to send SMS: ${error.message}`);
                      } finally {
                        setSendingWarehouseSms(false);
                      }
                    }}
                    style={{
                      background: (sendingWarehouseSms || selectedWarehouses.length === 0 || !warehouseSmsMessage.trim()) ? '#cbd5e1' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: (sendingWarehouseSms || selectedWarehouses.length === 0 || !warehouseSmsMessage.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {sendingWarehouseSms ? 'Sending...' : 'Send SMS'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'employee-notif' && !isCashier ? (
        // EMPLOYEE NOTIFICATIONS TAB
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Send Notifications to Employees</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Select employees and broadcast a custom message via SMS, Email, or both.</p>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Left side: Employee List */}
            <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '550px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>Select Employees</h4>
                <button
                  onClick={() => {
                    if (selectedEmployees.length === employees.length && employees.length > 0) {
                      setSelectedEmployees([]);
                    } else {
                      setSelectedEmployees(employees.map(e => e._id));
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  {selectedEmployees.length === employees.length && employees.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {employees.length === 0 ? (
                <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No employees available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {employees.map(employee => (
                    <label key={employee._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(prev => [...prev, employee._id]);
                          } else {
                            setSelectedEmployees(prev => prev.filter(id => id !== employee._id));
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{employee.firstName} {employee.lastName} ({employee.role || 'Employee'})</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{employee.phone || 'No phone'} • {employee.email || 'No email'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Message Composition */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: 0, marginBottom: '16px', fontSize: '15px', color: '#1e293b' }}>Broadcast Settings</h4>

                {/* Channel Selection */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1e293b' }}>
                    <input type="checkbox" checked={sendEmployeeViaSms} onChange={e => setSendEmployeeViaSms(e.target.checked)} />
                    Send via SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1e293b' }}>
                    <input type="checkbox" checked={sendEmployeeViaEmail} onChange={e => setSendEmployeeViaEmail(e.target.checked)} />
                    Send via Email
                  </label>
                </div>

                {sendEmployeeViaEmail && (
                  <input
                    type="text"
                    value={employeeSubject}
                    onChange={(e) => setEmployeeSubject(e.target.value)}
                    placeholder="Email Subject Line"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                  />
                )}

                <textarea
                  value={employeeMessage}
                  onChange={(e) => setEmployeeMessage(e.target.value)}
                  placeholder="Type your message content here..."
                  style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedEmployees.length} employee(s) selected
                  </span>
                  <button
                    disabled={
                      sendingEmployeeNotif ||
                      selectedEmployees.length === 0 ||
                      !employeeMessage.trim() ||
                      (!sendEmployeeViaSms && !sendEmployeeViaEmail) ||
                      (sendEmployeeViaEmail && !employeeSubject.trim())
                    }
                    onClick={async () => {
                      setSendingEmployeeNotif(true);
                      try {
                        await sendEmployeeNotifications(selectedEmployees, employeeMessage, employeeSubject, sendEmployeeViaSms, sendEmployeeViaEmail);
                        toast.success('Broadcast sent to employees successfully!');
                        setEmployeeMessage('');
                        setEmployeeSubject('');
                        setSelectedEmployees([]);
                      } catch (error) {
                        toast.error(`Failed to send notifications: ${error.message}`);
                      } finally {
                        setSendingEmployeeNotif(false);
                      }
                    }}
                    style={{
                      background: (sendingEmployeeNotif || selectedEmployees.length === 0 || !employeeMessage.trim()) ? '#cbd5e1' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: (sendingEmployeeNotif || selectedEmployees.length === 0 || !employeeMessage.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {sendingEmployeeNotif ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'customer-promo' ? (
        // CUSTOMER PROMOS TAB
        <div style={{ display: 'flex', gap: '24px', height: '500px' }}>
          {/* Left Column: Customers List */}
          <div style={{ flex: '0 0 35%', borderRight: '1px solid #e2e8f0', paddingRight: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Customers</h3>
              <button
                onClick={() => {
                  if (selectedCustomers.length === customers.length && customers.length > 0) {
                    setSelectedCustomers([]);
                  } else {
                    setSelectedCustomers(customers.map(c => c._id));
                  }
                }}
                style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}
              >
                {selectedCustomers.length === customers.length && customers.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            {customers.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No customers found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customers.map(customer => (
                  <label key={customer._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: selectedCustomers.includes(customer._id) ? '#f8fafc' : 'transparent', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedCustomers.includes(customer._id) ? '#cbd5e1' : 'transparent', transition: 'all 0.2s' }}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCustomers([...selectedCustomers, customer._id]);
                        else setSelectedCustomers(selectedCustomers.filter(id => id !== customer._id));
                      }}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>{customer.firstName} {customer.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{customer.phone || customer.email || 'No contact info'} | Tier: {customer.customerType || 'Bronze'}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Compose Broadcast */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px' }}>Compose Broadcast</h3>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: '1', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569', fontSize: '14px' }}>Select Active Promotion</label>
                <select
                  value={selectedPromotionId}
                  onChange={(e) => {
                    const promoId = e.target.value;
                    setSelectedPromotionId(promoId);
                    if (promoId) {
                      const promo = promotions.find(p => p._id === promoId);
                      if (promo) {
                        setCustomerSubject(`🎉 Special Offer: ${promo.title}`);
                        setCustomerMessage(`Hi there! We are running a new promotion: ${promo.title}. Use code ${promo.couponCode || 'at checkout'} to get ${promo.discountType === 'PERCENTAGE' ? promo.discountValue + '%' : '$' + promo.discountValue} off your next purchase! Valid until ${new Date(promo.endDate).toLocaleDateString()}. Don't miss out!`);
                      }
                    } else {
                      setCustomerSubject('');
                      setCustomerMessage('');
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Choose a valid promotion --</option>
                  {promotions.map(promo => (
                    <option key={promo._id} value={promo._id}>{promo.title} (Valid until {new Date(promo.endDate).toLocaleDateString()})</option>
                  ))}
                </select>
                {promotions.length === 0 && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>No active promotions found. Please create one first.</p>
                )}
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  <input type="checkbox" checked={sendCustomerViaSms} onChange={e => setSendCustomerViaSms(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Send via SMS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  <input type="checkbox" checked={sendCustomerViaEmail} onChange={e => setSendCustomerViaEmail(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Send via Email
                </label>
              </div>

              {sendCustomerViaEmail && (
                <input
                  type="text"
                  value={customerSubject}
                  onChange={(e) => setCustomerSubject(e.target.value)}
                  placeholder="Email Subject"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                />
              )}

              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Type your message content here..."
                style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {selectedCustomers.length} customer(s) selected
                </span>
                <button
                  disabled={
                    sendingCustomerNotif ||
                    selectedCustomers.length === 0 ||
                    !customerMessage.trim() ||
                    (!sendCustomerViaSms && !sendCustomerViaEmail) ||
                    (sendCustomerViaEmail && !customerSubject.trim())
                  }
                  onClick={async () => {
                    setSendingCustomerNotif(true);
                    try {
                      await sendCustomerNotifications(selectedCustomers, customerMessage, customerSubject, sendCustomerViaSms, sendCustomerViaEmail);
                      toast.success('Promotional broadcast sent successfully!');
                      setCustomerMessage('');
                      setCustomerSubject('');
                      setSelectedPromotionId('');
                      setSelectedCustomers([]);
                    } catch (error) {
                      toast.error(`Failed to send broadcast: ${error.message}`);
                    } finally {
                      setSendingCustomerNotif(false);
                    }
                  }}
                  style={{
                    background: (sendingCustomerNotif || selectedCustomers.length === 0 || !customerMessage.trim()) ? '#cbd5e1' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: (sendingCustomerNotif || selectedCustomers.length === 0 || !customerMessage.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {sendingCustomerNotif ? 'Sending...' : 'Broadcast'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsModule;
