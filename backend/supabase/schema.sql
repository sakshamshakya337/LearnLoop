-- ==============================================================================
-- LearnLoop Supabase SQL Schema (FIREBASE AUTH NATIVE EDITION)
-- Run this entire script in the Supabase SQL Editor.
-- ==============================================================================

-- DROP existing tables and triggers cleanly so we can transition UUID to TEXT UIDs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table (Fully Decoupled for Firebase Auth UIDs)
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free', -- 'free' | 'scholar' | 'pro'
  plan_expires_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Content Modules Table
CREATE TABLE public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'document' | 'youtube' | 'audio' | 'text'
  source_url TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'processing', -- 'processing' | 'ready' | 'error'
  notes_json JSONB,
  raw_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- 4. Flashcards Table
CREATE TABLE public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  next_review TIMESTAMPTZ,
  interval INTEGER DEFAULT 1,
  ease FLOAT DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quiz Questions Table
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quiz Attempts Table
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Activity Logs Table
CREATE TABLE public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'upload' | 'generate_notes' | 'start_quiz' etc.
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments Table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Disable RLS temporarily during strict Backend/Server MVP testing.
-- ==============================================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
