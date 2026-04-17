import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, LayoutList } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import api from '../services/api';

export default function NotesReviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(state?.notes);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = React.useState(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsub();
  }, [navigate]);

  if (!notes) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-base)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No notes found. Go back and upload content.</p>
      </div>
    );
  }

  function updateSection(index, field, value) {
    const updated = { ...notes, sections: notes.sections.map((s, i) => i === index ? { ...s, [field]: value } : s) };
    setNotes(updated);
  }

  async function saveModule() {
    setSaving(true);
    try {
      const res = await api.post('/modules', { 
        title: notes.title, 
        notes, 
        rawText: state.rawText 
      });
      const data = res.data;
      if (!data.success) throw new Error(data.error);
      navigate(`/modules/${data.module.id}`);
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif', padding: '40px 20px' }}>
      <main style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 0, marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              <LayoutList size={28} color="var(--brand-primary-light)" /> 
              Review AI Notes
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Edit headings and content before saving to your workspace.</p>
          </div>
          <button onClick={saveModule} disabled={saving} className="btn-primary" style={{ padding: '12px 24px' }}>
            {saving ? 'Saving...' : <><Save size={18} /> Save Module</>}
          </button>
        </div>

        {/* Global Details */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Module Title</p>
          <input
            value={notes.title || ''}
            onChange={e => setNotes({ ...notes, title: e.target.value })}
            style={{ 
              fontSize: 22, fontWeight: 800, width: '100%', marginBottom: 24, padding: '16px 20px', borderRadius: 16,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition-fast)'
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          />

          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Summary</p>
          <textarea
            value={notes.summary || ''}
            onChange={e => setNotes({ ...notes, summary: e.target.value })}
            rows={3}
            style={{ 
              width: '100%', padding: '16px 20px', borderRadius: 16, fontSize: 15, lineHeight: 1.6,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition-fast)', resize: 'vertical'
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
        </div>

        {/* Sections */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, marginTop: 40 }}>Content Sections</h2>
        {notes.sections?.map((section, i) => (
          <div key={i} className="glass-card" style={{ marginBottom: 20, padding: 24, background: 'linear-gradient(180deg, rgba(23,19,56,0.5) 0%, rgba(14,12,46,0.8) 100%)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(91,110,245,0.15)', color: 'var(--brand-primary-light)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
                Section {i + 1}
              </div>
              <input
                value={section.heading || ''}
                onChange={e => updateSection(i, 'heading', e.target.value)}
                style={{ 
                  flex: 1, fontWeight: 700, fontSize: 16, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition-fast)'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
              />
            </div>
            
            <textarea
              value={section.content || (section.points && section.points.join('\n')) || ''}
              onChange={e => updateSection(i, 'content', e.target.value)}
              rows={6}
              style={{ 
                width: '100%', padding: '16px', borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', outline: 'none', transition: 'var(--transition-fast)', resize: 'vertical'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
            />
          </div>
        ))}

        {/* Key Terms */}
        {notes.keyTerms?.length > 0 && (
          <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Extracted Key Terms</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {notes.keyTerms.map((t, i) => (
                <span key={i} style={{ background: 'rgba(91,110,245,0.1)', color: 'var(--brand-primary-light)', padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, border: '1px solid rgba(91,110,245,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
