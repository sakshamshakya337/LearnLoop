const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Manual CORS — works on all hosts including Render free tier
app.use((req, res, next) => {
  const allowed = [
    'https://learn-loop-xi.vercel.app',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase admin client (service role – full access)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple admin secret middleware
function adminGuard(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Routes
const contentRoutes = require('./routes/content');
const modulesRoutes = require('./routes/modules');
const flashcardsRoutes = require('./routes/flashcards');
const quizzesRoutes = require('./routes/quizzes');

const adminRoutes = require('./routes/admin');

app.use('/api/content', contentRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/admin', adminRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the LearnLoop API! The server is running successfully.');
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LearnLoop API is running smoothly' });
});

module.exports = app;
