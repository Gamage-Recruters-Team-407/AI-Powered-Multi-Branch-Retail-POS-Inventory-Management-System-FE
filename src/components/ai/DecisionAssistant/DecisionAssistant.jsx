import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle, AlertCircle, AlertTriangle, X, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DecisionAssistant = ({ darkMode }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOfferAction, setSelectedOfferAction] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState("10");
  const [offerDuration, setOfferDuration] = useState("7");

  // Restock modal state
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedRestockAction, setSelectedRestockAction] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("50");

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';
  const shadow = darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('http://localhost:5001/predict/decisions');
        const json = await res.json();
        if (Array.isArray(json)) {
          const dismissed = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
          const filtered = json.filter(a => !dismissed.includes(a.id));
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
        const res = await fetch(`${API_BASE_URL}/decisions/create-po`, {
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
    } else if (action.action === 'restock') {
      setSelectedRestockAction(action);
      setRestockQuantity(action.suggestedQuantity?.toString() || "50");
      setIsRestockModalOpen(true);
    } else if (action.action === 'send_offer') {
      setSelectedOfferAction(action);
      setIsOfferModalOpen(true);
    } else {
      dismissItem(action.id);
    }
  };

  const handleSendOfferSubmit = async () => {
    if (!selectedOfferAction) return;
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(offerDuration, 10));

      const res = await fetch(`${API_BASE_URL}/decisions/send-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedOfferAction.productId,
          discountValue: discountPercentage,
          endDate: expirationDate.toISOString()
        })
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Offer Created! Promo Code: ${json.couponCode}`);
        setTimeout(() => setSuccessMessage(""), 6000);
        dismissItem(selectedOfferAction.id);
        setIsOfferModalOpen(false);
      } else {
        alert(`Failed: ${json.message || 'Error creating offer'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestockSubmit = async () => {
    if (!selectedRestockAction) return;
    try {
      const res = await fetch(`${API_BASE_URL}/decisions/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedRestockAction.productId,
          branchId: selectedRestockAction.branchId,
          quantity: parseInt(restockQuantity, 10)
        })
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Restock Successful: ${json.message}`);
        setTimeout(() => setSuccessMessage(""), 5000);
        dismissItem(selectedRestockAction.id);
        setIsRestockModalOpen(false);
      } else {
        alert(`Failed: ${json.message || 'Error processing restock'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAll = async () => {
    try {
      await fetch(`${API_BASE_URL}/decisions/approve-all`, { method: 'POST' });
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

                const isRestockActive = isRestockModalOpen && selectedRestockAction?.id === action.id;
                const isOfferActive = isOfferModalOpen && selectedOfferAction?.id === action.id;

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
                        <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px', color: text }}>
                          {action.productName 
                            ? `${action.type.replace('_', ' ')}: ${action.productName}${action.branchName ? ` (${action.branchName})` : ''}` 
                            : action.title}
                        </p>
                        <p style={{ fontSize: '12px', color: text2, margin: 0, lineHeight: 1.5 }}>
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {isRestockActive ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${cardBorder}` }}
                      >
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: text2, marginBottom: '6px' }}>Quantity to Restock</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="number" min="1" 
                            value={restockQuantity}
                            onChange={(e) => setRestockQuantity(e.target.value)}
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: '8px',
                              border: `1px solid ${border}`, background: darkMode ? '#0F172A' : '#FFFFFF',
                              color: text, outline: 'none'
                            }}
                          />
                          <button
                            onClick={() => setIsRestockModalOpen(false)}
                            style={{
                              background: darkMode ? '#334155' : '#E2E8F0', color: text, border: 'none',
                              borderRadius: '8px', padding: '0 16px', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRestockSubmit}
                            style={{
                              background: '#10B981', color: 'white', border: 'none',
                              borderRadius: '8px', padding: '0 16px', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <CheckCircle2 size={16} /> Submit
                          </button>
                        </div>
                      </motion.div>
                    ) : isOfferActive ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${cardBorder}` }}
                      >
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: text2, marginBottom: '4px' }}>Discount (%)</label>
                            <input 
                              type="number" min="1" max="100" 
                              value={discountPercentage}
                              onChange={(e) => setDiscountPercentage(e.target.value)}
                              style={{
                                width: '100%', padding: '8px', borderRadius: '8px',
                                border: `1px solid ${border}`, background: darkMode ? '#0F172A' : '#FFFFFF',
                                color: text, outline: 'none'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: text2, marginBottom: '4px' }}>Duration (Days)</label>
                            <select 
                              value={offerDuration}
                              onChange={(e) => setOfferDuration(e.target.value)}
                              style={{
                                width: '100%', padding: '8px', borderRadius: '8px',
                                border: `1px solid ${border}`, background: darkMode ? '#0F172A' : '#FFFFFF',
                                color: text, outline: 'none'
                              }}
                            >
                              <option value="1">1 Day</option>
                              <option value="7">7 Days</option>
                              <option value="30">30 Days</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setIsOfferModalOpen(false)}
                            style={{
                              flex: 1, background: darkMode ? '#334155' : '#E2E8F0', color: text, border: 'none',
                              borderRadius: '8px', padding: '8px', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendOfferSubmit}
                            style={{
                              flex: 2, background: '#2563EB', color: 'white', border: 'none',
                              borderRadius: '8px', padding: '8px', fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            Generate Promo Code
                          </button>
                        </div>
                      </motion.div>
                    ) : (
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
                          {action.actionText || 'Take Action'}
                        </button>
                      </div>
                    )}
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
            <XCircle size={18} />
            <span className="hidden sm:inline">Dismiss All</span>
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
            <CheckCircle2 size={18} />
            <span className="hidden sm:inline">Approve All</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionAssistant;
