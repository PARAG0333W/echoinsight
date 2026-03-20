# EchoInsight AI 🎙️

> **Intelligent Call Center Communication Evaluator** — Automatically analyze customer service conversations, evaluate agent performance, and generate AI-powered coaching insights.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev/)
[![Whisper](https://img.shields.io/badge/STT-OpenAI%20Whisper-412991?logo=openai)](https://github.com/openai/whisper)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Usage Guide](#-usage-guide)
- [AI Analysis Pipeline](#-ai-analysis-pipeline)
- [Scoring System](#-scoring-system)
- [Contributing](#-contributing)

---

## 🌟 Overview

**EchoInsight AI** is a full-stack SaaS platform built for call centers to automatically evaluate agent-customer conversations. Upload an audio recording or a plain-text transcript, and EchoInsight will:

1. **Transcribe** the audio using a locally-running OpenAI Whisper model
2. **Parse** the conversation into structured speaker turns
3. **Analyze** the interaction using Google Gemini 2.0 Flash (structured JSON output)
4. **Score** the agent across multiple dimensions (clarity, empathy, professionalism, resolution, tone)
5. **Surface** mistakes, improved response suggestions, suggested phrases, and risk flags
6. **Display** everything in a rich, real-time React dashboard

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙️ **Audio Transcription** | Upload MP3/WAV/M4A files; Whisper converts speech to text locally with no external API calls. |
| 📄 **Text Transcript Support** | Upload plain `.txt` conversation files for instant analysis without transcription. |
| 🤖 **AI-Powered Analysis** | Google Gemini 2.0 Flash performs multi-dimensional evaluation and returns structured JSON. |
| 📊 **Multi-Metric Scoring** | Five independent score categories combined into an overall quality score (0–100). |
| 🚨 **Risk Detection** | Automatically flags high-risk conversations (escalations, policy violations) for supervisor review. |
| 💬 **Coaching Suggestions** | Returns concrete improved response alternatives and suggested phrases for each mistake. |
| 📜 **Conversation History** | Full history of all uploaded and analyzed conversations with status tracking. |
| 📈 **Analytics Dashboard** | Aggregate metrics, trends, score distributions, and high-risk conversation counts. |
| 📑 **Report Generation** | Download or view structured analysis reports per conversation. |
| 🔐 **Authentication** | Supabase-powered JWT authentication (login, signup, forgot password). |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11+ | Core language |
| **FastAPI** | Latest | REST API framework with async support |
| **Pydantic v2** | Latest | Settings management and data validation |
| **Google Gemini** | `gemini-2.0-flash` | LLM for AI analysis (structured JSON output) |
| **OpenAI Whisper** | `base` model | Local speech-to-text transcription |
| **Supabase** | Python SDK v2 | Database (PostgreSQL) + file storage |
| **imageio-ffmpeg** | Latest | Bundled FFmpeg for audio processing |
| **Uvicorn** | Latest | ASGI server |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | ~5.9 | Type safety |
| **Vite** | 8 | Build tool & dev server |
| **TailwindCSS** | 4 | Utility-first styling |
| **Zustand** | 5 | Global state management |
| **Axios** | 1.x | HTTP client |
| **React Router** | 7 | Client-side routing |
| **React Hook Form + Zod** | Latest | Form validation |
| **Chart.js + React-Chartjs-2** | 4.x | Data visualization |
| **Framer Motion** | 12 | Animations & transitions |
| **Lucide React** | Latest | Icon library |
| **Supabase JS** | 2 | Auth integration |

---

## 📁 Project Structure

```
Hackathon/
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, router registration, CORS
│   ├── .env                        # Backend environment variables (not committed)
│   ├── app/
│   │   ├── config.py               # Pydantic Settings (loads .env)
│   │   ├── database.py             # Supabase client factory
│   │   ├── dependencies.py         # Shared FastAPI dependencies (auth, etc.)
│   │   ├── models/                 # Pydantic request/response models
│   │   ├── prompts/
│   │   │   └── analysis.py         # Gemini prompt template
│   │   ├── routers/
│   │   │   ├── upload.py           # POST /api/v1/upload
│   │   │   ├── conversations.py    # GET/POST /api/v1/conversations
│   │   │   ├── analysis.py         # POST /api/v1/conversations/{id}/analyze
│   │   │   ├── analytics.py        # GET /api/v1/analytics/*
│   │   │   └── reports.py          # GET /api/v1/reports/*
│   │   ├── services/
│   │   │   ├── pipeline.py         # Orchestrates the upload → transcribe → analyze flow
│   │   │   ├── upload_service.py   # File storage (Supabase Storage)
│   │   │   ├── transcription_service.py  # Whisper STT (local)
│   │   │   ├── text_extraction_service.py # Parse .txt / detect speaker turns
│   │   │   ├── conversation_parser.py     # Convert raw transcript to turn objects
│   │   │   ├── ai_analysis_service.py     # Gemini AI analysis + DB persistence
│   │   │   └── report_service.py          # Report generation
│   │   └── utils/
│   │       ├── logger.py           # Structured logging
│   │       └── helpers.py          # UUID generation, time utilities
│   ├── migrations/                 # Database migration scripts
│   └── logs/                       # Application logs
│
├── frontend/                       # React frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   ├── .env                        # Frontend environment variables (not committed)
│   └── src/
│       ├── App.tsx                 # Root component
│       ├── main.tsx                # Entry point
│       ├── router/                 # React Router configuration
│       ├── layouts/                # Shared layout wrappers (Dashboard layout, etc.)
│       ├── pages/
│       │   ├── LandingPage.tsx     # Public marketing / landing page
│       │   ├── Login.tsx           # Authentication - login
│       │   ├── Signup.tsx          # Authentication - registration
│       │   ├── ForgotPassword.tsx  # Password reset flow
│       │   ├── DashboardPage.tsx   # Main analytics dashboard
│       │   ├── UploadPage.tsx      # File upload + agent name input
│       │   ├── ConversationPage.tsx# Single conversation view + analysis results
│       │   ├── HistoryPage.tsx     # All conversations history list
│       │   └── AdminPage.tsx       # Admin panel
│       ├── components/
│       │   ├── auth/               # Auth form components
│       │   ├── transcript/         # Transcript viewer, suggestions panel, score cards
│       │   └── ui/                 # Shared UI primitives (buttons, badges, etc.)
│       ├── store/
│       │   └── useAuthStore.ts     # Zustand store (auth + analysis state)
│       ├── services/               # Axios API service functions
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # Library configuration (Supabase client)
│       └── utils/                  # Utility helper functions
│
└── database/
    └── schema.sql                  # Full PostgreSQL/Supabase schema
```

---

## 🏗️ Architecture

```
[ User Browser ]
      │
      │  HTTP / REST
      ▼
[ React Frontend (Vite + TS) ]
      │  Zustand store manages auth & analysis state
      │
      │  Axios → /api/v1/*
      ▼
[ FastAPI Backend ]
      │
      ├──► Upload Router ──► UploadService ──► Supabase Storage
      │
      ├──► Analysis Router ──► Pipeline Service
      │                              │
      │                    ┌─────────▼──────────┐
      │                    │  TranscriptionSvc   │ ← OpenAI Whisper (local)
      │                    │  TextExtractionSvc  │ ← Plain text parsing
      │                    │  ConversationParser │ ← Speaker turn detection
      │                    │  AIAnalysisService  │ ← Google Gemini 2.0 Flash
      │                    └─────────┬──────────┘
      │                              │
      │                    ┌─────────▼──────────┐
      │                    │   Supabase (PG)     │
      │                    │  conversations      │
      │                    │  analysis_results   │
      │                    │  scores             │
      │                    │  mistakes           │
      │                    │  risks              │
      │                    └─────────────────────┘
      │
      └──► Analytics / Reports Routers ──► Aggregation queries on Supabase
```

---

## 📡 API Reference

All API endpoints are prefixed with `/api/v1`.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | App info and status |
| `GET` | `/health` | Simple health check |

### Upload

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/upload` | Upload audio (MP3/WAV/M4A) or text file. Returns `conversation_id`. |

**Request:** `multipart/form-data`
- `file` — The audio or text file
- `agent_name` — Name of the agent being evaluated

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "status": "pending"
  }
}
```

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/conversations` | List all conversations |
| `GET` | `/api/v1/conversations/{id}` | Get a single conversation with turns |
| `DELETE` | `/api/v1/conversations/{id}` | Delete a conversation |

### Analysis

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/conversations/{id}/analyze` | Trigger AI analysis for a conversation |
| `GET` | `/api/v1/conversations/{id}/analysis` | Get existing analysis result |

**Analysis Response:**
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "overall_score": 78.4,
  "communication_score": 82,
  "tone_score": 75,
  "empathy_score": 80,
  "professionalism_score": 77,
  "solution_score": 78,
  "sentiment": "positive",
  "risk_level": "low",
  "mistakes": [
    { "turn_index": 3, "mistake": "Did not acknowledge the customer's frustration." }
  ],
  "improved_responses": [
    { "original": "I don't know.", "improved": "Let me look that up for you right away." }
  ],
  "suggested_phrases": ["I completely understand", "Let me help you resolve this"],
  "processing_time_ms": 2340,
  "analyzed_at": "2026-03-20T09:00:00Z"
}
```

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/overview` | Aggregate stats (total conversations, avg score, high-risk count) |
| `GET` | `/api/v1/analytics/scores` | Score distributions by category |
| `GET` | `/api/v1/analytics/trends` | Score trends over time |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/reports/{conversation_id}` | Get full analysis report for a conversation |

---

## 🗄️ Database Schema

The Supabase (PostgreSQL) database uses the following main tables:

| Table | Description |
|---|---|
| `conversations` | Core conversation record with status, agent name, file URL |
| `conversation_turns` | Individual speaker turns (agent / customer) |
| `analysis_results` | AI analysis output — overall score, sentiment, raw LLM response |
| `scores` | Per-category scores (clarity, empathy, professionalism, resolution, greeting) |
| `mistakes` | Identified agent mistakes per conversation |
| `risks` | Risk flags (escalation, policy) per conversation |

The full schema is located at [`database/schema.sql`](database/schema.sql).

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and **npm**
- **FFmpeg** — required for Whisper audio processing. The project uses `imageio-ffmpeg` to bundle FFmpeg, so a system install is not strictly required, but recommended.
- A **Supabase** project with the schema applied
- A **Google Gemini API key** (free tier available at [ai.google.dev](https://ai.google.dev))

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure environment variables
cp .env.example .env
# Edit .env with your Supabase + Gemini credentials

# 5. Apply the database schema to your Supabase project
#    Go to your Supabase dashboard → SQL Editor → paste contents of database/schema.sql

# 6. Start the development server
python main.py
# Or with auto-reload:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at **http://localhost:8000**  
Interactive API docs (Swagger UI): **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key, and backend API URL

# 4. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# App
APP_NAME=EchoInsight AI
APP_ENV=development
APP_PORT=8000
DEBUG=True

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-ref.supabase.co:5432/postgres

# Storage
STORAGE_BUCKET=conversation-files

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# Whisper (tiny | base | small | medium | large)
WHISPER_MODEL_SIZE=base

# Auth
JWT_SECRET=change-me-in-production
JWT_EXPIRY_MINUTES=60

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📖 Usage Guide

### 1. Login / Register
Navigate to the app and sign up or log in with your credentials. Authentication is handled by Supabase Auth.

### 2. Upload a Conversation
- Go to the **Upload** page.
- Enter the **agent's name**.
- Upload either an **audio file** (MP3, WAV, M4A) or a **text transcript** (.txt).
- Submit — the file is stored in Supabase Storage and a conversation record is created.

### 3. Trigger Analysis
- After upload, the system automatically queues analysis.
- You can also manually trigger analysis from the **Conversation** detail page.
- AI analysis typically takes **5–30 seconds** depending on conversation length.

### 4. Review Results
On the **Conversation** page you will see:
- **Score Cards** — Overall, clarity, empathy, professionalism, resolution, tone scores (0–100)
- **Sentiment** — positive / neutral / negative
- **Risk Level** — low / medium / high / critical
- **Mistakes Panel** — List of identified mistakes with context
- **Suggestions Panel** — Improved response alternatives for each mistake
- **Suggested Phrases** — Recommended language for common situations

### 5. Dashboard & History
- **Dashboard** — Aggregate analytics across all conversations: total count, average score, high-risk count, analyzed percentage, score trends
- **History** — Full paginated list of all uploaded conversations with status badges

---

## 🤖 AI Analysis Pipeline

```
                    ┌──────────────────────┐
                    │   File Upload (API)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────▼─────────────────┐
              │          PipelineService          │
              └────────────────┬─────────────────┘
                               │
         ┌─────────────────────▼──────────────────┐
         │  Audio?            │   Text (.txt)?     │
         │  TranscriptionSvc  │  TextExtractionSvc │
         │  (Whisper local)   │  (direct parse)    │
         └────────┬───────────┴──────┬─────────────┘
                  └─────────┬────────┘
                            │
                 ┌──────────▼──────────┐
                 │  ConversationParser │
                 │  (turn detection,   │
                 │   speaker labeling) │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │  AIAnalysisService  │
                 │  Prompt → Gemini    │
                 │  Structured JSON ←  │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │  Store in Supabase  │
                 │  analysis_results   │
                 │  scores / mistakes  │
                 │  risks              │
                 └─────────────────────┘
```

The Gemini prompt is designed to return a **strict JSON object** with the following fields:
- `communication_score`, `tone_score`, `empathy_score`, `professionalism_score`, `solution_score` (integers 0–100)
- `sentiment` — `"positive"` | `"neutral"` | `"negative"`
- `risk_level` — `"low"` | `"medium"` | `"high"` | `"critical"`
- `mistakes` — array of `{ turn_index, mistake }`
- `improved_responses` — array of `{ original, improved }`
- `suggested_phrases` — array of strings

---

## 📊 Scoring System

| Category | Description |
|---|---|
| **Clarity** (communication_score) | How clearly and effectively the agent communicated |
| **Tone** (tone_score) | Appropriateness of tone throughout the conversation |
| **Empathy** (empathy_score) | Degree to which the agent acknowledged and validated the customer |
| **Professionalism** (professionalism_score) | Adherence to professional language and conduct |
| **Resolution** (solution_score) | Effectiveness in resolving the customer's issue |

The **Overall Score** is computed as the arithmetic mean of all five category scores.

```
Overall = (clarity + tone + empathy + professionalism + resolution) / 5
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style and make sure the backend server starts without errors before submitting.

---

## 📄 License

This project was built as part of a Hackathon. All rights reserved.

---

<div align="center">
  <p>Built with ❤️ by the EchoInsight Team</p>
</div>
