import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Mail, MessageSquare, MapPin, Send, Sparkles } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 12,
  color: '#fff',
  fontFamily: 'Sora, sans-serif',
  fontSize: 14,
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  resize: 'vertical',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.55)',
  marginBottom: 8,
  fontFamily: 'Sora, sans-serif',
};

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <Layout>
      {/* Hero */}
      <section style={{ padding: '80px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(91,110,245,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: 'rgba(91,110,245,0.1)', border: '1px solid rgba(91,110,245,0.25)', fontSize: 13, fontWeight: 700, color: '#8b96ff', marginBottom: 24 }}>
            <Sparkles size={13} /> We're here to help
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 58px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>Get in touch</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            Have questions about our plans, institution pricing, or need technical support? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 36 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 24, letterSpacing: '-0.01em' }}>Send us a message</h2>

          {sent && (
            <div style={{ marginBottom: 20, padding: '13px 16px', background: 'rgba(0,192,107,0.1)', border: '1px solid rgba(0,192,107,0.25)', borderRadius: 10, fontSize: 14, color: '#00c06b', fontWeight: 600 }}>
              ✓ Message sent! We'll get back to you within 24h.
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required placeholder="John Doe" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.5)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required placeholder="you@university.edu" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.5)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Subject</label>
              <input type="text" required placeholder="What's this about?" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.5)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea rows={5} required placeholder="How can we help you?" style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.5)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(91,110,245,0.4)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(91,110,245,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(91,110,245,0.4)'; }}
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              icon: Mail,
              gradient: 'linear-gradient(135deg,#5b6ef5,#9b59ff)',
              title: 'Email Support',
              lines: ['hello@learnloop.com', 'support@learnloop.com'],
            },
            {
              icon: MessageSquare,
              gradient: 'linear-gradient(135deg,#00c06b,#00e5a0)',
              title: 'Live Chat',
              lines: ['Available for Pro & Institution members', '24/7 support from your Dashboard'],
            },
            {
              icon: MapPin,
              gradient: 'linear-gradient(135deg,#ff9f43,#ff6b6b)',
              title: 'Headquarters',
              lines: ['123 Digital Greenhouse Ave.', 'San Francisco, CA 94107'],
            },
          ].map(({ icon: Icon, gradient, title, lines }) => (
            <div
              key={title}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                <Icon size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>{title}</h3>
                {lines.map((l, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{l}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Response time note */}
          <div style={{ background: 'rgba(91,110,245,0.08)', border: '1px solid rgba(91,110,245,0.2)', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              ⚡ <strong style={{ color: '#8b96ff' }}>Average response time:</strong> under 4 hours for Pro members, under 24 hours for Free users.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
