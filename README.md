# 🌾 AgriAid.AI

> AI-Powered Smart Agriculture Platform for Indian Farmers

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter%20%7C%20Groq%20%7C%20Gemini-orange)](https://openrouter.ai)

---

## 🚀 Features

- **AI Crop Disease Analysis** — Upload leaf image → Get instant diagnosis + treatment
- **Farming Chatbot** — Ask anything about crops, soil, fertilizers in simple English
- **Impact Simulator** — Compare Organic vs Chemical farming ROI
- **Future Growth Simulator** — 90-day yield & profit projection
- **Disease Spread Radar** — Cellular automata-based outbreak prediction
- **Weather Intelligence** — Live weather + AI farming advisory
- **Crop Calendar, Fertilizer Calculator, Market Prices, Soil Health**

---

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)
    ↓
Backend (Node.js + Express)
    ↓
┌─────────────────────────────────┐
│  AI Gateway (Auto-fallback)     │
│  Groq → OpenRouter → Gemini     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Supabase                       │
│  PostgreSQL + Storage + Auth    │
└─────────────────────────────────┘
    ↓
OpenWeather API (Live Weather)
```

---

## ⚙️ Setup

### 1. Clone
```bash
git clone https://github.com/your-username/agriaid-ai.git
cd agriaid-ai
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Fill in your Supabase keys in .env
npm install
npm run dev
```

### 4. Supabase Setup
- Create a project at [supabase.com](https://supabase.com)
- Run `backend/database/schema.sql` in the SQL Editor
- Create storage buckets: `crop-images` (public), `reports` (private)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Get it from |
|---|---|---|
| `GROQ_API_KEY` | Direct Groq API (fastest) | [console.groq.com](https://console.groq.com) |
| `OPENROUTER_API_KEY` | OpenRouter gateway | [openrouter.ai](https://openrouter.ai) |
| `GEMINI_API_KEY` | Google Gemini | [aistudio.google.com](https://aistudio.google.com) |
| `OPENWEATHER_API_KEY` | Live weather data | [openweathermap.org](https://openweathermap.org) |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard |

> **Note:** Only ONE AI key is required. Priority: `GROQ → OPENROUTER → GEMINI`

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `VITE_SUPABASE_URL` | Same as backend SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | Same as backend SUPABASE_ANON_KEY |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| AI | Groq Llama 3.3 70B / Gemini 2.0 Flash (via OpenRouter) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Weather | OpenWeather API |
| Charts | Recharts |
| UI Components | MUI, Lucide React |

---

## 📁 Project Structure

```
agriaid-ai/
├── backend/
│   ├── controllers/        # Route handlers
│   ├── database/           # Supabase client + schema
│   ├── routes/             # API routes
│   ├── services/           # AI engine, weather, OpenRouter
│   ├── utils/              # Logger
│   └── server.js
├── frontend/
│   └── src/
│       ├── Context/        # Auth, Theme, Language, GlobalState
│       ├── FarmerModule/   # All farmer pages + tools
│       ├── services/       # API, AI, Weather, Supabase services
│       └── SharedComponents/
└── database/
    └── schema.sql
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
