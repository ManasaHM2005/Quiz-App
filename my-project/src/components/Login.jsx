import { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  border: '2px solid var(--border)',
  borderRadius: 10,
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
  background: '#fff',
  color: 'var(--text-primary)',
};

const focusStyle = {
  borderColor: '#04aa6d',
  boxShadow: '0 0 0 3px rgba(4,170,109,.15)',
};

function FormField({ label, id, type = 'text', value, onChange, placeholder, focused, onFocus, onBlur, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text-primary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{ ...inputStyle, ...(focused ? focusStyle : {}), paddingRight: children ? 48 : 16 }}
        />
        {children}
      </div>
    </div>
  );
}

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('user');       // 'user' | 'admin'
  const [mode, setMode] = useState('login');    // 'login' | 'register'
  const [focused, setFocused] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register-only fields
  const [fullName, setFullName] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const reset = () => {
    setUsername(''); setPassword(''); setFullName(''); setConfirmPwd('');
    setError(''); setShowPwd(false);
  };

  const switchMode = (m) => { setMode(m); reset(); };
  const switchTab = (t) => { setTab(t); reset(); };

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPwd(!showPwd)}
      style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
        color: 'var(--text-secondary)', lineHeight: 1,
      }}
    >{showPwd ? '🙈' : '👁️'}</button>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Invalid credentials.'); setLoading(false); return; }
      if (data.role !== tab) { setError(`This account does not have ${tab} access.`); setLoading(false); return; }
      onLogin(data);
    } catch { setError('Cannot connect to server. Make sure the backend is running.'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !password || !confirmPwd) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), name: fullName.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Registration failed.'); setLoading(false); return; }
      onLogin(data);
    } catch { setError('Cannot connect to server. Make sure the backend is running.'); }
    setLoading(false);
  };

  const hints = { user: { u: 'user', p: 'user123' }, admin: { u: 'admin', p: 'admin123' } };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,.4)',
        width: '100%', maxWidth: 420, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #04aa6d, #038c59)',
          padding: '28px 32px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🧠</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Quiz App</h1>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {/* Role Tabs (login only) */}
        {mode === 'login' && (
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
            {['user', 'admin'].map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                color: tab === t ? '#04aa6d' : 'var(--text-secondary)',
                borderBottom: tab === t ? '2px solid #04aa6d' : '2px solid transparent',
                marginBottom: -2, transition: 'color .2s',
              }}>
                {t === 'user' ? '🎓 Student' : '🛡️ Admin'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}
          style={{ padding: '24px 32px 32px' }}>

          {/* Demo hint (login + user tab only) */}
          {mode === 'login' && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 18,
            }}>
              <strong>Demo — </strong>
              username: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>{hints[tab].u}</code>
              &nbsp; password: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>{hints[tab].p}</code>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16,
            }}>⚠️ {error}</div>
          )}

          {/* Full Name (register only) */}
          {mode === 'register' && (
            <FormField label="Full Name" id="fullname" value={fullName}
              onChange={e => setFullName(e.target.value)} placeholder="Enter your full name"
              focused={focused === 'fullname'} onFocus={() => setFocused('fullname')} onBlur={() => setFocused(null)} />
          )}

          {/* Username */}
          <FormField label="Username" id="username" value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={mode === 'login' ? `Enter ${tab} username` : 'Choose a username (min 3 chars)'}
            focused={focused === 'username'} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} />

          {/* Password */}
          <FormField label="Password" id="password" type={showPwd ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter password'}
            focused={focused === 'password'} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}>
            {eyeButton}
          </FormField>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <FormField label="Confirm Password" id="confirm" type={showPwd ? 'text' : 'password'}
              value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Re-enter your password"
              focused={focused === 'confirm'} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} />
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', fontFamily: 'inherit',
            background: loading ? 'var(--border)' : 'linear-gradient(135deg, #04aa6d, #038c59)',
            color: loading ? 'var(--text-secondary)' : '#fff',
            border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(4,170,109,.4)',
            transition: 'all .2s', marginBottom: 18,
          }}>
            {loading ? '⏳ Please wait…'
              : mode === 'register' ? '✅ Create Account'
              : tab === 'admin' ? '🛡️ Sign In as Admin' : '🎓 Start Quiz'}
          </button>

          {/* Toggle between login / register (students only) */}
          {(mode === 'register' || tab === 'user') && (
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none', border: 'none', color: '#04aa6d', fontWeight: 700,
                  cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', padding: 0,
                }}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
