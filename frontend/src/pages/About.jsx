import React from 'react';
import Layout from '../components/layout/Layout';
import { Users, Cpu, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => (
  <Layout>
    <style>{`
      @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .fade-card { animation: fade-up 0.6s ease forwards; }
    `}</style>

    {/* Hero */}
    <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(91,110,245,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(91,110,245,0.1)', border: '1px solid rgba(91,110,245,0.25)', fontSize: 13, fontWeight: 700, color: '#8b96ff', marginBottom: 24 }}>
          <Sparkles size={13} /> Our Story
        </div>
        <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 64px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
          We believe learning<br />
          <span style={{ background: 'linear-gradient(135deg,#5b6ef5,#9b59ff,#00c06b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            shouldn't be a chore.
          </span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto' }}>
          LearnLoop was built on a simple premise: learning shouldn't be about organizing,
          formatting, and copying notes. It should be about understanding.
        </p>
      </div>
    </section>

    {/* Mission card */}
    <section style={{ padding: '0 24px 80px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ background: 'rgba(91,110,245,0.07)', border: '1px solid rgba(91,110,245,0.2)', borderRadius: 28, padding: '48px 40px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>The Digital Greenhouse</h2>
        </div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 16 }}>
          We call our design philosophy "The Digital Greenhouse." Just like a real greenhouse provides the optimal environment for plants to grow rapidly, LearnLoop provides the optimal digital environment for your knowledge to grow.
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          We strip away the structural borders to let your focus flow — using AI not just to process data, but to illuminate it. Built by a team of educators and engineers, LearnLoop integrates cutting-edge LLMs (Google Gemini, Groq) directly into your study workflow.
        </p>
      </div>

      {/* Value props */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {[
          {
            icon: Users,
            gradient: 'linear-gradient(135deg,#5b6ef5,#9b59ff)',
            title: 'Built for Students',
            desc: 'Designed from the ground up for students, educators, and lifelong learners who want to learn more in less time.',
          },
          {
            icon: Cpu,
            gradient: 'linear-gradient(135deg,#00c06b,#00e5a0)',
            title: 'Powered by AI',
            desc: 'We use Gemini Flash and Groq models under the hood, giving you enterprise-grade intelligence at student prices.',
          },
          {
            icon: Sparkles,
            gradient: 'linear-gradient(135deg,#ff9f43,#ff6b6b)',
            title: 'Always Improving',
            desc: 'Our team ships updates every week. The platform gets smarter as you use it — literally learning alongside you.',
          },
        ].map(({ icon: Icon, gradient, title, desc }) => (
          <div
            key={title}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, transition: 'all 0.25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon size={22} color="#fff" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: '0 24px 100px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: '56px 36px' }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Join us on the journey</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Try LearnLoop free today and see why over 50,000 students love it.</p>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 6px 24px rgba(91,110,245,0.4)', fontFamily: 'Sora, sans-serif' }}>
          Get Started Free <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </Layout>
);

export default About;
