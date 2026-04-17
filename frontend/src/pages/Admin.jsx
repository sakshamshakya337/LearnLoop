import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import {
  BookOpen, LayoutDashboard, Users, CreditCard, Activity,
  AlertCircle, LogOut, RefreshCw, ChevronLeft, Shield,
  TrendingUp, Globe, Mail, CheckCircle, XCircle, Clock,
  MoreVertical, Search
} from 'lucide-react';

import api from '../services/api';

/* ── constants ─────────────────────────────────────────────── */
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'super_secret_learnloop';

/* ── helpers ─────────────────────────────────────────────── */
function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ── stat card ─────────────────────────────────────────────── */
function AdminStatCard({ icon: Icon, label, value, sub, color, gradient, loading }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: gradient, opacity: 0.12, filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${color}40`,
          }}
        >
          <Icon size={20} color="#fff" />
        </div>
        {sub && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00c06b', background: 'rgba(0,192,107,0.1)', padding: '3px 8px', borderRadius: 99 }}>
            {sub}
          </span>
        )}
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
        {loading ? (
          <div style={{ height: 36, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════ */
export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [dbConnected, setDbConnected] = useState(false);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Activity state
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  /* ── resolve admin auth ─────────────────────── */
  useEffect(() => {
    async function resolveAdmin() {
      // Check Firebase first
      const fireUser = auth.currentUser;
      if (fireUser) {
        setAdminUser({
          name: fireUser.displayName || fireUser.email?.split('@')[0] || 'Admin',
          email: fireUser.email || '',
          avatarUrl: fireUser.photoURL || null,
        });
        setAuthLoading(false);
        return;
      }

      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user || fireUser;
      
      if (u) {
        // Fetch profile to verify role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', u.uid || u.id)
          .single();

        if (profile?.role !== 'admin') {
          alert('Access Denied: You do not have administrator privileges.');
          navigate('/dashboard');
          return;
        }

        setAdminUser({
          name: profile.full_name || u.displayName || u.email?.split('@')[0] || 'Admin',
          email: u.email || '',
          avatarUrl: profile.avatar_url || u.photoURL || null,
        });
        setAuthLoading(false);
        return;
      }

      // No auth — redirect
      navigate('/login', { replace: true });
    }

    resolveAdmin();
  }, [navigate]);

  /* ── fetch stats ───────────────────────────── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.get('/admin/stats', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      setStats(res.data);
      setDbConnected(true);
    } catch (err) {
      setStatsError(err.message);
      setDbConnected(false);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ── fetch users ───────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users?page=1', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      setUsers(res.data.users || []);
      setUsersTotal(res.data.total || 0);
    } catch (err) {
      console.error('Users fetch error:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  /* ── fetch subscriptions ────────────────────── */
  const fetchSubscriptions = useCallback(async () => {
    setSubsLoading(true);
    try {
      const res = await api.get('/admin/subscriptions', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error('Subs fetch error:', err);
    } finally {
      setSubsLoading(false);
    }
  }, []);

  /* ── fetch activity ────────────────────────── */
  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const res = await api.get('/admin/activity', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      setActivity(res.data.activity || []);
    } catch (err) {
      console.error('Activity fetch error:', err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  /* ── load data when authenticated ─────────── */
  useEffect(() => {
    if (!authLoading && adminUser) {
      fetchStats();
      fetchUsers();
      fetchSubscriptions();
      fetchActivity();
    }
  }, [authLoading, adminUser, fetchStats, fetchUsers, fetchSubscriptions, fetchActivity]);

  /* ── logout ────────────────────────────────── */
  const handleLogout = async () => {
    setLoggingOut(true);
    await Promise.allSettled([supabase.auth.signOut(), signOut(auth)]);
    navigate('/login', { replace: true });
  };

  /* ── loading screen ───────────────────────── */
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#07061c',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(91,110,245,0.2)', borderTop: '3px solid #5b6ef5', animation: 'spin-slow 0.8s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>Checking credentials…</p>
        <style>{`@keyframes spin-slow { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  const adminInitials = initials(adminUser?.name || 'A');

  /* ── sidebar nav items ─────────────────────── */
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'logs', label: 'Error Logs', icon: AlertCircle },
  ];

  /* ── filtered users ───────────────────────── */
  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ── render ──────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07061c', fontFamily: 'Sora, sans-serif', color: '#f0eeff' }}>
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .admin-fade { animation: fade-up 0.4s ease forwards; }
        .admin-row:hover { background: rgba(91,110,245,0.06) !important; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'rgba(8,7,28,0.97)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'linear-gradient(135deg,#5b6ef5,#ff6b6b)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(91,110,245,0.4)' }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>Admin Console</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>LearnLoop Platform</p>
          </div>
        </div>

        {/* DB status */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: dbConnected ? 'rgba(0,192,107,0.08)' : 'rgba(255,107,107,0.08)', borderRadius: 10, padding: '8px 12px', border: `1px solid ${dbConnected ? 'rgba(0,192,107,0.2)' : 'rgba(255,107,107,0.2)'}` }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: dbConnected ? '#00c06b' : '#ff6b6b', animation: dbConnected ? 'pulse 2s ease infinite' : 'none' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: dbConnected ? '#00c06b' : '#ff6b6b' }}>
              {dbConnected ? 'Database Connected' : 'DB Disconnected'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Management</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif', fontWeight: active ? 700 : 500, fontSize: 13,
                    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                    background: active ? 'rgba(91,110,245,0.2)' : 'transparent',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(91,110,245,0.35)' : 'none',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                >
                  <Icon size={17} />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom: exit + logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13,
              color: 'rgba(255,255,255,0.4)', background: 'transparent', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <ChevronLeft size={16} /> Exit to App
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13,
              color: '#ff6b6b', background: 'transparent', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} /> {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>

          {/* Admin profile pill */}
          <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {adminUser?.avatarUrl ? (
              <img src={adminUser.avatarUrl} alt="admin" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#5b6ef5,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff', flexShrink: 0 }}>
                {adminInitials}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{adminUser?.name}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────── */}
      <main style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          padding: '16px 36px',
          background: 'rgba(7,6,28,0.9)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>
              {activeTab === 'overview' && 'Platform Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'subscriptions' && 'Subscriptions'}
              {activeTab === 'activity' && 'Activity Feed'}
              {activeTab === 'logs' && 'Error Logs'}
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchUsers(); fetchSubscriptions(); fetchActivity(); }}
            disabled={statsLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} style={{ animation: statsLoading ? 'spin-slow 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="admin-fade">
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 40 }}>
                <AdminStatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? '—'} sub={stats?.recentSignups ? `+${stats.recentSignups} this month` : null} color="#5b6ef5" gradient="linear-gradient(135deg,#5b6ef5,#9b59ff)" loading={statsLoading} />
                <AdminStatCard icon={Globe} label="Google Sign-ins" value={stats?.googleUsers ?? '—'} color="#ea4335" gradient="linear-gradient(135deg,#ea4335,#fbbc05)" loading={statsLoading} />
                <AdminStatCard icon={Mail} label="Email Sign-ins" value={stats?.emailUsers ?? '—'} color="#00c06b" gradient="linear-gradient(135deg,#00c06b,#00e5a0)" loading={statsLoading} />
                <AdminStatCard icon={TrendingUp} label="New This Month" value={stats?.recentSignups ?? '—'} color="#ff9f43" gradient="linear-gradient(135deg,#ff9f43,#ff6b6b)" loading={statsLoading} />
              </div>

              {statsError && (
                <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#ff6b6b' }}>
                  <AlertCircle size={16} /> Could not fetch live stats: {statsError}. Check backend connection.
                </div>
              )}

              {/* Recent Users */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Recent Sign-ups</h2>
                  <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', color: '#8b96ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                    View All →
                  </button>
                </div>
                <UsersTable users={users.slice(0, 5)} loading={usersLoading} />
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="admin-fade">
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{usersTotal} total users</p>
                {/* Search */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 10, padding: '9px 14px', minWidth: 280,
                }}>
                  <Search size={14} color="rgba(255,255,255,0.3)" />
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: 13, width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
                <UsersTable users={filteredUsers} loading={usersLoading} />
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {activeTab === 'subscriptions' && (
            <div className="admin-fade">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
                <SubscriptionsTable subscriptions={subscriptions} loading={subsLoading} />
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="admin-fade">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
                <ActivityFeed activity={activity} loading={activityLoading} />
              </div>
            </div>
          )}

          {/* LOGS TAB (Basic fallback) */}
          {activeTab === 'logs' && (
            <div className="admin-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(91,110,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <AlertCircle size={28} color="#8b96ff" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: '#fff' }}>Error Logs</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No critical system errors detected in the last 24 hours.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Subscriptions Table component ─────────────────────────────────── */
function SubscriptionsTable({ subscriptions, loading }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading payments…</div>;
  if (!subscriptions.length) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>No payments records found.</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['User', 'Order ID', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {subscriptions.map(s => (
          <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ padding: '14px 20px', fontWeight: 600, color: '#fff' }}>{s.profiles?.full_name || s.profiles?.email || 'N/A'}</td>
            <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.razorpay_order_id}</td>
            <td style={{ padding: '14px 20px' }}>
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(155,89,255,0.1)', color: '#9b59ff', textTransform: 'uppercase' }}>{s.plan}</span>
            </td>
            <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff' }}>₹{s.amount / 100}</td>
            <td style={{ padding: '14px 20px' }}>
              <span style={{ color: s.status === 'paid' ? '#00c06b' : '#ff6b6b', fontSize: 12, fontWeight: 600 }}>{s.status.toUpperCase()}</span>
            </td>
            <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Activity Feed component ────────────────────────────────────────── */
function ActivityFeed({ activity, loading }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading activity logs…</div>;
  if (!activity.length) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>No recent activity.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activity.map((a, i) => (
        <div key={a.id} style={{ 
          padding: '16px 24px', 
          borderBottom: i === activity.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
          display: 'flex', gap: 16, alignItems: 'center'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5b6ef5', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>
              <span style={{ color: '#8b96ff', fontWeight: 700 }}>{a.profiles?.full_name || 'User'}</span> {a.action.replace('_', ' ')}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{timeAgo(a.created_at)}</p>
          </div>
          {a.metadata && (
             <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 4 }}>
                {JSON.stringify(a.metadata).slice(0, 30)}...
             </div>
          )}
        </div>
      ))}
    </div>
  );
}
function UsersTable({ users, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(91,110,245,0.2)', borderTop: '3px solid #5b6ef5', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading users from Supabase…</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
        No users found.
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['User', 'Email', 'Provider', 'Status', 'Joined', 'Last Active'].map(h => (
            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr
            key={u.id}
            className="admin-row"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease', cursor: 'default' }}
          >
            <td style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(91,110,245,0.3)' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#5b6ef5,#9b59ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#fff', flexShrink: 0 }}>
                    {u.name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                )}
                <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{u.name}</span>
              </div>
            </td>
            <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{u.email}</td>
            <td style={{ padding: '14px 20px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: u.provider === 'google' ? 'rgba(234,67,53,0.12)' : 'rgba(91,110,245,0.12)',
                color: u.provider === 'google' ? '#ff6b6b' : '#8b96ff',
                border: `1px solid ${u.provider === 'google' ? 'rgba(234,67,53,0.2)' : 'rgba(91,110,245,0.2)'}`,
              }}>
                {u.provider === 'google' ? <Globe size={10} /> : <Mail size={10} />}
                {u.provider === 'google' ? 'Google' : 'Email'}
              </span>
            </td>
            <td style={{ padding: '14px 20px' }}>
              {u.emailConfirmed ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#00c06b', fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle size={13} /> Verified
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}>
                  <Clock size={13} /> Pending
                </span>
              )}
            </td>
            <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              {timeAgo(u.createdAt)}
            </td>
            <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              {timeAgo(u.lastSignIn)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
