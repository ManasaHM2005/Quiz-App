import { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

export default function Notes({ topic, onStartQuiz, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/notes/${topic}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load notes');
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [topic]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>⏳ Loading notes...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: '0 10px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
          fontWeight: 600, fontSize: 14, marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6
        }}
      >
        ← Back to Topics
      </button>

      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 20 }}>
        📖 {data.title}
      </h2>

      <div style={{ 
        background: '#f8fafc', 
        padding: '24px', 
        borderRadius: 12, 
        border: '1px solid #e2e8f0',
        marginBottom: 32,
        fontSize: 15,
        lineHeight: 1.7,
        color: '#334155',
        whiteSpace: 'pre-wrap'
      }}>
        {data.content}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onStartQuiz}
          style={{
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #04aa6d, #038c59)',
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(4,170,109,.4)',
            transition: 'transform 0.15s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}
        >
          🎓 I'm Ready - Start Quiz!
        </button>
      </div>
    </div>
  );
}
