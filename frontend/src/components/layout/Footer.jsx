import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Mail, Rss, Share2 } from 'lucide-react';

const Footer = () => {
  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'Pricing', to: '/pricing' },
        { label: 'Features', to: '/#features' },
        { label: 'Dashboard', to: '/dashboard' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'Blog', to: '#' },
        { label: 'Careers', to: '#' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'Terms of Service', to: '#' },
        { label: 'Cookie Policy', to: '#' },
      ],
    },
  ];

  return (
    <footer style={{ background: '#07061c', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Sora, sans-serif', color: '#f0eeff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>LearnLoop</span>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>
              The AI-powered learning platform. Transform any content into knowledge that sticks.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[Globe, Share2, Rss, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(91,110,245,0.2)';
                    e.currentTarget.style.color = '#8b96ff';
                    e.currentTarget.style.borderColor = 'rgba(91,110,245,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <h3 style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 16, letterSpacing: '0.04em' }}>{heading}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s ease', fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#8b96ff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
            © {new Date().getFullYear()} LearnLoop Inc. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
            Built with <span style={{ color: '#ff6b6b' }}>♥</span> for the Community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
