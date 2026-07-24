import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const NLQueryBar = ({ onSearch, darkMode }) => {
  const [query, setQuery] = useState('');

  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const placeholder = darkMode ? '#475569' : '#94A3B8';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto 16px' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
          color: '#2563EB', pointerEvents: 'none', display: 'flex', alignItems: 'center',
        }}>
          <Sparkles size={22} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI anything about your business..."
          style={{
            width: '100%',
            padding: '18px 160px 18px 52px',
            background: surface,
            border: `2px solid ${border}`,
            borderRadius: '18px',
            fontSize: '16px',
            color: text,
            outline: 'none',
            boxShadow: darkMode
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(37,99,235,0.08)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#2563EB';
            e.target.style.boxShadow = '0 8px 32px rgba(37,99,235,0.18)';
          }}
          onBlur={e => {
            e.target.style.borderColor = border;
            e.target.style.boxShadow = darkMode
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(37,99,235,0.08)';
          }}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: query.trim()
              ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
              : (darkMode ? '#334155' : '#CBD5E1'),
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 22px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: query.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s',
            boxShadow: query.trim() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
          }}
        >
          Ask AI <Search size={14} />
        </button>
      </form>
    </div>
  );
};

export default NLQueryBar;
