import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  BookOpen, LayoutDashboard, Layers, Copy, BrainCircuit,
  Settings, LogOut, UploadCloud, Search, PlusCircle, Flame,
  FileText,Bell, PlayCircle, Headphones, CheckCircle2, ChevronRight,
  TrendingUp, Award, Clock, Sparkles, Shield, Trash2, Menu, X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';

/* ── helpers ─────────────────────────────────────────────── */
function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── stat card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div
      className="glass-card p-5 flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}
    >
      <div
        style={{
          background: gradient,
          borderRadius: 14,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 16px ${color}40`,
        }}
      >
        <Icon size={22} color="#fff" />
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── module card ─────────────────────────────────────────── */
function ModuleCard({ type, title, timeAgo, cards, quiz, progress, isNew = false, onClick, onDelete }) {
  const typeColors = {
    PDF: { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b' },
    YT: { bg: 'rgba(255,59,48,0.15)', color: '#ff3b30' },
    DOC: { bg: 'rgba(91,110,245,0.15)', color: '#5b6ef5' },
    AUD: { bg: 'rgba(0,192,107,0.15)', color: '#00c06b' },
    WEB: { bg: 'rgba(255,196,0,0.15)', color: '#ffc400' },
  };
  const tc = typeColors[type] || typeColors.PDF;

  return (
    <div
      onClick={onClick}
      className="glass-card p-5 flex flex-col cursor-pointer group"
      style={{ minHeight: 180 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          style={{
            background: tc.bg,
            color: tc.color,
            borderRadius: 10,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.04em',
          }}
        >
          {type}
        </div>
        {progress !== undefined ? (
          <span
            style={{
              background: 'rgba(91,110,245,0.15)',
              color: 'var(--brand-primary-light)',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }} />
            Processing
          </span>
        ) : (
          <span
            style={{
              background: 'rgba(0,192,107,0.15)',
              color: '#00c06b',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
            }}
          >
            Ready
          </span>
        )}
        
        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              background: 'rgba(255,107,107,0.1)',
              color: '#ff6b6b',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              opacity: 0.4,
            }}
            className="group-hover:opacity-100"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <h3
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: 'var(--text-primary)',
          marginBottom: 4,
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 'auto' }}>{timeAgo}</p>

      {progress !== undefined ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--grad-brand)',
                borderRadius: 99,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{progress}% complete</p>
        </div>
      ) : (
        <div
          className="flex justify-between items-center"
          style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-3">
            {cards !== undefined && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Copy size={12} /> {cards} cards
              </span>
            )}
            {quiz !== undefined && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <BrainCircuit size={12} /> {quiz} quiz
              </span>
            )}
          </div>
          <button
            style={{
              color: 'var(--brand-primary-light)',
              background: 'rgba(91,110,245,0.1)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 8px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <PlayCircle size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);           // { name, email, avatarUrl }
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  
  // Real Data states
  const [modules, setModules] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Responsive resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── delete module ─────────────────────────────── */
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All associated flashcards and quiz data will be lost.')) {
      return;
    }

    try {
      // Optimistic update
      setModules(prev => prev.filter(m => m.id !== moduleId));
      
      await api.delete(`/modules/${moduleId}`);
    } catch (err) {
      console.error('Delete module error:', err);
      alert('Failed to delete module. Please try again.');
      // Revert on error
      fetchModules();
    }
  };

  /* ── fetch authenticated user ─────────────────── */
  useEffect(() => {
    let mounted = true;

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (fireUser) => {
      if (!mounted) return;
      
      if (fireUser) {
        // Fetch existing profile to preserve role
        supabase.from('profiles').select('*').eq('id', fireUser.uid).single()
          .then(({ data: profile }) => {
            if (!profile) {
              // Create new profile if it doesn't exist
              return supabase.from('profiles').insert({
                id: fireUser.uid,
                email: fireUser.email,
                full_name: fireUser.displayName || fireUser.email?.split('@')[0] || 'Learner',
                avatar_url: fireUser.photoURL || null,
                role: 'user'
              });
            }
            return { data: profile };
          })
          .then(({ data: profile }) => {
            if (mounted) {
              setUser({
                name: profile?.full_name || fireUser.displayName || fireUser.email?.split('@')[0] || 'Learner',
                email: fireUser.email || '',
                avatarUrl: profile?.avatar_url || fireUser.photoURL || null,
                role: profile?.role || 'user',
                provider: 'firebase',
              });
              setLoading(false);
            }
          })
          .catch(err => {
            console.error('Role sync error:', err);
            if (mounted) setLoading(false);
          });
      } else {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [navigate]);

  /* ── fetch module data ────────────────────────── */
  const fetchModules = async () => {
    try {
      const res = await api.get('/content');
      setModules(res.data.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchModules();
    }
  }, [user]);

  /* ── handle file upload ───────────────────────── */
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create a temporary processing module to show instantly in UI
      const tempModule = {
        id: 'temp-' + Date.now(),
        title: file.name,
        source_type: 'document',
        status: 'processing',
        created_at: new Date().toISOString()
      };
      setModules((prev) => [tempModule, ...prev]);

      await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refetch actual records after success
      await fetchModules();
    } catch (err) {
      console.error('File upload failed', err);
      alert('Error uploading file. Please try again.');
      // Remove temp module on error
      setModules((prev) => prev.filter(m => !m.id.toString().startsWith('temp-')));
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  /* ── click-away to close profile dropdown ─────── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── logout ────────────────────────────────────── */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch {
      setLoggingOut(false);
    }
  };

  /* ── loading screen ───────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--surface-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid rgba(91,110,245,0.2)',
            borderTop: '3px solid var(--brand-primary)',
            animation: 'spin-slow 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Loading your workspace…</p>
        <style>{`@keyframes spin-slow { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'modules', label: 'My Modules', icon: Layers },
    { id: 'flashcards', label: 'Flashcards', icon: Copy },
    { id: 'quizzes', label: 'Quizzes', icon: BrainCircuit },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  // Add Admin Console if role matches
  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: Shield, path: '/admin' });
  }

  const adminItem = { id: 'admin', label: 'Admin Console', icon: Shield, path: '/admin' };

  const firstName = user?.name?.split(' ')[0] || 'Learner';
  const userInitials = initials(user?.name || 'L');

  /* ── sidebar ──────────────────────────────────── */
  const Sidebar = () => (
    <aside
      style={{
        width: 260,
        background: 'rgba(15,12,42,0.95)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: mobileOpen ? 'translateX(0)' : (windowWidth <= 1024 ? 'translateX(-100%)' : 'translateX(0)'),
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            background: 'var(--grad-brand)',
            borderRadius: 12,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}
        >
          <BookOpen size={20} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>LearnLoop</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>AI Learning Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
          Workspace
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const { id, label, icon: Icon, path } = item;
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { 
                  if (path) {
                    navigate(path);
                  } else {
                    setActiveTab(id); 
                  }
                  setMobileOpen(false); 
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  color: id === 'admin' ? '#ff6b6b' : (active ? '#fff' : 'var(--text-secondary)'),
                  background: id === 'admin' ? 'rgba(255,107,107,0.1)' : (active ? 'linear-gradient(135deg, rgba(91,110,245,0.3) 0%, rgba(155,89,255,0.2) 100%)' : 'transparent'),
                  boxShadow: active ? 'inset 0 0 0 1px rgba(91,110,245,0.4)' : 'none',
                  transition: 'var(--transition-fast)',
                  textAlign: 'left',
                  marginTop: id === 'admin' ? 12 : 0,
                }}
                onMouseEnter={e => {
                  if (id === 'admin') e.currentTarget.style.background = 'rgba(255,107,107,0.15)';
                }}
                onMouseLeave={e => {
                  if (id === 'admin') e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
                }}
              >
                <Icon size={18} />
                {label}
                {active && id !== 'admin' && (
                  <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8, marginTop: 24 }}>
          Account
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => { setActiveTab('settings'); setMobileOpen(false); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 500, fontSize: 14,
              color: activeTab === 'settings' ? '#fff' : 'var(--text-secondary)',
              background: activeTab === 'settings' ? 'rgba(91,110,245,0.2)' : 'transparent',
              transition: 'var(--transition-fast)', textAlign: 'left',
            }}
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14,
              color: '#ff6b6b',
              background: 'transparent',
              transition: 'var(--transition-fast)', textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </nav>

      {/* Profile card at the bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          style={{
            background: 'rgba(91,110,245,0.12)',
            borderRadius: 16,
            padding: '14px 14px',
            border: '1px solid rgba(91,110,245,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--grad-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  /* ── main content sections ────────────────────── */
  const HomeContent = () => {
    const totalFlashcards = modules.reduce((acc, m) => acc + (m.flashcards_count || 0), 0);
    const readyQuizzes = modules.filter(m => m.quiz_questions_count > 0).length;

    return (
      <div className="animate-fade-up">
        {/* Hero greeting */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                {getGreeting()}, {firstName} 👋
              </p>
              <h1
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                }}
              >
                Ready to accelerate<br />your learning?
              </h1>
            </div>
            <button className="btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/upload')}>
              <PlusCircle size={18} />
              New Module
            </button>
          </div>
        </section>

        {/* Stats */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <StatCard icon={Flame} label="Day Streak" value="1" color="#ff9f43" gradient="linear-gradient(135deg,#ff9f43,#ff6b6b)" />
          <StatCard icon={Layers} label="Modules" value={modules.length.toString()} color="#5b6ef5" gradient="var(--grad-brand)" />
          <StatCard icon={Copy} label="Flashcards" value={totalFlashcards.toString()} color="#00c06b" gradient="var(--grad-green)" />
          <StatCard icon={Award} label="Quizzes Available" value={readyQuizzes.toString()} color="#9b59ff" gradient="linear-gradient(135deg,#9b59ff,#5b6ef5)" />
        </section>


      {/* Upload zone */}
      <section style={{ marginBottom: 40 }}>
        <div
          onClick={() => navigate('/upload')}
          style={{
            border: `2px dashed rgba(91,110,245,0.25)`,
            borderRadius: 24,
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-base)',
            background: 'rgba(91,110,245,0.04)'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,110,245,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,110,245,0.04)'}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(91,110,245,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px auto', transition: 'var(--transition-base)'
            }}
          >
            <UploadCloud size={32} color="var(--brand-primary-light)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>
            Ready to learn? Create a new module
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Click to start uploading your lessons and generate flashcards.
          </p>
        </div>
      </section>

      {/* Recent Modules */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Recent Modules
          </h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
            View All
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {modules.map(mod => (
            <ModuleCard 
              key={mod.id}
              type={mod.source_type === 'document' || mod.source_type === 'DOC' ? 'DOC' : 'PDF'} 
              title={mod.title} 
              timeAgo={new Date(mod.created_at).toLocaleDateString()} 
              progress={mod.status === 'processing' ? 50 : undefined}
              cards={mod.status === 'ready' ? (mod.flashcards_count || 0) : undefined} 
              quiz={mod.status === 'ready' ? (mod.quizzes_count || 0) : undefined} 
              onClick={() => mod.status === 'ready' ? navigate(`/modules/${mod.id}`) : null}
              onDelete={() => handleDeleteModule(mod.id)}
            />
          ))}

          {modules.length === 0 && (
            <div
              className="glass-card"
              style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, cursor: 'pointer', gap: 12 }}
            >
              <div style={{ background: 'rgba(91,110,245,0.1)', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={24} color="var(--brand-primary-light)" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>Upload your first document above</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

  /* ── profile section ──────────────────────────── */
  const ProfileSection = () => (
    <div className="animate-fade-up">
      <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 32 }}>
        Your Profile
      </h1>
      <div className="glass-card" style={{ maxWidth: 560, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(91,110,245,0.4)' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', border: '3px solid rgba(91,110,245,0.4)' }}>
              {userInitials}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Joined via {user?.provider === 'google' ? 'Google' : 'Email'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email Address', value: user?.email },
            { label: 'Sign-in Method', value: user?.provider === 'google' ? 'Google OAuth' : 'Email & Password' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const comingSoon = (label) => (
    <div className="animate-fade-up" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Sparkles size={48} color="var(--brand-primary-light)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{label}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>This section is coming soon. Keep learning!</p>
    </div>
  );

  const ModulesSection = () => (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>My Modules</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Manage your uploaded content and AI-generated study materials.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          <PlusCircle size={18} /> New Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Layers size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No modules yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Upload a document to start extracting insights and flashcards.</p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('/upload')}>Upload your first document</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {modules.map(mod => (
            <ModuleCard 
              key={mod.id}
              type={mod.source_type === 'document' || mod.source_type === 'DOC' ? 'DOC' : 'PDF'} 
              title={mod.title} 
              timeAgo={new Date(mod.created_at).toLocaleDateString()} 
              progress={mod.status === 'processing' ? 50 : undefined}
              cards={mod.status === 'ready' ? (mod.flashcards_count || 0) : undefined} 
              onClick={() => navigate(`/modules/${mod.id}`)}
              onDelete={() => handleDeleteModule(mod.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const FlashcardsSection = () => {
    const studyModules = modules.filter(m => m.status === 'ready' && (m.flashcards_count > 0 || m.has_flashcards));

    return (
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Study Hub</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ready to master your modules? Select a set to start studying.</p>
          </div>
        </div>

        {studyModules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Copy size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No flashcards yet</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Generate flashcards for any of your modules to see them here.</p>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setActiveTab('modules')}>Go to My Modules</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {studyModules.map(mod => (
              <div 
                key={mod.id}
                className="glass-card group p-5 flex flex-col cursor-pointer hover:border-[#00c06b40] transition-all"
                style={{ position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/flashcards/${mod.id}`)}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: 'var(--grad-green)', opacity: 0.6 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ background: 'rgba(0,192,107,0.1)', color: '#00c06b', padding: '10px', borderRadius: 12 }}>
                    <Copy size={20} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00c06b', background: 'rgba(0,192,107,0.1)', padding: '4px 10px', borderRadius: 99 }}>
                    {mod.flashcards_count || 'Check'} Cards
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                  {mod.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Last updated {new Date(mod.created_at).toLocaleDateString()}</p>

                <button 
                  className="btn-primary w-full"
                  style={{ background: 'var(--grad-green)', border: 'none', marginTop: 'auto' }}
                >
                  Study Now <ChevronRight size={14} style={{ marginLeft: 6 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const QuizzesSection = () => {
    const quizModules = modules.filter(m => m.status === 'ready');

    return (
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Quiz Arena</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Challenge yourself and track your progress across all subjects.</p>
          </div>
        </div>

        {quizModules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No quizzes available</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Upload a document and generate some notes first to unlock quizzes.</p>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setActiveTab('modules')}>Explore Modules</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {quizModules.map(mod => (
              <div 
                key={mod.id}
                className="glass-card group p-5 flex flex-col cursor-pointer hover:border-[#9b59ff40] transition-all"
                style={{ position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/quiz/${mod.id}`)}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: 'linear-gradient(to bottom, #9b59ff, #5b6ef5)', opacity: 0.6 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ background: 'rgba(155,89,255,0.1)', color: '#9b59ff', padding: '10px', borderRadius: 12 }}>
                    <Award size={20} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Difficulty</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#9b59ff' }}>Adaptive</p>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                  {mod.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Master this module through 5-10 question bursts.</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Best Score</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>N/A</p>
                  </div>
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Questions</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{mod.quiz_questions_count || '?'}</p>
                  </div>
                </div>

                <button 
                  className="btn-primary w-full"
                  style={{ background: 'linear-gradient(to right, #9b59ff, #5b6ef5)', border: 'none', marginTop: 'auto' }}
                >
                  Launch Quiz <Zap size={14} style={{ marginLeft: 6 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)', fontFamily: 'Sora, sans-serif' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 12, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            animation: 'fade-up 0.3s ease'
          }}
        />
      )}

      {/* Main content */}
      <main 
        style={{ 
          marginLeft: windowWidth > 1024 ? 260 : 0, 
          flex: 1, 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'margin-left 0.4s ease'
        }}
      >
        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '16px 32px',
            background: 'rgba(14,12,46,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: windowWidth <= 1024 ? 'flex' : 'none',
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-primary)',
              zIndex: 110
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {/* Search bar */}
          <div
            style={{
              flex: 1,
              maxWidth: 480,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '10px 16px',
              transition: 'var(--transition-fast)',
            }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search modules, flashcards, notes…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'Sora, sans-serif',
                fontSize: 13,
                fontWeight: 400,
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            {/* Streak badge */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 99,
                background: 'linear-gradient(135deg,rgba(255,159,67,0.15),rgba(255,107,107,0.15))',
                border: '1px solid rgba(255,159,67,0.25)',
              }}
            >
              <Flame size={15} color="#ff9f43" fill="#ff9f43" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ff9f43' }}>0 Day Streak</span>
            </div>

            {/* Notification bell */}
            <button
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
            >
              <Bell size={16} />
            </button>

            {/* Avatar + profile toggle */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--grad-brand)',
                  border: '2px solid rgba(91,110,245,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{userInitials}</span>
                )}
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: 220,
                    background: 'rgba(19,16,58,0.98)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    animation: 'fade-up 0.2s ease forwards',
                  }}
                >
                  <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setShowProfile(false); }}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13,
                      padding: '8px 4px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <Settings size={14} /> Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ff6b6b', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13,
                      padding: '8px 4px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page body */}
        <div style={{ flex: 1, padding: windowWidth > 768 ? '40px 40px' : '20px 20px', overflowY: 'auto' }}>
          {activeTab === 'home' && <HomeContent />}
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'modules' && <ModulesSection />}
          {activeTab === 'flashcards' && <FlashcardsSection />}
          {activeTab === 'quizzes' && <QuizzesSection />}
          {activeTab === 'progress' && comingSoon('Progress Tracking')}
          {activeTab === 'settings' && comingSoon('Settings')}
        </div>
      </main>
    </div>
  );
}
