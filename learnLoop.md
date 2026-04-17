# ⚡ LearnLoop — Your AI-Powered Learning Platform

> Transform any document, video, or audio into smart notes, flashcards, quizzes, and podcasts — powered by AI.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Pricing Plans](#pricing-plans)
- [Free AI Tools & APIs](#free-ai-tools--apis)
- [Project Structure](#project-structure)
- [Admin Panel](#admin-panel)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## 🚀 Project Overview

**LearnLoop** is a full-stack AI learning platform that allows users to:
- Upload documents (PDF, DOC, PPT), paste YouTube links, or record audio
- Automatically generate smart notes, diagrams, flashcards, quizzes, and podcasts
- Study with spaced repetition, leaderboards, and progress tracking
- Collaborate via shared modules and classrooms

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Primary DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + Firebase Auth |
| **File Storage** | Supabase Storage + Firebase Storage |
| **Payments** | Razorpay |
| **AI Processing** | OpenAI (GPT-4o-mini), Google Gemini 1.5 Flash, Groq (free tier) |
| **Diagrams** | Mermaid.js (free), Kroki.io (free) |
| **Deployment** | Vercel (frontend), Railway / Render (backend) |

---

## ✨ Features

### 🎯 Core User Features

#### 📄 Content Ingestion
- **Document Upload** — PDF, DOC, DOCX, PPT, PPTX (up to plan limit)
- **YouTube/Web Video** — Paste any YouTube URL, extract transcript + generate notes
- **Audio Upload/Record** — Upload MP3/WAV or record in-browser; transcribed via Whisper
- **Syllabus Upload** — Upload your course syllabus; AI generates a full study module plan
- **Manual Text Entry** — Paste or type content directly

#### 📝 Notes Generation
- AI-generated structured notes with headings, bullet points, and key highlights
- Auto-generated **mind maps** and **concept diagrams** (Mermaid.js)
- **Flowcharts** for process-based content
- Editable notes with rich text editor (TipTap)
- Export as PDF, DOCX, or Markdown

#### 🃏 Flashcards
- Auto-generated Q&A flashcards from uploaded content
- Spaced repetition algorithm (SM-2)
- Custom deck creation and manual card addition
- Flip animation, confidence rating per card
- Export as Anki-compatible `.apkg`

#### 🧪 Quizzes
- Multiple choice, true/false, fill-in-the-blank
- Timed quiz mode
- Instant explanations per question
- Performance analytics per topic
- Quiz history and score tracking

#### 🎙 Podcast / Audio Summaries
- AI converts notes into a conversational podcast script
- Text-to-speech via browser API (free) or ElevenLabs (premium)
- Download as MP3

#### 💬 AI Chat
- Chat with your document — ask questions, get explanations
- Context-aware: understands your entire uploaded module
- Conversation history per document

#### 📊 Progress & Gamification
- Daily streak tracking
- XP points for completing study sessions, quizzes, flashcards
- **Leaderboard** — weekly and all-time rankings
- Badge system (e.g., "7-Day Streak", "Quiz Master")
- Study time analytics dashboard

---

### 🔐 Auth & Accounts
- Email/password signup and login (Supabase Auth)
- Google OAuth (Firebase)
- Email verification
- Forgot password flow
- Profile page with stats, avatar upload

---

## 💰 Pricing Plans

### 🆓 Free Plan — ₹0/month
**Trial period: Full access for 24 hours from signup**

After 24 hours, limited to:
- 3 document uploads/month
- 1 YouTube video/month
- Max file size: 5 MB
- Notes generation: 3/month
- Flashcards: Up to 20 cards/document
- Quizzes: 5 quizzes/month
- AI Chat: 10 messages/month
- No audio podcast generation
- Watermarked PDF exports
- No priority support

---

### 💎 Scholar Plan — ₹299/month *(₹2,499/year)*
**Best for individual students**

- **Unlimited** document uploads (up to 25 MB each)
- **Unlimited** YouTube & web video processing
- **Unlimited** notes, flashcards, quizzes
- AI Chat: **500 messages/month**
- Audio podcast generation: **10/month**
- Diagram & mind map generation
- PPT export of notes
- No watermarks
- Priority email support
- All content stored for **1 year**

---

### 🚀 Pro Plan — ₹599/month *(₹4,999/year)*
**Best for power learners and educators**

- Everything in Scholar +
- **Unlimited** AI Chat messages
- **Unlimited** podcast generation
- Upload file size up to **100 MB**
- **Classroom feature** — create groups, share modules with students
- Bulk syllabus processing (up to 5 syllabi at once)
- API access (for custom integrations)
- Advanced analytics dashboard
- Anki export
- Priority chat support (24-hour response)
- All content stored for **lifetime**

---

### 🏫 Institution Plan — Custom pricing
Contact sales for team/university licensing.

---

## 🤖 Free AI Tools & APIs

> These tools are recommended to minimize API costs, especially at launch.

| Feature | Recommended Free Tool | Notes |
|---|---|---|
| Text summarization / Notes | **Google Gemini 1.5 Flash** | 1M token free tier/month |
| Notes from long docs | **Groq (LLaMA 3.1 70B)** | Very fast, generous free tier |
| Flashcard & quiz generation | **Gemini 1.5 Flash** or **Groq** | JSON mode supported |
| OCR (image PDFs) | **Tesseract.js** | 100% free, browser-side |
| Audio transcription | **Whisper (via Groq)** | Free Whisper API on Groq |
| YouTube transcript | **youtube-transcript npm package** | No API key needed |
| Diagram generation | **Mermaid.js** | 100% free, renders in browser |
| Mind maps | **Markmap.js** | Free, Markdown-based |
| PPT generation | **PptxGenJS** | Free npm library |
| TTS (podcast audio) | **Web Speech API** | Free, browser-native |
| TTS (higher quality) | **ElevenLabs free tier** | 10,000 chars/month free |
| Embeddings / AI Chat | **Gemini Embedding API** | Free tier available |

**Cost-saving strategy:**
1. Use **Groq** (free) for fast text generation (notes, flashcards, quizzes)
2. Use **Gemini Flash** (free tier) for long-context document processing
3. Fall back to **OpenAI GPT-4o-mini** only if needed (cheapest paid option)
4. Use **Mermaid.js + Markmap** for all diagrams (100% free, client-side)
5. Use **PptxGenJS** to generate downloadable PPTs from notes (free)

---

## 📁 Project Structure

```
LearnLoop/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── dashboard/
│   │   │   ├── notes/
│   │   │   ├── flashcards/
│   │   │   ├── quizzes/
│   │   │   ├── podcast/
│   │   │   ├── chat/
│   │   │   ├── admin/
│   │   │   └── pricing/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ContentModule.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── Profile.jsx
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   ├── firebase.js
│   │   │   └── razorpay.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── uploadService.js
│   │   │   └── paymentService.js
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── backend/                   # Express + Node.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── content.js
│   │   │   ├── notes.js
│   │   │   ├── flashcards.js
│   │   │   ├── quizzes.js
│   │   │   ├── payments.js
│   │   │   ├── admin.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── planGuard.js
│   │   │   └── logger.js
│   │   ├── services/
│   │   │   ├── groqService.js
│   │   │   ├── geminiService.js
│   │   │   ├── whisperService.js
│   │   │   ├── pptService.js
│   │   │   └── diagramService.js
│   │   ├── utils/
│   │   └── app.js
│   ├── logs/                  # Activity logs (saved to Supabase too)
│   └── server.js
│
└── README.md
```

---

## 🛡 Admin Panel

The Admin Panel is accessible at `/admin` (requires `role = 'admin'` in Supabase).

### Features

#### 👥 User Management
- View all registered users (paginated table)
- Search by email, name, plan
- View individual user: signup date, usage stats, last active
- **Manually upgrade/downgrade user plan** (without payment)
- Suspend or ban users
- Impersonate user (view their dashboard as them)

#### 📊 Analytics Dashboard
- Total users (by plan tier)
- Daily/weekly/monthly signups chart
- Revenue chart (from Razorpay webhooks)
- Most used features (notes vs flashcards vs quizzes)
- Top uploaded content types
- Conversion rate: Free → Scholar → Pro

#### 📜 Activity Logs
- All user actions logged: login, upload, generate, export, payment
- Filterable by: user, action type, date range, plan
- Exportable as CSV
- Error logs: failed AI generations, failed payments

#### 💳 Subscription Management
- View all active subscriptions
- Filter by plan (Free / Scholar / Pro)
- Cancel subscriptions manually
- Issue refunds (via Razorpay API)
- View upcoming renewals

#### 📣 Announcements
- Send email to all users or by plan tier
- Push in-app notification banners

---

## 🗄 Database Schema (Supabase / PostgreSQL)

```sql
-- Users (extended from Supabase Auth)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
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
)

-- Content Modules
modules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  title TEXT,
  source_type TEXT, -- 'document' | 'youtube' | 'audio' | 'text'
  source_url TEXT,
  file_path TEXT,
  status TEXT, -- 'processing' | 'ready' | 'error'
  created_at TIMESTAMPTZ
)

-- Generated Notes
notes (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules,
  content JSONB,  -- structured notes
  diagram_code TEXT, -- mermaid/markmap syntax
  created_at TIMESTAMPTZ
)

-- Flashcards
flashcards (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules,
  question TEXT,
  answer TEXT,
  next_review TIMESTAMPTZ,
  interval INTEGER DEFAULT 1,
  ease FLOAT DEFAULT 2.5
)

-- Quiz Questions
quiz_questions (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules,
  question TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT
)

-- Quiz Attempts
quiz_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  module_id UUID REFERENCES modules,
  score INTEGER,
  total INTEGER,
  completed_at TIMESTAMPTZ
)

-- Activity Logs
activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  action TEXT,  -- 'upload' | 'generate_notes' | 'start_quiz' etc.
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Payments
payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  plan TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'INR',
  status TEXT, -- 'pending' | 'paid' | 'failed' | 'refunded'
  created_at TIMESTAMPTZ
)
```

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Content
```
POST   /api/content/upload        # Upload document/audio
POST   /api/content/youtube       # Process YouTube URL
GET    /api/content/:moduleId     # Get module details
DELETE /api/content/:moduleId
```

### AI Generation
```
POST   /api/generate/notes/:moduleId
POST   /api/generate/flashcards/:moduleId
POST   /api/generate/quiz/:moduleId
POST   /api/generate/podcast/:moduleId
POST   /api/generate/diagram/:moduleId
```

### Flashcards
```
GET    /api/flashcards/:moduleId
PATCH  /api/flashcards/:cardId/review   # Update spaced repetition
```

### Quizzes
```
GET    /api/quizzes/:moduleId
POST   /api/quizzes/attempt
GET    /api/quizzes/history
```

### Payments
```
POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook        # Razorpay webhook
GET    /api/payments/subscription
```

### Admin (requires admin role)
```
GET    /api/admin/users             # All users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/plan    # Upgrade/downgrade plan
PATCH  /api/admin/users/:id/suspend
GET    /api/admin/logs              # Activity logs
GET    /api/admin/stats             # Analytics
GET    /api/admin/payments
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier)
- Groq API key (free)
- Razorpay account (test mode)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your env vars
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your env vars
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `backend/supabase/schema.sql`
3. Enable Row Level Security (RLS) policies
4. Configure Storage buckets: `documents`, `audio`, `exports`

---

## 🔑 Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_RAZORPAY_KEY_ID=
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`.env`)
```env
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
GROQ_API_KEY=
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
OPENAI_API_KEY=          # Optional fallback
ELEVENLABS_API_KEY=      # Optional for premium TTS
JWT_SECRET=
```

---

## 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (free tier) |
| Backend | Railway or Render (free tier available) |
| Database | Supabase (free tier: 500 MB, 2 GB bandwidth) |
| File Storage | Supabase Storage + Firebase Storage |
| Payments | Razorpay (no monthly fee, 2% per transaction) |

---

## 🗺 Roadmap

### v1.0 (MVP)
- [x] Auth (email + Google)
- [x] Document upload + notes generation
- [x] YouTube URL processing
- [x] Flashcards
- [x] Basic quizzes
- [x] Pricing + Razorpay payments
- [x] Admin panel (users, logs)

### v1.1
- [ ] AI Chat with documents
- [ ] Podcast/audio generation
- [ ] Diagram & mind map generation
- [ ] PPT export
- [ ] Leaderboard + gamification

### v1.2
- [ ] Classroom/group feature
- [ ] Syllabus upload → study plan
- [ ] Spaced repetition for flashcards
- [ ] Mobile app (React Native)

### v2.0
- [ ] Institution plan + bulk accounts
- [ ] LMS integrations (Moodle, Canvas)
- [ ] Collaboration on shared notes
- [ ] Browser extension

---

## 📄 License

MIT License. See `LICENSE` for details.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

*Built with ⚡ by the LearnLoop team*
