import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ACTIONS = ["Low Stock", "Top Sellers", "Sales Report", "Trending", "Help"];

const AI_RESPONSES = {
  "Low Stock": "⚠️ **Low Stock Alert**\n\n3 items are critically low:\n• Mechanical Keyboard — 2 units left\n• Bluetooth Speaker — 4 units left\n• USB-C Cable — 6 units left\n\nI recommend creating purchase orders today.",
  "Top Sellers": "⭐ **Top Performing Products**\n\n1. Wireless Mouse — 142 units sold\n2. A4 Copy Paper — 310 packs sold\n3. Mechanical Keyboard — 89 units sold\n4. Desk Lamp — 74 units sold\n\nOrganic product demand is up 23% this month.",
  "Sales Report": "📊 **Sales Summary**\n\n• Total Revenue: $52,800\n• Transactions: 1,284\n• Avg. Order Value: $124.50\n• Growth vs Last Month: +16.8%\n\nSaturday & Sunday account for 41% of weekly revenue.",
  "Trending": "📈 **Trending Right Now**\n\nTop trending categories:\n• Electronics (+40% this week)\n• Office Supplies (+22%)\n• Ergonomic Furniture (+18%)\n\n💡 Tip: Bundle Wireless Mouse + Keyboard for a 15% bundle offer.",
  "Help": "🤖 **How I Can Help**\n\nAsk me about:\n• 📦 Inventory & stock levels\n• 💰 Sales & revenue reports\n• 🏢 Branch performance\n• 📈 Demand forecasting\n• 🛒 Purchase order suggestions\n• 👥 Customer insights\n\nType any question or click a quick action!",
};

const getAIResponse = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('reorder') || lower.includes('stock') || lower.includes('inventory')) return AI_RESPONSES["Low Stock"];
  if (lower.includes('top') || lower.includes('best') || lower.includes('seller')) return AI_RESPONSES["Top Sellers"];
  if (lower.includes('sale') || lower.includes('revenue') || lower.includes('profit')) return AI_RESPONSES["Sales Report"];
  if (lower.includes('trend') || lower.includes('popular')) return AI_RESPONSES["Trending"];
  if (lower.includes('help') || lower.includes('hi') || lower.includes('hello')) return AI_RESPONSES["Help"];
  if (lower.includes('branch') || lower.includes('location')) return "🏢 **Branch Performance**\n\n• Main HQ: $18,240 (Top)\n• Downtown Store: $12,560\n• Uptown Mall: $9,340\n\nMain HQ accounts for 38% of total revenue.";
  if (lower.includes('forecast') || lower.includes('predict')) return "🔮 **AI Demand Forecast (Next 30 days)**\n\n• Electronics: ↑15% demand\n• Office Supplies: ↑12%\n• Furniture: ↑8%\n\nRecommend increasing inventory by 20% for Electronics.";
  return `🤔 I understand your question about "${text.substring(0, 40)}..."\n\nTry asking about: Sales, Inventory, Branches, Trends, or Forecasts. I'm here to help!`;
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME = {
  id: 0,
  sender: 'ai',
  text: "👋 Hi! I'm your AI Retail Assistant.\n\nAsk me anything about your business — inventory, sales, trends, or forecasts. Use the quick action buttons below to get started!",
  time: now(),
};

const EmbeddedChat = ({ darkMode, nlQuery, onQueryHandled }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // When an NL query comes from the NLQueryBar
  useEffect(() => {
    if (nlQuery && nlQuery.trim()) {
      sendMessage(nlQuery);
      onQueryHandled?.();
    }
  }, [nlQuery]);

  const sendMessage = async (text) => {
    if (!text?.trim() || isTyping) return;
    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: 'embedded-chat-session',
          chatType: 'assistant'
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.response, time: now() }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "Sorry, I encountered an error. Please try again.", time: now() }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "Error: Cannot connect to the AI backend.", time: now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';
  const msgBg = darkMode ? '#243044' : '#F3F4F6';

  return (
    <div style={{
      background: surface,
      borderRadius: '20px',
      border: `1px solid ${border}`,
      boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '500px',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>AI Retail Assistant</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
              Online • Ready to help
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        background: darkMode ? '#162032' : '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div style={{ maxWidth: '80%' }}>
                <div style={{
                  background: msg.sender === 'user' ? '#2563EB' : msgBg,
                  color: msg.sender === 'user' ? 'white' : text,
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: text2,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  marginTop: '3px',
                  paddingLeft: msg.sender === 'ai' ? '4px' : '0',
                  paddingRight: msg.sender === 'user' ? '4px' : '0',
                }}>
                  {msg.time}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}
          >
            <div style={{
              background: msgBg,
              borderRadius: '18px 18px 18px 4px',
              padding: '12px 16px',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  style={{ width: '7px', height: '7px', background: '#94A3B8', borderRadius: '50%' }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '6px',
        padding: '8px 14px',
        borderTop: `1px solid ${border}`,
        background: surface,
        flexShrink: 0,
      }}>
        {QUICK_ACTIONS.map(action => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#2563EB',
              background: 'rgba(37,99,235,0.08)',
              border: '1.5px solid rgba(37,99,235,0.2)',
              borderRadius: '999px',
              padding: '5px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.target.style.background = '#2563EB';
              e.target.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(37,99,235,0.08)';
              e.target.style.color = '#2563EB';
            }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 14px',
          borderTop: `1px solid ${border}`,
          background: surface,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isTyping}
          placeholder={isTyping ? "AI is thinking..." : "Ask me anything..."}
          style={{
            flex: 1,
            background: darkMode ? '#243044' : '#F8FAFC',
            border: `1.5px solid ${border}`,
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13.5px',
            color: text,
            outline: 'none',
            opacity: isTyping ? 0.6 : 1,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#2563EB'}
          onBlur={e => e.target.style.borderColor = border}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          style={{
            background: (!input.trim() || isTyping) ? '#CBD5E1' : 'linear-gradient(135deg, #2563EB, #7C3AED)',
            border: 'none',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <Send size={16} color="white" />
        </button>
      </form>
    </div>
  );
};

export default EmbeddedChat;
