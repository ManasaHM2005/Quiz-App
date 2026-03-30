import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:8000';
const CATEGORY_COLORS = {
  HTML:       { bg: '#fff3e0', text: '#e65100', dot: '#f57c00' },
  CSS:        { bg: '#e3f2fd', text: '#0d47a1', dot: '#1976d2' },
  JavaScript:      { bg: '#fffde7', text: '#f57f17', dot: '#fbc02d' },
  Python:          { bg: '#f3e5f5', text: '#6a1b9a', dot: '#8e24aa' },
  Java:            { bg: '#ffebee', text: '#c62828', dot: '#e53935' },
  React:           { bg: '#e0f7fa', text: '#00838f', dot: '#00bcd4' },
  'Cloud Computing': { bg: '#eceff1', text: '#37474f', dot: '#607d8b' },
};

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Question {current} of {total}
        </span>
        <span style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #04aa6d, #06d6a0)',
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

// ── Category Badge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] || { bg: '#e5e7eb', text: '#374151', dot: '#6b7280' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        marginBottom: 14,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.dot }} />
      {category}
    </span>
  );
}

// ── Option Button ─────────────────────────────────────────────────────────────
function OptionButton({ option, state, onClick }) {
  // state: 'idle' | 'selected' | 'correct' | 'wrong'
  const styles = {
    idle: {
      bg: 'var(--surface)',
      border: '2px solid var(--border)',
      color: 'var(--text-primary)',
      shadow: '0 1px 3px rgba(0,0,0,.06)',
    },
    selected: {
      bg: '#eff6ff',
      border: '2px solid #3b82f6',
      color: '#1d4ed8',
      shadow: '0 0 0 3px rgba(59,130,246,.15)',
    },
    correct: {
      bg: 'var(--correct-bg)',
      border: '2px solid var(--correct)',
      color: 'var(--correct)',
      shadow: 'none',
    },
    wrong: {
      bg: 'var(--wrong-bg)',
      border: '2px solid var(--wrong)',
      color: 'var(--wrong)',
      shadow: 'none',
    },
  }[state] || {};

  const icon = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : null;

  return (
    <button
      onClick={onClick}
      disabled={state === 'correct' || state === 'wrong'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '13px 16px',
        borderRadius: 10,
        cursor: state === 'idle' || state === 'selected' ? 'pointer' : 'default',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 500,
        transition: 'all .2s ease',
        background: styles.bg,
        border: styles.border,
        color: styles.color,
        boxShadow: styles.shadow,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: state === 'idle' ? 'var(--border)' : state === 'selected' ? '#3b82f6' : state === 'correct' ? 'var(--correct)' : 'var(--wrong)',
          color: state === 'idle' ? 'var(--text-secondary)' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: state === 'idle' || state === 'selected' ? 12 : 14,
          fontWeight: 700,
          flexShrink: 0,
          transition: 'all .2s',
        }}
      >
        {icon || option.id.toUpperCase()}
      </span>
      {option.text}
    </button>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultScreen({ score, total, percentage, onRetry, onHome }) {
  const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '📚';
  const message =
    percentage >= 80
      ? 'Excellent work! You nailed it!'
      : percentage >= 50
      ? 'Good effort! Keep practicing!'
      : 'Keep learning! You\'ll do better next time.';

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>{emoji}</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quiz Complete!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 16 }}>{message}</p>

      {/* Score Circle */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #04aa6d, #06d6a0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 8px 32px rgba(4,170,109,.35)',
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>/ {total}</span>
      </div>

      <div
        style={{
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: 99,
          background: percentage >= 80 ? 'var(--correct-bg)' : percentage >= 50 ? '#fffde7' : 'var(--wrong-bg)',
          color: percentage >= 80 ? 'var(--correct)' : percentage >= 50 ? '#b45309' : 'var(--wrong)',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 32,
        }}
      >
        {percentage}%
      </div>

      <br />
      <button
        onClick={onRetry}
        style={{
          padding: '13px 36px',
          background: 'linear-gradient(135deg, #04aa6d, #038c59)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(4,170,109,.4)',
          transition: 'transform .15s, box-shadow .15s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(4,170,109,.5)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(4,170,109,.4)'; }}
      >
        🔄 Try Again
      </button>

      <button
        onClick={onHome}
        style={{
          marginTop: 16, display: 'block', width: '100%',
          background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
          fontWeight: 600, fontSize: 15, textDecoration: 'underline'
        }}
      >
        Return to Topics
      </button>
    </div>
  );
}

// ── Main Quiz Component ───────────────────────────────────────────────────────
export default function Quiz({ user, topic, onHome }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);   // [{question_id, selected_option_id}]
  const [phase, setPhase] = useState('loading'); // loading | error | quiz | result
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const fetchQuestions = useCallback(async () => {
    setPhase('loading');
    setAnswers([]);
    setCurrent(0);
    setSelectedOption(null);
    setAnswered(false);
    setResult(null);
    setTimeLeft(600); // reset timer
    try {
      const url = topic ? `${API_BASE}/api/questions?category=${encodeURIComponent(topic)}` : `${API_BASE}/api/questions`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      setQuestions(data);
      setPhase('quiz');
    } catch {
      setPhase('error');
    }
  }, [topic]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const submitQuiz = async (finalAnswers) => {
    try {
      const payload = {
        username: user.name, // using display name instead of username to ensure it is defined
        category: topic || 'All',
        answers: finalAnswers
      };
      
      const res = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) {
      submitQuiz(answers);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (optionId) => {
    if (answered) return;
    setSelectedOption(optionId);
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const q = questions[current];
    const newAnswers = [...answers, { question_id: q.id, selected_option_id: selectedOption }];
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      // Submit all answers
      submitQuiz(newAnswers);
    }
  };

  const handleCheck = () => {
    if (selectedOption) setAnswered(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading questions…</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'var(--wrong)', fontWeight: 600, marginBottom: 8 }}>Could not load questions.</p>
        <button
          onClick={fetchQuestions}
          style={{ padding: '10px 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    return <ResultScreen {...result} onRetry={fetchQuestions} onHome={onHome} />;
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 16 }}>No questions available for {topic}.</p>
        <button onClick={onHome} style={{ padding: '10px 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          Go Back
        </button>
      </div>
    );
  }

  const q = questions[current];
  const isLast = current + 1 === questions.length;

  return (
    <div>
      <ProgressBar current={current + 1} total={questions.length} />
      <CategoryBadge category={q.category} />
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 22, lineHeight: 1.5 }}>
        {q.question}
      </h2>

      <div>
        {q.options.map((opt) => {
          let state = 'idle';
          if (selectedOption === opt.id && !answered) state = 'selected';
          // After checking, show nothing extra (we move directly forward)
          return (
            <OptionButton
              key={opt.id}
              option={opt}
              state={state}
              onClick={() => handleSelect(opt.id)}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          style={{
            padding: '12px 28px',
            background: selectedOption
              ? 'linear-gradient(135deg, #04aa6d, #038c59)'
              : 'var(--border)',
            color: selectedOption ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: selectedOption ? 'pointer' : 'not-allowed',
            transition: 'all .2s',
            boxShadow: selectedOption ? '0 4px 14px rgba(4,170,109,.35)' : 'none',
          }}
        >
          {isLast ? 'Submit Quiz ✓' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}
