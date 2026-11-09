import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api/chat';
const SESSION_ID = 'test-session-12345'; // Hardcoded for this demo, should be dynamic in production

const ChatHistoryPanel = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/history/${SESSION_ID}`);
      if (res.data.success) {
        setHistory(res.data.data.reverse()); // Show newest first
      }
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(msg => msg._id)));
    }
  };

  const handleDeleteIndividual = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/message/${id}`);
      setHistory(prev => prev.filter(msg => msg._id !== id));
      if (selectedIds.has(id)) {
        toggleSelect(id);
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await axios.post(`${API_BASE_URL}/messages/bulk-delete`, {
        messageIds: Array.from(selectedIds)
      });
      setHistory(prev => prev.filter(msg => !selectedIds.has(msg._id)));
      setSelectedIds(new Set());
    } catch (err) {
      alert('Failed to delete messages');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '32px 36px' }}>Loading history...</div>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Chat History</h3>
        
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.size === history.length && history.length > 0} 
                onChange={toggleSelectAll} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Select All
            </label>
            <button 
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              style={{
                background: selectedIds.size > 0 ? '#EF4444' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: selectedIds.size > 0 ? 1 : 0.6
              }}
            >
              Delete Selected ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</div>}

      {history.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>No previous conversations found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {history.map((msg) => (
              <motion.div 
                key={msg._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(msg._id)}
                  onChange={() => toggleSelect(msg._id)}
                  style={{ width: '18px', height: '18px', marginTop: '4px', cursor: 'pointer', flexShrink: 0 }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ 
                      color: msg.role === 'user' ? '#93C5FD' : '#A78BFA', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    color: 'white', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                  {msg.intent && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        color: 'rgba(255,255,255,0.7)' 
                      }}>
                        Intent: {msg.intent}
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleDeleteIndividual(msg._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '4px',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                  title="Delete message"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryPanel;
