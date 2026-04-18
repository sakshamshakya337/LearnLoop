import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, FileText, Type } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export default function UploadPage() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [userId, setUserId] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

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

  async function processFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    
    try {
      const res = await api.post('/content/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      navigate('/notes/review', { state: { notes: data.notes, rawText: data.rawText } });
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function processPaste() {
    if (pastedText.trim().length < 50) { 
      setError('Please paste at least 50 characters.'); 
      return; 
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/content/upload', { text: pastedText });
      const data = res.data;
      if (!data.success) throw new Error(data.error);
      navigate('/notes/review', { state: { notes: data.notes, rawText: data.rawText } });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="responsive-padding" style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif' }}>
      <main className="responsive-container" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Add Content
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Upload a PDF or paste text to generate study materials instantly.</p>
        </header>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, padding: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
          <button 
            onClick={() => setMode('upload')} 
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: mode === 'upload' ? 'var(--grad-brand)' : 'transparent',
              color: mode === 'upload' ? '#fff' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            <UploadCloud size={18} /> Upload PDF
          </button>
          <button 
            onClick={() => setMode('paste')} 
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: mode === 'paste' ? 'var(--grad-brand)' : 'transparent',
              color: mode === 'paste' ? '#fff' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)'
            }}
          >
            <Type size={18} /> Paste Text
          </button>
        </div>

        <div className="glass-card" style={{ padding: 40, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {error && (
            <div style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              {error}
            </div>
          )}

          {mode === 'upload' ? (
            <div
              onDrop={e => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? 'rgba(91,110,245,0.8)' : 'rgba(255,255,255,0.1)'}`,
                background: dragOver ? 'rgba(91,110,245,0.05)' : 'rgba(255,255,255,0.02)',
                borderRadius: 24, padding: '60px 24px', textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-base)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.6 : 1
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} disabled={loading} onChange={e => processFile(e.target.files[0])} />
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: dragOver ? 'var(--grad-brand)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, transition: 'var(--transition-base)' }}>
                {loading ? <div style={{width: 32, height: 32, borderRadius: '50%', border: '3px solid #fff', borderTopColor: 'transparent', animation: 'spin-slow 0.8s linear infinite'}} />
                 : dragOver ? <CheckCircle2 size={36} color="#fff" /> 
                 : <UploadCloud size={36} color={dragOver ? '#fff' : 'var(--text-muted)'} />}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                {loading ? 'Analyzing AI Pattern...' : dragOver ? 'Drop it here!' : 'Drag & drop a PDF'}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                {loading ? 'Please wait, compiling structured study notes.' : 'or click to browse your files'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste your notes, textbook content, or any text here..."
                disabled={loading}
                style={{ 
                  flex: 1, width: '100%', padding: '24px', borderRadius: 20, fontSize: 15, lineHeight: 1.6,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)', outline: 'none', fontFamily: 'Sora, sans-serif',
                  minHeight: 300, resize: 'vertical'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(91,110,245,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button 
                onClick={processPaste} 
                className="btn-primary"
                disabled={loading} 
                style={{ marginTop: 24, alignSelf: 'flex-end', padding: '14px 28px' }}
              >
                {loading ? (
                  <><span style={{width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin-slow 0.8s linear infinite'}} /> Generating...</>
                ) : (
                  <><FileText size={18} /> Generate Notes</>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
