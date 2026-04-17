import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

/* Google SVG */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
  fontFamily: 'Sora, sans-serif',
  fontSize: 14,
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.65)',
  marginBottom: 8,
  fontFamily: 'Sora, sans-serif',
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/dashboard');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      
      // Ensure the user exists in profiles DB so foreign keys don't fail
      const { error: dbError } = await supabase.from('profiles').insert({
        id: res.user.uid,
        email: res.user.email,
        full_name: res.user.displayName || res.user.email.split('@')[0],
        avatar_url: res.user.photoURL,
        role: 'user'
      });
      // Ignore if they already exist
      if (dbError && dbError.code !== '23505') throw dbError;
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0823', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'Sora, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(91,110,245,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(155,89,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(91,110,245,0.5)' }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>LearnLoop</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#8b96ff', fontWeight: 600, textDecoration: 'none' }}>Start for free</Link>
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {/* Error message */}
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 10, fontSize: 13, color: '#ff6b6b', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@university.edu"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.6)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#8b96ff', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(91,110,245,0.6)'; e.target.style.background = 'rgba(91,110,245,0.05)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="remember" type="checkbox" style={{ width: 16, height: 16, accentColor: '#5b6ef5' }} />
              <label htmlFor="remember" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Remember me</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '14px', borderRadius: 12, background: loading ? 'rgba(91,110,245,0.4)' : 'linear-gradient(135deg,#5b6ef5,#9b59ff)', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(91,110,245,0.4)', transition: 'all 0.2s ease', marginTop: 4 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
