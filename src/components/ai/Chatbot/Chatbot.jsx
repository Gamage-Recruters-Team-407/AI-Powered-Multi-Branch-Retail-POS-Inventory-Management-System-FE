import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const QUICK = ["Low Stock", "Top Products", "Sales Report", "Trending", "Help"];

// ─── Main Chatbot Component ───────────────────────────────────────────────────
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([{
    id: 0, sender: 'ai', time: ts(),
    text: "👋 Hello! I'm your AI Retail Assistant.\n\nHow can I help you today?\n\nYou can ask me about:\n• Sales performance and revenue\n• Inventory status and low stock\n• Branch performance comparisons\n• Product recommendations\n• Business insights and forecasts",
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text?.trim() || isTyping) return;
    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), time: ts() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: 'floating-chatbot-session',
          chatType: 'assistant'
        })
      });
      const data = await res.json();
      
      const aiMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: data.success ? data.response : "Sorry, I encountered an error. Please try again.", 
        time: ts() 
      };
      
      setMessages(p => [...p, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(p => [...p, { id: Date.now() + 1, sender: 'ai', text: "Error: Cannot connect to the AI backend.", time: ts() }]);
    } finally {
      setIsTyping(false);
      if (!isOpen || isMinimized) setUnread(u => u + 1);
    }
  };

  const open = () => { setIsOpen(true); setIsMinimized(false); setUnread(0); };
  const close = () => {
    setIsOpen(false);
    setMessages([{
      id: 0, sender: 'ai', time: ts(),
      text: "👋 Hello! I'm your AI Retail Assistant.\n\nHow can I help you today?\n\nYou can ask me about:\n• Sales performance and revenue\n• Inventory status and low stock\n• Branch performance comparisons\n• Product recommendations\n• Business insights and forecasts",
    }]);
  };
  const minimize = () => setIsMinimized(m => !m);

  return (
    <>
      {/* ── Floating Robot Button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={isOpen ? (isMinimized ? open : close) : open}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '62px', height: '62px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
        }}
        aria-label="Open AI Assistant"
      >
        🤖
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '0', right: '0',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#EF4444', color: 'white',
            fontSize: '10px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>{unread}</span>
        )}
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', bottom: '98px', right: '24px', zIndex: 9998,
              width: '360px', maxWidth: 'calc(100vw - 48px)',
              height: isMinimized ? 'auto' : '500px',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>🤖</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>AI Retail Assistant</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
                    Online
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={minimize} style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '7px',
                  width: '28px', height: '28px', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}>−</button>
                <button onClick={close} style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '7px',
                  width: '28px', height: '28px', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>✕</button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '14px',
                  background: '#F9FAFB',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '10px',
                    }}>
                      <div style={{ maxWidth: '80%' }}>
                        <div style={{
                          background: msg.sender === 'user' ? '#2563EB' : '#F3F4F6',
                          color: msg.sender === 'user' ? 'white' : '#1F2937',
                          borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '10px 14px', fontSize: '13px', lineHeight: '1.5',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>{msg.text}</div>
                        <div style={{
                          fontSize: '10px', color: '#9CA3AF', marginTop: '3px',
                          textAlign: msg.sender === 'user' ? 'right' : 'left',
                          paddingLeft: '4px', paddingRight: '4px',
                        }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                      <div style={{
                        background: '#F3F4F6', borderRadius: '18px 18px 18px 4px',
                        padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center',
                      }}>
                        {[0, 1, 2].map(i => (
                          <motion.div key={i}
                            style={{ width: '7px', height: '7px', background: '#9CA3AF', borderRadius: '50%' }}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Quick Actions */}
                <div style={{
                  display: 'flex', overflowX: 'auto', gap: '6px',
                  padding: '8px 12px', borderTop: '1px solid #E5E7EB',
                  background: '#fff', flexShrink: 0,
                }}>
                  {QUICK.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      whiteSpace: 'nowrap', fontSize: '11.5px', fontWeight: 600,
                      color: '#4B5563', background: '#F3F4F6',
                      border: '1.5px solid #E5E7EB', borderRadius: '999px',
                      padding: '5px 12px', cursor: 'pointer', flexShrink: 0,
                    }}>{q}</button>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} style={{
                  display: 'flex', gap: '8px', padding: '10px 12px',
                  borderTop: '1px solid #E5E7EB', background: '#fff', flexShrink: 0,
                }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isTyping}
                    placeholder={isTyping ? "AI is thinking..." : "Ask me anything..."}
                    style={{
                      flex: 1, background: '#F9FAFB', border: '1.5px solid #E5E7EB',
                      borderRadius: '12px', padding: '10px 14px', fontSize: '13px',
                      color: '#1F2937', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button type="submit" disabled={!input.trim() || isTyping} style={{
                    background: (!input.trim() || isTyping) ? '#D1D5DB' : 'linear-gradient(135deg,#2563EB,#7C3AED)',
                    border: 'none', borderRadius: '12px', width: '44px', height: '44px',
                    color: 'white', fontSize: '18px', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>➤</button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
