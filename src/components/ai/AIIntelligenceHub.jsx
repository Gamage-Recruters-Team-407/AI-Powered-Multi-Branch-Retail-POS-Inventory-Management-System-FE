import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BusinessInsights from './BusinessInsights/BusinessInsights';
import DecisionAssistant from './DecisionAssistant/DecisionAssistant';
import ChatHistoryPanel from './ChatHistoryPanel';

const QUICK_PILLS = ['Low Stock Alerts', 'Top Sellers', 'Revenue Report', 'Branch Compare', 'AI Forecast'];
const EXAMPLES = [
  { icon: '⚠️', text: 'Show me all items running low on stock' },
  { icon: '📦', text: 'Which products should I restock immediately?' },
  { icon: '🏪', text: 'Compare sales between branches today' },
  { icon: '📈', text: 'What are the top 5 best-selling products?' },
];

const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME = {
  id: 0, sender: 'ai', time: ts(),
  text: "👋 Hi! I'm your AI Retail Assistant.\n\nAsk me anything about your business — inventory, sales, branches, or forecasts.\n\nClick an example question below or type your own!",
};

// ─── Main AI Intelligence Hub ─────────────────────────────────────────────────
const AIIntelligenceHub = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'insights', 'decision'

  // Lifted Chat State to persist across tab changes and unmounts
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('aiHubMessages');
    return saved ? JSON.parse(saved) : [WELCOME];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('aiHubMessages', JSON.stringify(messages));
  }, [messages]);

  // Clear chat history on hard refresh, but persist when just switching dashboard tabs
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem('aiHubMessages');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <div className="ai-hub-container" style={{
      height: activeTab === 'chat' ? '100vh' : 'auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      padding: '0',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: activeTab === 'chat' ? 'hidden' : 'visible',
    }}>

      {/* ── HEADER & TABS (Glassmorphism) ── */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        padding: '12px 36px 12px 60px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Title Area */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', border:'1px solid rgba(255,255,255,0.8)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}
          >🧠</motion.div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <h1 style={{ margin:0, fontSize:'18px', fontWeight:800, color:'white', letterSpacing:'-0.3px' }}>AI Hub</h1>
            <span style={{ background:'rgba(16,185,129,0.2)', color:'#34D399', fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius:'999px', border:'1px solid rgba(16,185,129,0.4)' }}>LIVE</span>
            <button onClick={() => window.location.reload()} style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '999px', padding: '2px 8px', color: 'white', fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.3)'} onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.15)'}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {[
            { id: 'chat', label: '💬 AI Chat' },
            { id: 'insights', label: '📊 Business Insights' },
            { id: 'decision', label: '🧠 Decision Assistant' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding:'6px 14px',
                borderRadius:'10px',
                border: activeTab === t.id ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.3)',
                background: activeTab === t.id ? '#2563EB' : 'rgba(255,255,255,0.15)',
                color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.85)',
                fontWeight:700,
                fontSize:'12px',
                cursor:'pointer',
                transition:'all 0.2s',
                boxShadow: activeTab === t.id ? '0 2px 8px rgba(37,99,235,0.2)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          
          {/* ── TAB 1: AI CHAT ── */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{
                flex: 1,
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}>
                <InlineChatPanelConnected 
                  messages={messages} setMessages={setMessages}
                  input={input} setInput={setInput}
                  isTyping={isTyping} setIsTyping={setIsTyping}
                />
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: BUSINESS INSIGHTS ── */}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="insights-outer" style={{ maxWidth:'1400px', margin:'0 auto', width:'100%' }}>
              <div className="insights-inner" style={{
                background:'rgba(255,255,255,0.6)',
                backdropFilter:'blur(24px)',
                borderRadius:'24px',
                border:'1px solid rgba(255,255,255,0.8)',
                boxShadow:'0 12px 40px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:'1px solid rgba(255,255,255,1)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>📊</div>
                  <div>
                    <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#1E293B' }}>Business Insights</h3>
                    <p style={{ margin:0, fontSize:'13px', color:'#64748B' }}>AI-powered KPIs and real-time sales trend analysis</p>
                  </div>
                </div>

                {/* KPI Cards removed in favor of real data component below */}

                <div style={{ background:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,1)', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 16px rgba(0,0,0,0.03)' }}>
                  <BusinessInsights />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB 3: DECISION ASSISTANT ── */}
          {activeTab === 'decision' && (
            <motion.div key="decision" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} style={{ padding:'32px 36px 0', maxWidth:'1400px', margin:'0 auto', width:'100%' }}>
              <div style={{
                background:'rgba(255,255,255,0.6)',
                backdropFilter:'blur(24px)',
                borderRadius:'24px',
                border:'1px solid rgba(255,255,255,0.8)',
                padding:'32px',
                boxShadow:'0 12px 40px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:'1px solid rgba(255,255,255,1)', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>🧠</div>
                  <div>
                    <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#1E293B' }}>Decision Assistant</h3>
                    <p style={{ margin:0, fontSize:'13px', color:'#64748B' }}>AI-generated actionable recommendations requiring your attention</p>
                  </div>
                </div>
                
                <div style={{ background:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,1)', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 16px rgba(0,0,0,0.03)' }}>
                  <DecisionAssistant />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        .ai-hub-container { margin: -24px -28px; }
        .insights-outer { padding: 32px 36px 0; }
        .insights-inner { padding: 32px; }
        @media (max-width: 1024px) {
          .ai-query-grid { grid-template-columns: repeat(2,1fr) !important; }
          .kpi-grid { grid-template-columns: 1fr !important; }
          .ai-hub-container { margin: -70px -16px -16px; }
        }
        @media (max-width: 640px) {
          .ai-query-grid, .kpi-grid { grid-template-columns: 1fr !important; }
          .insights-outer { padding: 16px 12px 0; }
          .insights-inner { padding: 16px; }
        }
        .example-box {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .example-box:hover {
          border-color: #3B82F6;
          background: #ffffff;
        }
        .example-icon { font-size: 20px; }
        .example-text { font-size: 13px; color: #1E293B; font-weight: 600; line-height: 1.4; }
        @media (max-width: 640px) {
          .example-box { padding: 8px 12px; gap: 8px; }
          .example-icon { font-size: 18px; }
          .example-text { font-size: 12px; }
        }
      `}</style>
    </div>
  );
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Parse bold text
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineContent = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      // Remove the '* ' or '- ' prefix from the first part
      const content = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        if (i === 0) {
           return part.replace(/^\s*[*|-]\s/, '');
        }
        return part;
      });

      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', margin: '6px 0 6px 8px' }}>
          <span style={{ marginTop: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: 0.7, flexShrink: 0 }} />
          <span>{content}</span>
        </div>
      );
    }

    return (
      <div key={idx} style={{ marginTop: idx > 0 && trimmedLine ? '12px' : '0', minHeight: '1em' }}>
        {lineContent}
      </div>
    );
  });
};

// ─── Connected Chat Panel (Full Height) ─────────────────────────────────────────
const InlineChatPanelConnected = ({ messages, setMessages, input, setInput, isTyping, setIsTyping }) => {
  const endRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const sendQuery = async (text) => {
    if (!text?.trim() || isTyping) return;
    
    // Add user message to UI
    setMessages(p => [...p, { id: Date.now(), sender: 'user', text: text.trim(), time: ts() }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${baseUrl}/chat/send`, {
        message: text.trim(),
        sessionId: 'test-session-12345'
      });
      
      if (response.data.success) {
        setMessages(p => [...p, { id: Date.now() + 1, sender: 'ai', text: response.data.response, time: ts() }]);
      } else {
        setMessages(p => [...p, { id: Date.now() + 1, sender: 'ai', text: "Sorry, I encountered an error. Please try again.", time: ts() }]);
      }
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages(p => [...p, { id: Date.now() + 1, sender: 'ai', text: "Error: Cannot connect to the AI backend.", time: ts() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex: 1, minHeight: 0 }}>
      
      {/* Action Toolbar */}
      <div style={{ padding:'16px 36px 0', maxWidth:'1400px', margin:'0 auto', width:'100%', display:'flex', justifyContent:'flex-end', gap:'10px' }}>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          style={{ background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700, color:'white', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.02)' }}
        >
          {showHistory ? 'Back to Chat' : '⏱️ Chat History'}
        </button>
        <button 
          onClick={() => { setMessages([WELCOME]); setInput(''); setShowHistory(false); }}
          style={{ background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700, color:'white', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.02)' }}
        >
          🔄 New Chat
        </button>
      </div>

      {showHistory ? (
        <ChatHistoryPanel />
      ) : (
        <>
          {/* Examples Grid at Top (Optional, but good for starting) */}
          {messages.length === 1 && (
        <div style={{ padding:'32px 36px 0', maxWidth:'1400px', margin:'0 auto', width:'100%', background:'transparent' }}>
          <p style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:600, color:'white' }}>Try an example:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }} className="ai-query-grid">
            {EXAMPLES.map((q, i) => (
              <motion.button key={i} whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
                onClick={() => sendQuery(q.text)}
                className="example-box"
              >
                <div className="example-icon">{q.icon}</div>
                <div className="example-text">{q.text}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages — scrollable internally (full width for scrollbar edge) */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'32px 36px 24px', maxWidth:'1400px', margin:'0 auto', width:'100%', display:'flex', flexDirection:'column', gap:'4px' }}>
          <AnimatePresence initial={false}>
            {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom:'14px' }}
            >
              <div style={{ maxWidth:'75%' }}>
                {msg.sender === 'ai' && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    <div style={{ width:'26px', height:'26px', borderRadius:'8px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', boxShadow:'0 2px 6px rgba(37,99,235,0.3)' }}>🧠</div>
                    <span style={{ fontSize:'12px', fontWeight:700, color:'white' }}>AI Assistant</span>
                  </div>
                )}
                <div style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : '#ffffff',
                  backdropFilter: msg.sender === 'ai' ? 'none' : 'none',
                  color: msg.sender === 'user' ? 'white' : '#1E293B',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                  padding:'14px 18px', fontSize:'14.5px', lineHeight:'1.55',
                  whiteSpace:'pre-wrap', wordBreak:'break-word',
                  boxShadow: msg.sender === 'user' ? '0 4px 16px rgba(37,99,235,0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                  border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                }}>{msg.sender === 'ai' ? renderFormattedText(msg.text) : msg.text}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', marginTop:'4px', textAlign: msg.sender === 'user' ? 'right' : 'left', padding:'0 4px' }}>{msg.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', marginBottom:'14px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'8px', background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', boxShadow:'0 2px 6px rgba(37,99,235,0.3)' }}>🧠</div>
                <span style={{ fontSize:'12px', fontWeight:700, color:'white' }}>Thinking...</span>
              </div>
              <div style={{ background:'#ffffff', borderRadius:'4px 20px 20px 20px', padding:'14px 18px', display:'flex', gap:'6px', alignItems:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.05)' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width:'8px', height:'8px', background:'#2563EB', borderRadius:'50%' }}
                    animate={{ y:[0,-6,0] }} transition={{ duration:0.5, repeat:Infinity, delay:i*0.15 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
        </div>
      </div>

      {/* ── Input — ALWAYS at bottom ── */}
      <div style={{ padding:'16px 36px 24px', maxWidth:'1400px', margin:'0 auto', width:'100%', background:'transparent', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'rgba(255,255,255,0.4)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:'1px solid rgba(255,255,255,0.5)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', flexShrink:0 }}>✨</div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendQuery(input)}
            disabled={isTyping}
            placeholder={isTyping ? 'AI is thinking...' : 'Ask anything about your business...'}
            style={{ flex:1, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'14px', padding:'14px 18px', fontSize:'15px', color:'white', outline:'none', fontFamily:'inherit', transition:'all 0.2s', opacity: isTyping ? 0.6 : 1, boxShadow:'0 2px 8px rgba(0,0,0,0.02) inset' }}
            onFocus={e => { e.target.style.borderColor='#3B82F6'; e.target.style.boxShadow='0 0 0 3px rgba(37,99,235,0.15)'; }}
            onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.3)'; e.target.style.boxShadow='0 2px 8px rgba(0,0,0,0.02) inset'; }}
          />
          <button onClick={() => sendQuery(input)} disabled={!input.trim() || isTyping}
            style={{ background: input.trim() && !isTyping ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', color: input.trim() && !isTyping ? 'white' : 'rgba(255,255,255,0.5)', border: input.trim() && !isTyping ? 'none' : '1px solid rgba(255,255,255,0.3)', borderRadius:'14px', width:'52px', height:'52px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', fontSize:'20px', transition:'all 0.2s', boxShadow: input.trim() && !isTyping ? '0 4px 16px rgba(37,99,235,0.4)' : '0 2px 8px rgba(0,0,0,0.04)' }}
          >➤</button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default AIIntelligenceHub;
