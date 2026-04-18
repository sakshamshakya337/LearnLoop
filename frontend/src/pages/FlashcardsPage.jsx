import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlashcardGeneratorModal from '../components/FlashcardGeneratorModal';
import api from '../services/api';

export default function FlashcardsPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterDiff, setFilterDiff] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('study'); // 'study' | 'grid'

  useEffect(() => {
    fetchCards();
  }, [moduleId]);

  // Handle filtering whenever filter change or cards updated
  useEffect(() => {
    const result = filterDiff === 'all'
      ? cards
      : cards.filter(c => c.difficulty === filterDiff);
    setFiltered(result);
    setCurrent(0);
    setFlipped(false);
  }, [filterDiff, cards]);

  async function fetchCards() {
    setLoading(true);
    try {
      const res = await api.get(`/flashcards/${moduleId}`);
      const data = res.data;
      setCards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch cards:', e);
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (current < filtered.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
    }
  }

  function prev() {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ') { 
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault(); 
          setFlipped(f => !f); 
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, filtered]);

  const diffColors = { easy: '#1D9E75', medium: '#D4A017', hard: '#D85A30' };
  const diffBg    = { easy: '#1D9E7520', medium: '#D4A01720', hard: '#D85A3020' };

  const counts = {
    all: cards.length,
    easy: cards.filter(c => c.difficulty === 'easy').length,
    medium: cards.filter(c => c.difficulty === 'medium').length,
    hard: cards.filter(c => c.difficulty === 'hard').length,
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '6rem', color: '#888' }}>
       <p>Loading flashcards...</p>
    </div>
  );

  // Empty state
  if (cards.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '6rem', padding: '1rem' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🃏</div>
      <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: 8 }}>No flashcards yet</h2>
      <p style={{ color: '#888', marginBottom: 32 }}>Generate high-quality flashcards from your module notes using AI.</p>
      <button
        onClick={() => setShowModal(true)}
        style={btnStyle}
      >
        Generate Flashcards
      </button>
      {showModal && (
        <FlashcardGeneratorModal
          moduleId={moduleId}
          hasExisting={false}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );

  const card = filtered[current];
  const progress = filtered.length > 0 ? ((current + 1) / filtered.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={ghostBtn}>← Back to Module</button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setViewMode(viewMode === 'study' ? 'grid' : 'study')}
            style={ghostBtn}
          >
            {viewMode === 'study' ? '⊞ Grid view' : '📖 Study mode'}
          </button>
          <button onClick={() => setShowModal(true)} style={btnStyle}>
             Regenerate
          </button>
        </div>
      </div>

      {/* ── Difficulty filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'easy', 'medium', 'hard'].map(d => (
          <button
            key={d}
            onClick={() => setFilterDiff(d)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13,
              border: `1.5px solid ${filterDiff === d ? (d === 'all' ? '#7c6af7' : diffColors[d]) : '#2a2a4a'}`,
              background: filterDiff === d ? (d === 'all' ? '#7c6af722' : diffBg[d]) : 'transparent',
              color: filterDiff === d ? '#fff' : '#777',
              cursor: 'pointer', fontWeight: filterDiff === d ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 11 }}>
              {counts[d]}
            </span>
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#444', alignSelf: 'center', display: 'none', sm: 'block' }}>
          Space: Flip · Arrows: Nav
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '3rem 2rem', background: '#12122b', borderRadius: 20, border: '1px solid #2a2a4a' }}>
          <p style={{ color: '#888', marginBottom: 20 }}>
            No {filterDiff} difficulty cards found in this deck.
          </p>
          <button onClick={() => setFilterDiff('all')} style={ghostBtn}>Show all cards</button>
        </div>
      ) : viewMode === 'study' ? (
        <>
          {/* ── Progress bar ── */}
          <div style={{ height: 4, background: '#1a1a35', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c6af7, #5b4fd4)',
              borderRadius: 4, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          {/* ── Card counter ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: '#666' }}>
            <span style={{ fontWeight: 600 }}>Card {current + 1} of {filtered.length}</span>
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
              background: diffBg[card?.difficulty] || '#1a1a35',
              color: diffColors[card?.difficulty] || '#aaa',
              border: `1px solid ${diffColors[card?.difficulty] || '#333'}`,
              letterSpacing: '0.05em'
            }}>
              {card?.difficulty?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>

          {/* ── Flashcard ── */}
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              minHeight: 320, borderRadius: 28,
              background: flipped
                ? `linear-gradient(135deg, ${diffBg[card?.difficulty] || '#1a1a3588'}, #0d0d1f)`
                : '#14142b',
              border: `2.5px solid ${flipped ? (diffColors[card?.difficulty] || '#1D9E75') : '#1e1e3d'}`,
              padding: '3rem',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', gap: 20,
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              userSelect: 'none',
              boxShadow: flipped ? `0 25px 60px ${diffColors[card?.difficulty]}15` : '0 15px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.25em',
              color: flipped ? (diffColors[card?.difficulty] || '#1D9E75') : '#7c6af7',
              marginBottom: 10, opacity: 0.9
            }}>
              {flipped ? 'THE ANSWER' : 'THE QUESTION'}
            </div>

            <p style={{ 
              fontSize: '1.4rem', 
              lineHeight: 1.6, 
              color: '#fff', 
              maxWidth: 540, 
              margin: 0,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif'
            }}>
              {flipped ? card?.answer : card?.question}
            </p>

            {!flipped && (
              <div style={{ 
                fontSize: 12, 
                color: '#444', 
                position: 'absolute',
                bottom: 24,
                fontWeight: 600
              }}>
                Tap to flip card
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
            <button
              onClick={prev} disabled={current === 0}
              style={{ ...navBtn, opacity: current === 0 ? 0.3 : 1 }}
            >
              ← Previous
            </button>
            <button onClick={() => setFlipped(f => !f)} style={{ ...navBtn, background: '#7c6af7', color: '#fff', border: 'none', width: 140 }}>
              Flip
            </button>
            <button
              onClick={next} disabled={current === filtered.length - 1}
              style={{ ...navBtn, opacity: current === filtered.length - 1 ? 0.3 : 1 }}
            >
              Next →
            </button>
          </div>

          {current === filtered.length - 1 && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: 40, 
              padding: '2rem', 
              background: '#1D9E7508', 
              borderRadius: 24, 
              border: '1px dashed #1D9E7530' 
            }}>
              <p style={{ color: '#1D9E75', fontSize: 16, fontWeight: 600, margin: 0 }}>
                🎉 Deck completed! You've reviewed {filtered.length} cards.
              </p>
              <button 
                onClick={() => { setCurrent(0); setFlipped(false); }} 
                style={{ ...ghostBtn, marginTop: 16, borderColor: '#1D9E7540', color: '#1D9E75' }}
              >
                Start Over
              </button>
            </div>
          )}
        </>
      ) : (
        /* ── Grid View ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => { setViewMode('study'); setCurrent(i); setFlipped(false); }}
              style={{
                background: '#14142b', 
                border: '1px solid #1e1e3d',
                borderLeft: `5px solid ${diffColors[c.difficulty] || '#7c6af7'}`,
                borderRadius: 16, 
                padding: '1.5rem', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = (diffColors[c.difficulty] + '44') || '#7c6af744';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#1e1e3d';
              }}
            >
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
                color: diffColors[c.difficulty] || '#7c6af7',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>CARD #{i + 1}</span>
                <span style={{ 
                  background: diffColors[c.difficulty] + '15', 
                  padding: '2px 8px', 
                  borderRadius: 4 
                }}>
                  {c.difficulty?.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 15, color: '#eee', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                {c.question}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Regenerate modal ── */}
      {showModal && (
        <FlashcardGeneratorModal
          moduleId={moduleId}
          hasExisting={cards.length > 0}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

const btnStyle = {
  padding: '12px 28px', borderRadius: 12,
  background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
  border: 'none', color: '#fff', fontSize: 15,
  fontWeight: 700, cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 8px 20px rgba(124, 106, 247, 0.25)'
};

const ghostBtn = {
  padding: '10px 20px', borderRadius: 12,
  border: '1px solid #1e1e3d', background: 'rgba(30, 30, 61, 0.3)',
  color: '#888', fontSize: 13, cursor: 'pointer',
  fontWeight: 600, transition: 'all 0.2s ease'
};

const navBtn = {
  padding: '12px 24px', borderRadius: 12,
  border: '1.5px solid #1e1e3d', background: '#14142b',
  color: '#eee', fontSize: 14, cursor: 'pointer',
  fontWeight: 600, transition: 'all 0.2s ease'
};
