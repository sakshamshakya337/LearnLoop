import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LayoutDashboard } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,8,35,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'Sora, sans-serif',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(91,110,245,0.5)', flexShrink: 0 }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>LearnLoop</span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 8, listStyle: 'none' }} className="hidden-mobile">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive(to) ? 700 : 500,
                color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                background: isActive(to) ? 'rgba(91,110,245,0.18)' : 'transparent',
                border: isActive(to) ? '1px solid rgba(91,110,245,0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
          {user ? (
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', boxShadow: '0 4px 20px rgba(91,110,245,0.4)', transition: 'all 0.2s ease' }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease' }}>
                Log in
              </Link>
              <Link to="/signup" style={{ padding: '9px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', boxShadow: '0 4px 20px rgba(91,110,245,0.4)', transition: 'all 0.2s ease' }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
          className="show-mobile"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'rgba(10,8,35,0.98)', padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.6)', textDecoration: 'none', background: isActive(to) ? 'rgba(91,110,245,0.2)' : 'transparent' }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }}>Log in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .hidden-mobile{display:none !important;}
          .show-mobile{display:block !important;}
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
