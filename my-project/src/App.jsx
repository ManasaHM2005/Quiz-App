import { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import TopicSelection from './components/TopicSelection';
import Notes from './components/Notes';
import Leaderboard from './components/Leaderboard';

// ── Quiz Shell (shown to logged-in users) ────────────────────────────────────
function QuizShell({ user, onLogout }) {
  const [step, setStep] = useState('topic'); // 'topic' | 'notes' | 'quiz' | 'leaderboard'
  const [topic, setTopic] = useState(null);

  const handleSelectTopic = (t) => {
    setTopic(t);
    setStep('notes');
  };

  const handleStartQuiz = () => {
    setStep('quiz');
  };

  const handleHome = () => {
    setStep('topic');
    setTopic(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 16px',
      }}
    >
      {/* Top nav for logged-in user */}
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>Hi, {user.name}!</span>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '7px 16px',
            background: 'rgba(4,170,109,.1)',
            border: '1px solid rgba(4,170,109,.3)',
            borderRadius: 8,
            color: '#038c59',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#04aa6d',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 16,
            textTransform: 'uppercase',
          }}
        >
          <span>🧠</span> Web Dev Quiz
        </div>
        <h1
          style={{
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: 800,
            color: '#1a1a2e',
            lineHeight: 1.2,
            marginBottom: 10,
          }}
        >
          Test Your Knowledge
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 480 }}>
          7 Diverse Topics — 10 questions, 10 min limit.
        </p>
      </header>

      {/* Main Container */}
      <main
        style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,.10)',
          padding: 'clamp(24px, 4vw, 40px)',
          width: '100%',
          maxWidth: 640,
        }}
      >
        {step === 'topic' && (
          <>
            <TopicSelection onSelect={handleSelectTopic} />
            <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 32, borderTop: '2px dashed #e2e8f0' }}>
              <button 
                onClick={() => setStep('leaderboard')}
                style={{ background: '#1e293b', color: '#fff', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,41,59,.2)' }}
              >
                🏆 View Global Leaderboard
              </button>
            </div>
          </>
        )}
        {step === 'notes' && <Notes topic={topic} onStartQuiz={handleStartQuiz} onBack={handleHome} />}
        {step === 'quiz' && <Quiz user={user} topic={topic} onHome={handleHome} />}
        {step === 'leaderboard' && <Leaderboard onHome={handleHome} />}
      </main>

      <footer style={{ marginTop: 32, color: '#9ca3af', fontSize: 13 }}>
        Powered by FastAPI + React
      </footer>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null); // null = not logged in; { role, name, token }

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
  return <QuizShell user={user} onLogout={handleLogout} />;
}
