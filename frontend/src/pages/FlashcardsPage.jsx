import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import api from '../services/api';

export default function FlashcardsPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/flashcards/${moduleId}`)
      .then(res => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [moduleId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(155,89,255,0.2)', borderTopColor: '#9b59ff', animation: 'spin-slow 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error || !cards.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error ? `Error: ${error}` : 'No flashcards generated yet.'}</p>
        <button onClick={() => navigate(`/modules/${moduleId}`)} className="btn-ghost">Go Back to Module</button>
      </div>
    );
  }

  const card = cards[current];
  const progress = ((current + 1) / cards.length * 100).toFixed(0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif', padding: '40px 20px' }}>
      <main style={{ maxWidth: 640, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <button onClick={() => navigate(`/modules/${moduleId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600 }}>
            <ChevronLeft size={16} /> Exit
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Flashcard Review</div>
          <div style={{ width: 60 }}></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar & Status */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Card {current + 1} of {cards.length}</span>
            <span style={{ color: card.difficulty === 'hard' ? '#ff6b6b' : card.difficulty === 'easy' ? '#00c06b' : '#ffc400' }}>
              Level: {card.difficulty || 'Medium'}
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--grad-brand)', borderRadius: 99, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>

        {/* The Card */}
        <div style={{ perspective: 1000, flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              flex: 1,
              position: 'relative',
              width: '100%',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              cursor: 'pointer'
            }}
          >
            {/* Front */}
            <div
              style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                background: 'rgba(20,18,54,0.9)', border: '1px solid rgba(91,110,245,0.2)', borderRadius: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40,
                boxShadow: '0 24px 48px rgba(0,0,0,0.3)', textAlign: 'center'
              }}
            >
              <div style={{ position: 'absolute', top: 24, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--brand-primary-light)', opacity: 0.8 }}>QUESTION</div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {card.question}
              </h2>
              <div style={{ position: 'absolute', bottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <RotateCcw size={14} /> Tap to flip
              </div>
            </div>

            {/* Back (Answer) */}
            <div
              style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, rgba(91,110,245,0.1) 0%, rgba(155,89,255,0.05) 100%)', border: '1px solid rgba(155,89,255,0.4)', borderRadius: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40,
                boxShadow: '0 24px 48px rgba(155,89,255,0.15)', transform: 'rotateY(180deg)', textAlign: 'center'
              }}
            >
              <div style={{ position: 'absolute', top: 24, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: '#9b59ff', opacity: 0.8 }}>ANSWER</div>
              <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {card.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40 }}>
          <button 
            onClick={() => { setCurrent(Math.max(0, current - 1)); setFlipped(false); }} 
            disabled={current === 0}
            style={{ 
              padding: '16px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
              cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.3 : 1, transition: 'var(--transition-fast)'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => setFlipped(!flipped)} 
            style={{ 
              flex: 1, maxWidth: 200, padding: '16px 32px', borderRadius: 99, border: 'none', 
              background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, fontFamily: 'Sora, sans-serif',
              cursor: 'pointer', transition: 'var(--transition-fast)'
            }}
          >
            {flipped ? 'Show Question' : 'Show Answer'}
          </button>

          <button 
            onClick={() => { setCurrent(Math.min(cards.length - 1, current + 1)); setFlipped(false); }} 
            disabled={current === cards.length - 1}
            style={{ 
              padding: '16px', borderRadius: '50%', border: 'none', background: 'var(--grad-brand)', color: '#fff',
              cursor: current === cards.length - 1 ? 'not-allowed' : 'pointer', opacity: current === cards.length - 1 ? 0.3 : 1, transition: 'var(--transition-fast)',
              boxShadow: current !== cards.length - 1 ? '0 8px 24px rgba(91,110,245,0.4)' : 'none'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {current === cards.length - 1 && (
          <div style={{ marginTop: 32, textAlign: 'center', background: 'rgba(0,192,107,0.1)', color: '#00c06b', padding: '16px', borderRadius: 16, fontSize: 14, fontWeight: 700 }}>
            🎉 You've reached the end of this deck!
          </div>
        )}

      </main>
    </div>
  );
}
