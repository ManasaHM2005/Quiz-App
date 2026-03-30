import { useState, useEffect } from 'react';

export default function Leaderboard({ onHome }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/leaderboard')
      .then(res => res.json())
      .then(data => { setLeaders(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 640, background: '#fff', padding: 40, borderRadius: 24, boxShadow: '0 12px 40px rgba(0,0,0,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>🏆 Global Leaderboard</h2>
        <button
          onClick={onHome}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          Back
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading scores...</div>}
      {error && <div style={{ color: 'var(--wrong)', textAlign: 'center', padding: 20 }}>Failed to load leaderboard.</div>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Topic</th>
              <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>No scores yet!</td></tr>
            ) : (
              leaders.map((l, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 0', fontWeight: 700, fontSize: 15, color: i < 3 ? 'var(--brand)' : 'var(--text-primary)' }}>
                    {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : i + 1}
                  </td>
                  <td style={{ padding: '16px 0', fontWeight: 600 }}>{l.username}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--bg)', padding: '4px 8px', borderRadius: 4 }}>
                      {l.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {l.score} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>/ {l.total}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
