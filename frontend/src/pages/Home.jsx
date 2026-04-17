import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FileText, Brain, Mic, Zap, PlayCircle, CheckCircle2, Upload, Globe, ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/* ── reusable feature card ── */
const FeatureCard = ({ icon: Icon, iconBg, title, desc }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 24,
      padding: 32,
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(91,110,245,0.08)';
      e.currentTarget.style.borderColor = 'rgba(91,110,245,0.3)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.3)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{ width: 56, height: 56, borderRadius: 16, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <Icon size={28} color="#fff" />
    </div>
    <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</h3>
    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</p>
  </div>
);

/* ── stat pill ── */
const StatPill = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontWeight: 500 }}>{label}</p>
  </div>
);

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hero-title { animation: fade-up 0.7s ease forwards; }
        .hero-sub { animation: fade-up 0.7s ease 0.15s both; }
        .hero-cta { animation: fade-up 0.7s ease 0.3s both; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        {/* radial glow backgrounds */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(91,110,245,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-10%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(155,89,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,192,107,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="hero-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 99, background: 'rgba(91,110,245,0.12)', border: '1px solid rgba(91,110,245,0.3)', fontSize: 13, fontWeight: 700, color: '#8b96ff', marginBottom: 32 }}>
            <Sparkles size={14} />
            LearnLoop - AI-Powered Learning Assistant
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 24 }}>
            The intelligent way to<br />
            <span style={{ background: 'linear-gradient(135deg, #5b6ef5 0%, #9b59ff 50%, #00c06b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              master any subject.
            </span>
          </h1>

          <p className="hero-sub" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.65, fontWeight: 400 }}>
            Transform PDFs, YouTube videos, and raw text into interactive flashcards, smart notes, and AI-tailored quizzes — in seconds.
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 38px', borderRadius: 14, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 32px rgba(91,110,245,0.45)', transition: 'all 0.25s ease', fontFamily: 'Sora, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(91,110,245,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,110,245,0.45)'; }}
              >
                Go to Dashboard <LayoutDashboard size={19} />
              </Link>
            ) : (
              <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 32px rgba(91,110,245,0.45)', transition: 'all 0.25s ease', fontFamily: 'Sora, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(91,110,245,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,110,245,0.45)'; }}
              >
                Start Learning Free <ArrowRight size={18} />
              </Link>
            )}
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '14px 28px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.25s ease', fontFamily: 'Sora, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >
              <PlayCircle size={20} /> Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <p style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
            No credit card required · Cancel anytime · Free trial 24h
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          <StatPill value="NA" label="Students using LearnLoop" />
          <StatPill value="NA" label="Flashcards generated" />
          <StatPill value="NA" label="Average rating" />
          <StatPill value="10×" label="Faster study prep" />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#8b96ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>What you get</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            Everything you need to ace it
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
            Your personalized AI greenhouse for accelerated, retention-focused learning.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <FeatureCard icon={FileText} iconBg="linear-gradient(135deg,#5b6ef5,#9b59ff)" title="Smart AI Notes" desc="Automatically extracts key concepts, creates structured headers, and builds clean summaries from any document or lecture." />
          <FeatureCard icon={Brain} iconBg="linear-gradient(135deg,#00c06b,#00e5a0)" title="Instant Flashcards" desc="Turn any PDF or video into spaced-repetition flashcard decks in seconds. Stop wasting time building them manually." />
          <FeatureCard icon={Mic} iconBg="linear-gradient(135deg,#ff9f43,#ff6b6b)" title="AI Audio Podcasts" desc="Listen on the go. LearnLoop converts your study modules into engaging, conversational audio scripts you can play anywhere." />
          <FeatureCard icon={Upload} iconBg="linear-gradient(135deg,#9b59ff,#5b6ef5)" title="Any Format" desc="Upload PDFs, DOCX files, audio files — or paste a YouTube URL. Our AI handles transcription and structuring for you." />
          <FeatureCard icon={Globe} iconBg="linear-gradient(135deg,#00c06b,#5b6ef5)" title="AI Tutor Chat" desc="Ask questions directly about your study material. Get instant, context-aware answers grounded in your uploaded documents." />
          <FeatureCard icon={CheckCircle2} iconBg="linear-gradient(135deg,#ff6b6b,#9b59ff)" title="Smart Quizzes" desc="Adaptive quizzes that test your weak spots and track your mastery over time with detailed performance analytics." />
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#8b96ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 56 }}>
            Three steps to smarter studying
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Upload Content', desc: 'Drop any PDF, paste a YouTube link, or record audio. We ingest it all.' },
              { step: '02', title: 'AI Processes It', desc: 'Our Gemini-powered AI generates notes, flashcards, and quiz questions automatically.' },
              { step: '03', title: 'Master It Faster', desc: 'Study with adaptive tools designed to maximize retention and cut prep time by 10×.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ position: 'relative' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(91,110,245,0.2)', letterSpacing: '-0.06em', lineHeight: 1, marginBottom: 12 }}>{step}</div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(91,110,245,0.2) 0%, rgba(155,89,255,0.15) 100%)', border: '1px solid rgba(91,110,245,0.3)', borderRadius: 32, padding: '64px 40px', position: 'relative', overflow: 'hidden' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(ellipse, rgba(91,110,245,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16, position: 'relative' }}>
            Ready to loop into learning?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, position: 'relative' }}>
            Join thousands of scholars already saving hours every week on study prep.
          </p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 32px rgba(91,110,245,0.5)', position: 'relative', fontFamily: 'Sora, sans-serif', transition: 'all 0.25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(91,110,245,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,110,245,0.5)'; }}
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        <p style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
          No credit card required · Cancel anytime · Free trial 24h
        </p>
      </div>
    </section>

    {/* ── STATS STRIP ────────────────────────────────────────── */}
    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
        <StatPill value="NA" label="Students using LearnLoop" />
        <StatPill value="NA" label="Flashcards generated" />
        <StatPill value="NA" label="Average rating" />
        <StatPill value="10×" label="Faster study prep" />
      </div>
    </section>

    {/* ── FEATURES ───────────────────────────────────────────── */}
    <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#8b96ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>What you get</p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
          Everything you need to ace it
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
          Your personalized AI greenhouse for accelerated, retention-focused learning.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <FeatureCard icon={FileText} iconBg="linear-gradient(135deg,#5b6ef5,#9b59ff)" title="Smart AI Notes" desc="Automatically extracts key concepts, creates structured headers, and builds clean summaries from any document or lecture." />
        <FeatureCard icon={Brain} iconBg="linear-gradient(135deg,#00c06b,#00e5a0)" title="Instant Flashcards" desc="Turn any PDF or video into spaced-repetition flashcard decks in seconds. Stop wasting time building them manually." />
        <FeatureCard icon={Mic} iconBg="linear-gradient(135deg,#ff9f43,#ff6b6b)" title="AI Audio Podcasts" desc="Listen on the go. LearnLoop converts your study modules into engaging, conversational audio scripts you can play anywhere." />
        <FeatureCard icon={Upload} iconBg="linear-gradient(135deg,#9b59ff,#5b6ef5)" title="Any Format" desc="Upload PDFs, DOCX files, audio files — or paste a YouTube URL. Our AI handles transcription and structuring for you." />
        <FeatureCard icon={Globe} iconBg="linear-gradient(135deg,#00c06b,#5b6ef5)" title="AI Tutor Chat" desc="Ask questions directly about your study material. Get instant, context-aware answers grounded in your uploaded documents." />
        <FeatureCard icon={CheckCircle2} iconBg="linear-gradient(135deg,#ff6b6b,#9b59ff)" title="Smart Quizzes" desc="Adaptive quizzes that test your weak spots and track your mastery over time with detailed performance analytics." />
      </div>
    </section>

    {/* ── HOW IT WORKS ────────────────────────────────────────── */}
    <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#8b96ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 56 }}>
          Three steps to smarter studying
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          {[
            { step: '01', title: 'Upload Content', desc: 'Drop any PDF, paste a YouTube link, or record audio. We ingest it all.' },
            { step: '02', title: 'AI Processes It', desc: 'Our Gemini-powered AI generates notes, flashcards, and quiz questions automatically.' },
            { step: '03', title: 'Master It Faster', desc: 'Study with adaptive tools designed to maximize retention and cut prep time by 10×.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ position: 'relative' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(91,110,245,0.2)', letterSpacing: '-0.06em', lineHeight: 1, marginBottom: 12 }}>{step}</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA BANNER ──────────────────────────────────────────── */}
    <section style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(91,110,245,0.2) 0%, rgba(155,89,255,0.15) 100%)', border: '1px solid rgba(91,110,245,0.3)', borderRadius: 32, padding: '64px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(ellipse, rgba(91,110,245,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16, position: 'relative' }}>
          Ready to loop into learning?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, position: 'relative' }}>
          Join thousands of scholars already saving hours every week on study prep.
        </p>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 32px rgba(91,110,245,0.5)', position: 'relative', fontFamily: 'Sora, sans-serif', transition: 'all 0.25s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(91,110,245,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,110,245,0.5)'; }}
        >
          Create Free Account <ArrowRight size={18} />
        </Link>
        <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.25)', position: 'relative' }}>No credit card required. Full features free for 24 hours.</p>
      </div>
    </section>
  </Layout>
  );
};

export default Home;
