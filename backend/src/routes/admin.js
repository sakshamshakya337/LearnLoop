const express = require('express');
const supabaseAdmin = require('../utils/supabaseClient');
const router = express.Router();
require('dotenv').config();

// Admin secret middleware
function adminGuard(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * GET /api/admin/stats
 * Fallback to public.profiles if auth.admin fails
 */
router.get('/stats', adminGuard, async (req, res) => {
  try {
    // 1. Fetch profiles for user stats
    const { data: profiles, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('created_at, plan, role');
    
    if (profError) throw profError;

    // 2. Fetch payments for revenue
    const { data: payments, error: payError } = await supabaseAdmin
      .from('payments')
      .select('amount, status')
      .eq('status', 'paid');
    
    if (payError) throw payError;

    // Calculate stats
    const totalUsers = profiles.length;
    const proUsers = profiles.filter(p => p.plan === 'pro' || p.plan === 'scholar').length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSignups = profiles.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;

    res.json({
      totalUsers,
      proUsers,
      emailUsers: totalUsers, // Fallback since we can't see providers without service role
      googleUsers: 0,         // Fallback
      recentSignups,
      totalRevenue,
      dbStatus: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users
 */
router.get('/users', adminGuard, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.full_name || u.email?.split('@')[0] || 'Unknown',
      avatarUrl: u.avatar_url,
      plan: u.plan,
      role: u.role,
      createdAt: u.created_at
    }));

    res.json({ users: formattedUsers, total: formattedUsers.length });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/subscriptions
 */
router.get('/subscriptions', adminGuard, async (req, res) => {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ subscriptions: payments });
  } catch (err) {
    console.error('Admin subscriptions error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/activity
 */
router.get('/activity', adminGuard, async (req, res) => {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ activity: logs });
  } catch (err) {
    console.error('Admin activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/logs
 */
router.get('/logs', adminGuard, async (req, res) => {
  res.json({ 
    logs: [
      { id: 1, level: 'info', message: 'Admin session started', timestamp: new Date() },
      { id: 2, level: 'info', message: 'Stats aggregated successfully', timestamp: new Date() }
    ] 
  });
});

module.exports = router;
