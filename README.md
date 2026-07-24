# Finwise AI

Finwise AI is a personalized, AI-driven financial mentor and cybersecurity hub designed to help users manage their money, reach their financial goals, and stay safe from digital fraud.

## 🚀 Features

* **AI Financial Mentor**: A conversational AI powered by **Groq (Llama 3.1)** that provides mathematically sound, pragmatic financial advice. It dynamically hooks into your real-time financial goals to offer deeply personalized context.
* **Scam & Fraud Detector**: Upload suspicious text messages or screenshots of emails/websites. Powered by **Gemini 1.5 Flash** (for OCR/vision) and **Groq** (for text), it extracts red flags, assigns a probability score, and educates the user on how to spot the scam.
* **Dynamic Goal Tracking**: Create, manage, and track your active financial milestones (e.g., Emergency Funds, Debt Payoff, Investments).
* **Interactive Dashboard**: A beautiful, real-time overview of your financial health score, learning modules, mentor sessions, and saved scam reports.
* **State Management**: Built with **Zustand** for seamless, globally persisted local state across the application.

## 🛠️ Technology Stack

**Frontend:**
* Next.js (React)
* CSS Modules for styling
* Zustand for state management
* Framer Motion for micro-animations
* Lucide React for iconography

**Backend:**
* Python (FastAPI)
* Groq SDK (Llama 3.1 & Llama 3.3 Versatile)
* Google GenAI SDK (Gemini 1.5 Flash)
* Pydantic for strict payload validation

## ⚙️ Local Development Setup

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and install the dependencies:

```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env.local` file in the `apps/backend` directory using the provided `.env.example` as a template:

```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

Run the backend server:
```bash
python -m uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup (Next.js)
Open a new terminal and navigate to the frontend directory:

```bash
cd apps/web
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔒 Security Notes
* Environment variables are securely ignored from version control.
* AI payloads are sanitized to ensure consistent JSON formatting and clean UI rendering.
* API rate limit and unhandled exceptions fallbacks are implemented to guarantee stability.
