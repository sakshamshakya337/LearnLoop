import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Copy, BrainCircuit, ChevronLeft, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react';
import Mermaid from '../components/Mermaid';
import FlashcardGeneratorModal from '../components/FlashcardGeneratorModal';

import api from '../services/api';

export default function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [quizCount, setQuizCount] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/modules/${id}`)
      .then(res => setModule(res.data))
      .catch(e => setError(e.message));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this entire module? This will permanently remove all associated notes, flashcards, and quizzes. This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/modules/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to delete module:', err);
      alert('Error deleting module: ' + (err.response?.data?.error || err.message));
      setDeleting(false);
    }
  }

  async function openFlashcardModal() {
    setShowFlashcardModal(true);
  }

  async function handleQuiz() {
    navigate(`/quiz/${id}?count=${quizCount}`);
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <p style={{ color: '#ff6b6b' }}>Error loading module: {error}</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(91,110,245,0.2)', borderTopColor: 'var(--brand-primary)', animation: 'spin-slow 0.8s linear infinite' }} />
      </div>
    );
  }

  const notes = module.notes_json || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif', padding: '40px 20px' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 0, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
          <ChevronLeft size={16} /> Dashboard
        </button>
        
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(91,110,245,0.1)', color: 'var(--brand-primary-light)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, marginBottom: 16 }}>
            <Layers size={14} /> Module Overview
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.2 }}>
            {notes.title || module.title}
          </h1>
          {notes.summary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 700 }}>
              {notes.summary}
            </p>
          )}
        </header>

        {/* Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 48 }}>
          <ActionCard 
            icon={Copy}
            title="Flashcards"
            desc="Generate Q&A cards via AI"
            color="#9b59ff"
            onClick={openFlashcardModal}
            loading={generating}
            primary
          />
          <ActionCard icon={Layers} title="Study Notes" desc="Read your formatted notes" color="#5b6ef5" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} />
          <ActionCard 
            icon={BrainCircuit} 
            title="Quiz" 
            desc="Test your knowledge via MCQs" 
            color="#00c06b" 
            onClick={handleQuiz} 
            footer={(
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', marginTop: 12, padding: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Questions:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="300" 
                  value={quizCount}
                  onChange={(e) => setQuizCount(Math.min(300, Math.max(1, parseInt(e.target.value) || 1)))}
                  onClick={(e) => e.stopPropagation()} // Prevent card click
                  style={{ 
                    width: 60, 
                    background: 'rgba(255,255,255,0.08)', 
                    border: '1px solid rgba(0,192,107,0.3)', 
                    borderRadius: 6, 
                    color: 'var(--text-primary)', 
                    fontSize: 12, 
                    fontWeight: 700, 
                    padding: '2px 6px',
                    textAlign: 'center'
                  }}
                />
              </div>
            )}
          />
        </div>

        {/* Visual Summary (Mermaid Diagram) */}
        {notes.diagram && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ImageIcon size={22} color="var(--brand-primary-light)" /> 
                Visual Summary
              </h2>
              <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <Mermaid chart={notes.diagram} />
          </div>
        )}

        {/* Notes Preview Section */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: '40px', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Structured Notes</h2>
            <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {notes.sections?.map((s, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-primary-light)', marginBottom: 12 }}>{s.heading}</h3>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {s.content || (s.points && s.points.map((p, x) => <p key={x} style={{marginBottom: 8}}>• {p}</p>))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ 
          marginTop: 64, 
          padding: '32px', 
          borderRadius: 24, 
          border: '1px solid rgba(255,107,107,0.2)', 
          background: 'rgba(255,107,107,0.02)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ff6b6b', marginBottom: 4 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
              Deleting this module will permanently remove all study materials. This action cannot be reversed.
            </p>
          </div>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            style={{ 
              background: deleting ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,107,0.15)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: deleting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { if(!deleting) e.currentTarget.style.background = 'rgba(255,107,107,0.25)' }}
            onMouseLeave={e => { if(!deleting) e.currentTarget.style.background = 'rgba(255,107,107,0.15)' }}
          >
            <Trash2 size={18} />
            {deleting ? 'Deleting Module...' : 'Delete Module'}
          </button>
        </div>

        {showFlashcardModal && (
          <FlashcardGeneratorModal 
            moduleId={id} 
            onClose={() => setShowFlashcardModal(false)}
            hasExisting={module.flashcards_count > 0 || (module.flashcards && module.flashcards.length > 0)}
          />
        )}

      </main>
    </div>
  );
}

function ActionCard({ icon: Icon, title, desc, color, onClick, loading, primary, footer }) {
  return (
    <div
      onClick={!loading ? onClick : undefined}
      className="glass-card"
      style={{
        padding: '24px', cursor: loading ? 'wait' : 'pointer', transition: 'var(--transition-base)',
        background: primary ? `linear-gradient(135deg, ${color}22 0%, rgba(20,18,54,0.8) 100%)` : 'rgba(255,255,255,0.03)',
        border: primary ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={e => { if(!loading && !primary) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { if(!loading && !primary) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 16, background: primary ? color : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: primary ? `0 8px 24px ${color}50` : 'none' }}>
        {loading ? <Sparkles size={24} color="#fff" style={{ animation: 'pulse-glow 2s infinite' }} /> : <Icon size={24} color={primary ? '#fff' : color} />}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>
        {loading ? 'Generating...' : title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
      
      {footer && footer}

      {primary && (
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: color, filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }} />
      )}
    </div>
  );
}
