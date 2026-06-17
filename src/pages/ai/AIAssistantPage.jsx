import React, { useState } from 'react';
import { Bot, MapPin, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

import NLQueryBar from '../../components/ai/NLQuery/NLQueryBar';
import ExampleQueries from '../../components/ai/NLQuery/ExampleQueries';
import BusinessInsights from '../../components/ai/BusinessInsights/BusinessInsights';
import DecisionAssistant from '../../components/ai/DecisionAssistant/DecisionAssistant';
import EmbeddedChat from '../../components/ai/Chatbot/EmbeddedChat';

import SmartRecommendations from '../../components/dashboard/SmartRecommendations';
import PersonalizedRecommendations from '../../components/dashboard/PersonalizedRecommendations';

const BRANCHES = ['All Branches', 'Main HQ', 'Downtown Store', 'Uptown Mall'];

const AIAssistantPage = () => {
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [darkMode, setDarkMode] = useState(false);
  const [nlQuery, setNlQuery] = useState('');

  const handleNLSearch = (query) => {
    setNlQuery(query);
  };

  return (
    <div
      className={`ai-page ${darkMode ? 'dark' : ''}`}
      style={{
        '--bg': darkMode ? '#0F172A' : '#F1F5F9',
        '--surface': darkMode ? '#1E293B' : '#FFFFFF',
        '--surface2': darkMode ? '#243044' : '#F8FAFC',
        '--text': darkMode ? '#F1F5F9' : '#1E293B',
        '--text2': darkMode ? '#94A3B8' : '#64748B',
        '--border': darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
        '--primary': '#2563EB',
        '--shadow': darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* ─── PAGE HEADER ─── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: '14px',
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              AI Retail Assistant
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0 }}>
              Intelligent copilot for your store
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Branch Selector */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '8px 14px',
          }}>
            <MapPin size={14} color="var(--text2)" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
              }}
            >
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '8px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, color: 'var(--text)',
              transition: 'all 0.2s',
            }}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ padding: '28px', maxWidth: '1600px', margin: '0 auto' }}>

        {/* ── NL QUERY SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '32px' }}
        >
          <NLQueryBar onSearch={handleNLSearch} initialValue={nlQuery} darkMode={darkMode} />
          <ExampleQueries onSelectQuery={handleNLSearch} darkMode={darkMode} />
        </motion.div>

        {/* ── TWO-COLUMN GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
          className="ai-grid"
        >
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Business Insights */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BusinessInsights darkMode={darkMode} />
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                padding: '20px',
                boxShadow: 'var(--shadow)',
              }}>
                <h2 style={{
                  fontSize: '16px', fontWeight: 700, margin: '0 0 16px',
                  color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    borderRadius: '8px', padding: '4px 8px', fontSize: '14px'
                  }}>✨</span>
                  AI Recommendations
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="rec-grid">
                  <SmartRecommendations />
                  <PersonalizedRecommendations />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Embedded Chat Window */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EmbeddedChat darkMode={darkMode} nlQuery={nlQuery} onQueryHandled={() => setNlQuery('')} />
            </motion.div>

            {/* Decision Assistant */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DecisionAssistant darkMode={darkMode} />
            </motion.div>

          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ai-page * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          .ai-grid { grid-template-columns: 1fr !important; }
          .rec-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .ai-grid { padding: 0; }
        }
        select option { background: #1E293B; color: white; }
        .ai-page.dark select option { background: #0F172A; color: #F1F5F9; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default AIAssistantPage;
