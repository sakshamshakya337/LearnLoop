import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';

/**
 * FlashcardGeneratorModal
 * 
 * Props:
 *   moduleId  (string)   — the module to generate from
 *   onClose   (function) — close the modal
 *   hasExisting (bool)   — whether cards already exist for this module
 */
export default function FlashcardGeneratorModal({ moduleId, onClose, hasExisting }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState('mixed');
  const [replace, setReplace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const PRESETS = [5, 10, 15];
  const DIFFICULTY_OPTIONS = [
    { value: 'mixed',  label: '🎲 Mixed',  desc: 'Basic to advanced' },
    { value: 'easy',   label: '🟢 Easy',   desc: 'Definitions & recall' },
    { value: 'medium', label: '🟡 Medium', desc: 'Concepts & processes' },
    { value: 'hard',   label: '🔴 Hard',   desc: 'Analysis & application' },
  ];

  async function handleGenerate() {
    // 1. Professional Auth Guard (Checks both Supabase and Firebase)
    const fbUser = auth.currentUser;
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    
    const currentUser = fbUser || sbUser;

    if (!currentUser) {
      alert("Session expired. Please login again to generate flashcards.");
      return;
    }

    if (count < 5 || count > 15) {
      setError('Please enter a number between 5 and 15.');
      return;
    }
    setError('');
    setLoading(true);
    setProgress('Checking identity...');

    try {
      // Progress simulation
      const progressMessages = [
        'Analyzing content...',
        'Generating questions...',
        'Building answers...',
        'Almost done...'
      ];
      let msgIndex = 0;
      const progressInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % progressMessages.length;
        setProgress(progressMessages[msgIndex]);
      }, 3000);

      const res = await api.post(`/flashcards/generate/${moduleId}`, {
        userId: currentUser.uid || currentUser.id,
        count,
        difficulty,
        replace
      });

      clearInterval(progressInterval);
      
      const data = res.data;
      if (!data.success) throw new Error(data.error);

      setProgress(`✅ Generated ${data.count} flashcards!`);
      setTimeout(() => navigate(`/flashcards/${moduleId}`), 800);

    } catch (e) {
      console.error('Generation Error:', e);
      const msg = e.response?.data?.error || e.message || 'Something went wrong.';
      const hint = e.response?.data?.hint ? ` Hint: ${e.response.data.hint}` : '';
      setError(`${msg}${hint}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🃏 Generate Flashcards</div>
            <div style={styles.subtitle}>AI will cover your entire notes — basic to advanced</div>
          </div>
          {!loading && (
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          )}
        </div>

        {/* Count selector */}
        <div style={styles.section}>
          <label style={styles.label}>How many flashcards?</label>
          <div style={styles.presetRow}>
            {PRESETS.map(n => (
              <button
                key={n}
                style={{ ...styles.presetBtn, ...(count === n ? styles.presetBtnActive : {}) }}
                onClick={() => setCount(n)}
                disabled={loading}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={styles.customRow}>
            <span style={styles.customLabel}>Or enter custom:</span>
            <input
              type="number"
              min={5}
              max={15}
              value={count}
              onChange={e => setCount(parseInt(e.target.value) || 0)}
              style={styles.countInput}
              disabled={loading}
            />
            <span style={styles.customLabel}>cards (5–15)</span>
          </div>
        </div>

        {/* Difficulty selector */}
        <div style={styles.section}>
          <label style={styles.label}>Difficulty level</label>
          <div style={styles.difficultyGrid}>
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                style={{
                  ...styles.diffBtn,
                  ...(difficulty === opt.value ? styles.diffBtnActive : {})
                }}
                onClick={() => setDifficulty(opt.value)}
                disabled={loading}
              >
                <span style={{ fontSize: 15 }}>{opt.label}</span>
                <span style={styles.diffDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Replace toggle (only shown if cards already exist) */}
        {hasExisting && (
          <div style={styles.section}>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: replace ? '#7c6af7' : '#444',
                  position: 'relative', transition: 'background 0.2s', cursor: 'pointer'
                }}
                onClick={() => !loading && setReplace(!replace)}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: replace ? 18 : 3,
                  transition: 'left 0.2s'
                }} />
              </div>
              <span>Replace existing flashcards</span>
            </label>
            {!replace && (
              <p style={styles.hint}>New cards will be added to the existing set.</p>
            )}
          </div>
        )}

        {/* Progress / error */}
        {loading && (
          <div style={styles.progressBox}>
            <div style={styles.spinner} />
            <span style={{ color: '#a89cf7', fontSize: 14 }}>{progress}</span>
          </div>
        )}
        {error && !loading && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {/* Summary */}
        {!loading && !error && (
          <div style={styles.summaryBox}>
            Will generate <strong>{count} {difficulty === 'mixed' ? 'basic–advanced' : difficulty}</strong> flashcards covering your entire notes
          </div>
        )}

        {/* Generate button */}
        <button
          style={{ ...styles.generateBtn, opacity: loading ? 0.6 : 1 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : `Generate ${count} Flashcards`}
        </button>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem'
  },
  modal: {
    background: '#12122a', border: '1px solid #2a2a4a',
    borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480,
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  title: { fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888' },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#888',
    fontSize: 18, cursor: 'pointer', padding: '4px 8px'
  },
  section: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 10 },
  presetRow: { display: 'flex', gap: 8, marginBottom: 10 },
  presetBtn: {
    flex: 1, padding: '8px 0', borderRadius: 8,
    border: '1.5px solid #2a2a4a', background: '#1a1a35',
    color: '#aaa', fontSize: 15, fontWeight: 600, cursor: 'pointer'
  },
  presetBtnActive: {
    border: '1.5px solid #7c6af7', background: '#7c6af722', color: '#a89cf7'
  },
  customRow: { display: 'flex', alignItems: 'center', gap: 10 },
  customLabel: { fontSize: 13, color: '#666' },
  countInput: {
    width: 70, padding: '6px 10px', borderRadius: 8,
    border: '1.5px solid #2a2a4a', background: '#1a1a35',
    color: '#fff', fontSize: 15, textAlign: 'center'
  },
  difficultyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  diffBtn: {
    padding: '10px 12px', borderRadius: 10, border: '1.5px solid #2a2a4a',
    background: '#1a1a35', color: '#aaa', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
    textAlign: 'left'
  },
  diffBtnActive: { border: '1.5px solid #7c6af7', background: '#7c6af71a', color: '#fff' },
  diffDesc: { fontSize: 11, color: '#666' },
  progressBox: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#1a1a35', borderRadius: 10, padding: '12px 16px', marginBottom: '1rem'
  },
  spinner: {
    width: 18, height: 18, borderRadius: '50%',
    border: '2px solid #2a2a4a', borderTopColor: '#7c6af7',
    animation: 'spin 0.8s linear infinite', flexShrink: 0
  },
  errorBox: {
    background: '#3a1a1a', border: '1px solid #7c3030', borderRadius: 10,
    padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: '1rem'
  },
  summaryBox: {
    background: '#1a1a35', borderRadius: 10, padding: '10px 14px',
    color: '#888', fontSize: 13, marginBottom: '1rem'
  },
  generateBtn: {
    width: '100%', padding: '13px', borderRadius: 10,
    background: 'linear-gradient(135deg, #7c6af7, #5b4fd4)',
    border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.2s'
  },
  hint: { fontSize: 11, color: '#666', marginTop: 4 }
};
