import { useState, useEffect } from 'react';

const CATEGORY_COLORS = {
  HTML:            { bg: '#fff3e0', text: '#e65100' },
  CSS:             { bg: '#e3f2fd', text: '#0d47a1' },
  JavaScript:      { bg: '#fffde7', text: '#f57f17' },
  Python:          { bg: '#f3e5f5', text: '#6a1b9a' },
  Java:            { bg: '#ffebee', text: '#c62828' },
  React:           { bg: '#e0f7fa', text: '#00838f' },
  'Cloud Computing': { bg: '#eceff1', text: '#37474f' },
};

const thStyle = {
  padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5,
};

const tdStyle = {
  padding: '14px 20px', fontSize: 14, color: '#1e293b',
};

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,.07)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newQ, setNewQ] = useState({
    category: 'HTML', question: '', answer: 'a',
    optA: '', optB: '', optC: '', optD: ''
  });

  const loadStats = () => {
    fetch('http://127.0.0.1:8000/api/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => { setError('Failed to load stats.'); setLoading(false); });
  };

  useEffect(() => { loadStats(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) loadStats();
      else alert('Failed to delete question.');
    } catch { alert('Network error.'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      category: newQ.category, question: newQ.question, answer: newQ.answer,
      options: [
        { id: 'a', text: newQ.optA }, { id: 'b', text: newQ.optB },
        { id: 'c', text: newQ.optC }, { id: 'd', text: newQ.optD },
      ]
    };
    try {
      const res = await fetch('http://127.0.0.1:8000/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewQ({ category: 'HTML', question: '', answer: 'a', optA: '', optB: '', optC: '', optD: '' });
        loadStats();
      } else alert('Failed to add question');
    } catch { alert('Network error'); }
  };

  const filtered = stats?.questions?.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <nav style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, boxShadow: '0 2px 12px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🧠</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Quiz App</span>
          <span style={{ background: '#04aa6d', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, letterSpacing: 1 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>👤 {user.name}</span>
          <button onClick={onLogout} style={{ padding: '7px 16px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>📊 Admin Dashboard</h1>
            <p style={{ color: '#64748b' }}>Manage and monitor quiz content.</p>
          </div>
          <button onClick={() => setIsAdding(!isAdding)} style={{ background: '#04aa6d', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(4, 170, 109, 0.2)' }}>
            {isAdding ? 'Cancel' : '+ Add Question'}
          </button>
        </div>

        {isAdding && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 28, boxShadow: '0 4px 12px rgba(0,0,0,.05)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Create New Question</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Category</label>
                  <select value={newQ.category} onChange={e => setNewQ({...newQ, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} required>
                    {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Correct Answer</label>
                  <select value={newQ.answer} onChange={e => setNewQ({...newQ, answer: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} required>
                    <option value="a">Option A</option><option value="b">Option B</option>
                    <option value="c">Option C</option><option value="d">Option D</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Question Text</label>
                <input type="text" value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Option A</label><input type="text" value={newQ.optA} onChange={e => setNewQ({...newQ, optA: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} required /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Option B</label><input type="text" value={newQ.optB} onChange={e => setNewQ({...newQ, optB: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} required /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Option C</label><input type="text" value={newQ.optC} onChange={e => setNewQ({...newQ, optC: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} required /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Option D</label><input type="text" value={newQ.optD} onChange={e => setNewQ({...newQ, optD: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} required /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" style={{ background: '#0f172a', color: '#fff', padding: '10px 24px', borderRadius: 6, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Save Question</button>
              </div>
            </form>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Loading stats…</div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, color: '#dc2626' }}>⚠️ {error}</div>}

        {stats && !loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon="📝" label="Total Questions" value={stats.total_questions} color="#04aa6d" />
              {Object.entries(stats.categories).map(([cat, count]) => (
                <StatCard key={cat} icon="📌" label={cat} value={count} color={CATEGORY_COLORS[cat]?.text || '#04aa6d'} />
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Question Bank</h2>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search questions…" style={{ padding: '9px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: 240 }} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>Category</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q, i) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...tdStyle, color: '#94a3b8', fontWeight: 600, width: 50 }}>{q.id}</td>
                        <td style={tdStyle}>{q.question}</td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: CATEGORY_COLORS[q.category]?.bg || '#e5e7eb', color: CATEGORY_COLORS[q.category]?.text || '#374151' }}>
                            {q.category}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', width: 80 }}>
                          <button onClick={() => handleDelete(q.id)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No questions match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
