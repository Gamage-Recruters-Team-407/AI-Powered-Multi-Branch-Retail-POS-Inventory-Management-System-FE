import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle, AlertCircle, AlertTriangle, X, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DecisionAssistant = ({ darkMode }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';
  const shadow = darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/decisions/suggestions');
        const json = await res.json();
        if (json.success) {
          const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
          const filtered = json.data.filter(a => !dismissed.includes(a.id));
          setActions(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const dismissItem = (id) => {
    setActions(a => a.filter(x => x.id !== id));
    const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
    if (!dismissed.includes(id)) {
      localStorage.setItem('dismissedActions', JSON.stringify([...dismissed, id]));
    }
  };

  const handleDismiss = (id) => dismissItem(id);
  
  const handleAction = async (action) => {
    if (action.action === 'create_po') {
      try {
        const res = await fetch('http://localhost:5000/api/decisions/create-po', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: action.productId,
            quantity: action.suggestedQuantity,
            supplierId: "supp_001"
          })
        });
        const json = await res.json();
        if (json.success) {
          setSuccessMessage(`Success: ${json.message}. PO ID: ${json.poId}`);
          setTimeout(() => setSuccessMessage(""), 3000);
          dismissItem(action.id);
        } else {
          alert(`Failed: ${json.message || 'Error creating PO'}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      dismissItem(action.id);
    }
  };

  const handleApproveAll = async () => {
    try {
      await fetch('http://localhost:5000/api/decisions/approve-all', { method: 'POST' });
    } catch(err) { console.error(err); }
    
    const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
    const newDismissed = [...dismissed, ...actions.map(a => a.id)];
    localStorage.setItem('dismissedActions', JSON.stringify([...new Set(newDismissed)]));
    setActions([]);
  };

  const handleDismissAll = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
    const newDismissed = [...dismissed, ...actions.map(a => a.id)];
    localStorage.setItem('dismissedActions', JSON.stringify([...new Set(newDismissed)]));
    setActions([]);
  };

  const handleScheduleAll = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
    const newDismissed = [...dismissed, ...actions.map(a => a.id)];
    localStorage.setItem('dismissedActions', JSON.stringify([...new Set(newDismissed)]));
    setActions([]);
    setSuccessMessage(`Success: Scheduled ${actions.length} items for later review.`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div style={{
      background: surface,
      borderRadius: '20px',
      border: `1px solid ${border}`,
      boxShadow: shadow,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(37,99,235,0.1)', padding: '8px', borderRadius: '12px', color: '#2563EB' }}>
          <Bot size={20} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: text }}>Decision Assistant</h2>
        {actions.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(37,99,235,0.1)', color: '#2563EB',
            fontSize: '11px', fontWeight: 700,
            padding: '3px 10px', borderRadius: '999px',
          }}>
            {actions.length} items
          </span>
        )}
      </div>

      {successMessage && (
        <div style={{ padding: '10px', background: '#D1FAE5', color: '#10B981', border: '1px solid #10B981', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
          {successMessage}
        </div>
      )}

      {/* Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '120px' }}>
        {loading ? (
          <p style={{ color: text2, fontSize: '13px', textAlign: 'center' }}>Loading suggestions...</p>
        ) : (
          <AnimatePresence>
            {actions.length > 0 ? (
              actions.map(action => {
                const isCritical = action.urgency === 'critical';
                const cardBg = isCritical
                  ? (darkMode ? 'rgba(239,68,68,0.1)' : '#FFF5F5')
                  : (darkMode ? 'rgba(245,158,11,0.1)' : '#FFFBEB');
                const cardBorder = isCritical
                  ? (darkMode ? 'rgba(239,68,68,0.25)' : '#FED7D7')
                  : (darkMode ? 'rgba(245,158,11,0.25)' : '#FDE68A');
                const btnColor = isCritical ? '#EF4444' : '#F59E0B';

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    style={{
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: '14px',
                      padding: '14px',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => handleDismiss(action.id)}
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: text2, padding: '2px',
                      }}
                    >
                      <X size={14} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ color: btnColor, marginTop: '1px', flexShrink: 0 }}>
                        {isCritical ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div style={{ flex: 1, paddingRight: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px', color: text }}>{action.productName ? `${action.type.replace('_', ' ')}: ${action.productName}` : action.title}</p>
                        <p style={{ fontSize: '12px', color: text2, margin: 0, lineHeight: 1.5 }}>
                          {action.currentStock !== undefined ? `Current stock is ${action.currentStock}. Minimum threshold is ${action.reorderLevel}. Recommend ordering ${action.suggestedQuantity} immediately.` : action.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleAction(action)}
                        style={{
                          background: btnColor, color: 'white', border: 'none',
                          borderRadius: '10px', padding: '6px 16px',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.opacity = '0.85'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                      >
                        {action.action === 'create_po' ? 'Create PO' : action.actionText || 'Take Action'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '32px', color: text2, textAlign: 'center',
                }}
              >
                <CheckCircle size={40} color="#10B981" style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p style={{ fontWeight: 600, margin: '0 0 4px', color: text }}>All caught up!</p>
                <p style={{ fontSize: '13px', margin: 0 }}>No pending actions required.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Batch Actions */}
      {actions.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px',
          marginTop: '16px', paddingTop: '16px',
          borderTop: `1px solid ${border}`,
        }}>
          <button
            onClick={handleDismissAll}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: 'none', border: `1px solid ${border}`,
              borderRadius: '10px', padding: '8px',
              fontSize: '12px', fontWeight: 600, color: text2, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <XCircle size={14} /> Dismiss All
          </button>
          <button
            onClick={handleScheduleAll}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: 'rgba(37,99,235,0.1)', border: `1px solid rgba(37,99,235,0.2)`,
              borderRadius: '10px', padding: '8px',
              fontSize: '12px', fontWeight: 600, color: '#2563EB', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={14} /> Schedule
          </button>
          <button
            onClick={handleApproveAll}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              background: '#10B981', border: 'none',
              borderRadius: '10px', padding: '8px',
              fontSize: '12px', fontWeight: 700, color: 'white', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <CheckCircle2 size={14} /> Approve All
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionAssistant;
