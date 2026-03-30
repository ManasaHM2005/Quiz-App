import { useState } from 'react';

const CATEGORY_COLORS = {
  HTML:       { bg: '#fff3e0', text: '#e65100', icon: '🏷️' },
  CSS:        { bg: '#e3f2fd', text: '#0d47a1', icon: '🎨' },
  JavaScript:      { bg: '#fffde7', text: '#f57f17', icon: '⚡' },
  Python:          { bg: '#f3e5f5', text: '#6a1b9a', icon: '🐍' },
  Java:            { bg: '#ffebee', text: '#c62828', icon: '☕' },
  React:           { bg: '#e0f7fa', text: '#00838f', icon: '⚛️' },
  'Cloud Computing': { bg: '#eceff1', text: '#37474f', icon: '☁️' },
};

export default function TopicSelection({ onSelect }) {
  const topics = Object.keys(CATEGORY_COLORS);

  return (
    <div style={{ padding: '0 16px', textAlign: 'center' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Choose a Topic</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Select a subject to review the notes and take a quiz!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {topics.map(topic => {
          const cfg = CATEGORY_COLORS[topic];
          return (
            <button
              key={topic}
              onClick={() => onSelect(topic)}
              style={{
                background: cfg.bg,
                border: `2px solid ${cfg.text}33`,
                borderRadius: 16,
                padding: '32px 20px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.text}33`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 48, lineHeight: 1 }}>{cfg.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: cfg.text }}>{topic}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
