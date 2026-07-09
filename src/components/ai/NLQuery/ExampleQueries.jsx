import React from 'react';
import { motion } from 'framer-motion';

const EXAMPLES = [
  { icon: "📦", text: "What products should I reorder today?" },
  { icon: "📈", text: "Predict next month's sales trend" },
  { icon: "🏪", text: "Which branch generated the highest profit?" },
  { icon: "👥", text: "Show customers likely to purchase electronics" }
];

const ExampleQueries = ({ onSelectQuery, darkMode }) => {
  const surface = darkMode ? '#1E293B' : '#FFFFFF';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const text = darkMode ? '#F1F5F9' : '#1E293B';
  const text2 = darkMode ? '#94A3B8' : '#64748B';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '10px',
      maxWidth: '900px',
      margin: '0 auto',
    }} className="example-grid">
      {EXAMPLES.map((example, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectQuery(example.text)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            boxShadow: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#2563EB';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>{example.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: text, lineHeight: 1.4 }}>
            {example.text}
          </span>
        </motion.button>
      ))}

      <style>{`
        @media (max-width: 768px) {
          .example-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .example-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ExampleQueries;
