import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BrainCircuit, CheckCircle2, XCircle, Award, RotateCcw, Sparkles } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export default function QuizPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);
  
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCount = parseInt(params.get('count')) || 5;
    fetchQuestions(requestedCount);
  }, [moduleId]);

  async function fetchQuestions(requestedCount) {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${moduleId}`);
      const data = res.data;
      
      if (data && data.length > 0) {
        setQuestions(data.slice(0, requestedCount));
        setLoading(false);
      } else {
        // No questions exist, generate them
        generateNewQuiz(requestedCount);
      }
    } catch (e) {
      setError('Failed to load quiz');
      setLoading(false);
    }
  }

  async function generateNewQuiz(count) {
    setGenerating(true);
    try {
      const res = await api.post(`/quizzes/generate/${moduleId}`, { count });
      const data = res.data;
      if (!data.success) throw new Error(data.error);
      setQuestions(data.questions);
    } catch (e) {
      setError('Failed to generate quiz: ' + e.message);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }

  function handleAnswer(option) {
    if (selected !== null) return;
    
    setSelected(option);
    const correct = questions[current].correct_answer === option;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        setCompleted(true);
        saveAttempt();
      }
    }, 1500);
  }

  async function saveAttempt() {
    try {
      await fetch(`${API}/api/quizzes/attempt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || user?.id // Handle both formats
        },
        body: JSON.stringify({
          moduleId,
          score: score + (isCorrect ? 1 : 0), // Include current if manually called
          total: questions.length
        })
      });
    } catch (e) {
      console.error('Failed to save attempt:', e);
    }
  }

  if (loading || generating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)', gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(0,192,107,0.2)', borderTopColor: '#00c06b', animation: 'spin-slow 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          {generating ? 'AI is crafting your quiz questions...' : 'Loading quiz...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <XCircle size={48} color="#ff6b6b" style={{ marginBottom: 16 }} />
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate(`/modules/${moduleId}`)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass-card animate-fade-up" style={{ maxWidth: 480, width: '100%', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Award size={40} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Quiz Complete!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>Great job finishing the module quiz.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '24px', marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Score</p>
            <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--brand-primary-light)' }}>{percentage}%</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8 }}>{score} correct out of {questions.length} questions</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate(`/modules/${moduleId}`)}>Finish Module</button>
            <button 
              className="btn-ghost" 
              onClick={() => {
                setCompleted(false);
                setCurrent(0);
                setScore(0);
                setSelected(null);
                setIsCorrect(null);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RotateCcw size={16} /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif', padding: '40px 20px' }}>
      <main style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <button onClick={() => navigate(`/modules/${moduleId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <ChevronLeft size={16} /> Exit Quiz
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
            <BrainCircuit size={18} color="#00c06b" /> Question {current + 1}/{questions.length}
          </div>
          <div style={{ width: 80 }}></div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 48 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#00c06b', borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>

        {/* Question Area */}
        <div className="animate-fade-up">
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 40, lineHeight: 1.4 }}>
            {q.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((option, idx) => {
              const isSelected = selected === option;
              const isOptionCorrect = q.correct_answer === option;
              
              let borderColor = 'rgba(255,255,255,0.08)';
              let bg = 'rgba(255,255,255,0.03)';
              
              if (selected !== null) {
                if (isOptionCorrect) {
                  borderColor = '#00c06b80';
                  bg = '#00c06b15';
                } else if (isSelected) {
                  borderColor = '#ff6b6b80';
                  bg = '#ff6b6b15';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  style={{
                    width: '100%', textAlign: 'left', padding: '20px 24px', borderRadius: 16, border: `1px solid ${borderColor}`,
                    background: bg, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 500,
                    cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.2s ease', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { if(selected === null) e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if(selected === null) { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.background = bg; } }}
                >
                  {option}
                  {selected !== null && isOptionCorrect && <CheckCircle2 size={18} color="#00c06b" />}
                  {selected !== null && isSelected && !isOptionCorrect && <XCircle size={18} color="#ff6b6b" />}
                </button>
              );
            })}
          </div>

          {selected !== null && q.explanation && (
            <div className="animate-fade-up" style={{ marginTop: 32, padding: '24px', borderRadius: 20, background: 'rgba(91,110,245,0.08)', border: '1px solid rgba(91,110,245,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-primary-light)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                <Sparkles size={14} /> Explanation
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{q.explanation}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
