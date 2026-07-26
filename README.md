# 🌐 FinWise AI

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185.1-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.42.2-FF0050?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**The ultimate AI-powered personal finance platform featuring a real-time conversational financial mentor, advanced vision-based scam detection, dynamic goal tracking, and an immersive dashboard.**

[How It Works](#-how-it-works) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started)

</div>

---

## 📌 Project Overview

FinWise AI is a comprehensive, full-stack monorepo application built around three core pillars: **AI-driven financial mentorship**, **proactive fraud prevention**, and **dynamic goal tracking**. 

The platform utilizes a modern architecture with a highly responsive **Next.js 16** frontend and a robust **FastAPI** Python backend. By integrating state-of-the-art LLMs (Groq Llama 3.1 & 3.3) and multimodal AI (Gemini 1.5 Flash), FinWise AI delivers deeply personalized financial context and sophisticated threat analysis in real-time.

---

## 🧠 How It Works

### AI Financial Mentor Pipeline

```
User Input → Next.js Client → FastAPI Endpoint
        │
        ▼
 Phase 1   CONTEXT GATHERING
           Backend retrieves user's real-time financial goals, 
           portfolio status, and risk profile.
        │
        ▼
 Phase 2   PROMPT ASSEMBLY
           System prompt is injected with live context to ground 
           the LLM in the user's mathematical reality.
        │
        ▼
 Phase 3   GROQ INFERENCE
           Llama 3.1 processes the contextualized prompt with 
           sub-second latency via Groq's LPU inference engine.
        │
        ▼
 Phase 4   STREAMING RESPONSE
           Pragmatic, mathematically sound financial advice is 
           streamed back to the frontend dashboard.
```

### Scam & Fraud Detector (Vision + NLP)

```
Image/Screenshot Upload → FastAPI Backend
        │
        ▼
 Phase 1   OCR & VISION ANALYSIS (Gemini 1.5 Flash)
           Image is processed to extract text, identify suspicious URLs, 
           and detect visual anomalies (e.g., spoofed logos).
        │
        ▼
 Phase 2   TEXTUAL THREAT ANALYSIS (Groq Llama 3.3)
           Extracted text is analyzed for urgency triggers, phishing 
           patterns, and known scam typologies.
        │
        ▼
 Phase 3   SCORING & RED FLAGS
           A unified probability score (0-100%) is calculated.
           Specific red flags are isolated and explained.
```

---

## ✨ Features

**AI Financial Mentor** — A conversational interface powered by Groq (Llama 3.1) that dynamically hooks into your real-time financial goals to offer deeply personalized, mathematically sound advice.

**Scam & Fraud Detector** — Upload suspicious text messages or screenshots. Powered by Gemini 1.5 Flash (vision) and Groq (text analysis), it extracts red flags, assigns a probability score, and provides actionable educational insights.

**Interactive Financial Dashboard** — A beautiful, real-time overview of your financial health score, learning modules, and market data integrated with `lightweight-charts` and `recharts`.

**Immersive 3D Visualizations** — Utilizing React Three Fiber and Three.js to render data points and financial concepts dynamically on the client side.

**Dynamic Goal Tracking** — Create, manage, and track active financial milestones (e.g., Emergency Funds, Debt Payoff, Investments) with persistent global state via Zustand.

**Seamless Authentication** — Secure backend routes protected and integrated seamlessly with Firebase Authentication.

**Monorepo Architecture** — Efficiently organized using npm workspaces, separating the Next.js frontend (`apps/web`) and the FastAPI backend (`apps/backend`) while sharing project configurations.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|:-------:|
| **Frontend Framework** | Next.js (App Router) | 16.2.10 |
| **Backend Framework** | FastAPI (Python) | Latest |
| **UI Library** | React | 19.2.4 |
| **State Management**| Zustand | 5.0.14 |
| **Styling** | Tailwind CSS | 4.3.3 |
| **3D Rendering** | Three.js + R3F | 0.185.1 |
| **Animations** | Framer Motion | 12.42.2 |
| **Language Models** | Groq (Llama 3.1/3.3), Google GenAI | APIs |
| **Charts** | Lightweight Charts, Recharts | Latest |
| **Authentication** | Firebase Admin | 12.16.0 |

---

## 📁 Project Structure

```text
finwise-ai/
├── apps/
│   ├── backend/               # FastAPI Python Backend
│   │   ├── main.py            # Entry point & API routes
│   │   ├── firebase_config.py # Firebase admin setup
│   │   ├── auth_utils.py      # Authentication middleware
│   │   └── requirements.txt   # Python dependencies
│   │
│   └── web/                   # Next.js 16 Frontend
│       ├── src/app/           # App Router pages (Dashboard, Cookies, etc.)
│       ├── src/components/    # Reusable UI components (Auth, Layout)
│       ├── tailwind.config.ts # Tailwind CSS configuration
│       └── package.json       # Frontend dependencies
│
├── package.json               # Root monorepo workspace config
└── pnpm-workspace.yaml        # Workspace definitions
```

---

## ⚡ Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| **Streaming LLM Responses** | Groq's high-speed LPU ensures near-zero latency for chat |
| **Edge-Optimized AI** | Offloading vision tasks to Gemini Flash for rapid OCR processing |
| **State Persistence** | Zustand intelligently syncs with localStorage for instant dashboard loads |
| **Component Lazy Loading** | `next/dynamic` used for heavy Three.js canvas & chart components |
| **Strict Payload Validation** | Pydantic ensures zero malformed data reaches the client |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.10+
- API Keys for Groq and Google Gemini

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd apps/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env.local` file in the `apps/backend` directory:
```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

Run the backend server:
```bash
python -m uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup (Next.js)

Open a new terminal and navigate to the monorepo root (or frontend directory):

```bash
# Install all workspace dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔒 Security Notes

- **Environment Variables**: API keys are securely ignored from version control.
- **Payload Sanitization**: AI payloads are sanitized to ensure consistent JSON formatting and clean UI rendering.
- **Robust Validation**: Pydantic models on the backend guarantee strict schema adherence before data is processed or returned.
- **Firebase Auth**: Secure endpoint access control via token validation.

---

## 👥 Team

- **Parteek Garg** ([GitHub](https://github.com/parteek1907))
- **Nipun Dhiman** ([GitHub](https://github.com/nipunn-git))
- **Darsh Ohri** ([GitHub](https://github.com/darshohri))
- **Aditya Tanwar** ([GitHub](https://github.com/adityaa6060))
