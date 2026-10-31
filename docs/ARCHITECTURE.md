# Pixel Mentor - System Architecture

## Overview
Pixel Mentor is a pixel-art financial literacy game and AI coach designed specifically for first-time earners in India (students, first-job professionals, and gig workers).
**Education Only**: Pixel Mentor provides education and simulation only, never regulated investment advice.

---

## High-Level Architecture

```
+-----------------------------------------------------------+
|                   React Frontend (/web)                   |
|  - Vite + React (JavaScript)                             |
|  - Pixel Art UI / Retro Cyber Design System               |
|  - State Management: Zustand                              |
|  - Charts: Recharts                                       |
|  - Identity: localStorage random user_id (X-User-Id)      |
+-----------------------------------------------------------+
                             |
             HTTP / JSON & Server-Sent Events (SSE)
              Headers: X-User-Id: <uuid_or_str>
                             v
+-----------------------------------------------------------+
|                   FastAPI Backend (/api)                  |
|  - Dependency / Middleware: Auto-provision User on sight   |
|  - Pure Python Math / Simulation Engine                   |
|  - Pure Python Budget Engine (with Gig-worker mode)       |
|  - Coin Ledger Economy System                             |
|  - Scam Shield Rule Engine + LLM fallback                 |
|  - Guardrails & Stock Filter                              |
|  - Routers:                                               |
|      /profile, /budget, /expenses, /sim, /coach,          |
|      /scam, /glossary, /coins, /games                     |
+-----------------------------------------------------------+
               |                               |
               v                               v
+----------------------------+   +--------------------------+
|      SQLite Database       |   |      LLM Service API     |
|   (SQLAlchemy 2.0 ORM)     |   | (Streaming / Mock mode)  |
+----------------------------+   +--------------------------+
```

---

## Approved Tech Stack and Libraries

### Backend (`/api`)
- Python 3.10+
- `fastapi`
- `uvicorn`
- `sqlalchemy` (>= 2.0)
- `pydantic` (>= 2.0)
- `httpx` (for external LLM calls or testing)
- `python-dotenv`

*Do not introduce additional external dependencies without approval.*

### Frontend (`/web`)
- Node 18+
- Vite (React JS template)
- `react`, `react-dom`
- `zustand` (State management)
- `recharts` (Data visualization)
- `lucide-react` (Pixel-compatible icon set)
- `canvas-confetti` (for gamified rewards)

---

## Core System Modules

1. **User Identity & Session Middleware**
   - No login/passwords.
   - Client generates a persistent UUID in `localStorage` (`pixel_mentor_user_id`).
   - Every request sends `X-User-Id`.
   - Backend auto-creates user record on first sight with default starting stats if absent.

2. **Budget Engine (`/api/services/budget.py`)**
   - Category-based limits (student, professional, gig worker).
   - Gig-worker mode: computes baseline from lowest income month, sends surplus into buffer, calculates safe-to-spend today.

3. **Simulation Engine (`/api/services/sim.py`)**
   - Pure math calculations: SIP future value, lump sum compounding, inflation adjustment, goal countdown.
   - Scenario generator with seeded random generators (Normal, Crash, Bull).
   - Strict "Assumptions, not guarantees" disclaimers.

4. **Coin Economy (`/api/services/coins.py`)**
   - Double-entry-style immutable ledger (`coin_ledger`).
   - Validates transactions to prevent duplicate clicks and enforce daily caps.

5. **Scam Shield (`/api/services/scam.py`)**
   - Fast regex / rule-based flag detection (guaranteed returns, urgency, secret insider tips, WhatsApp/Telegram groups).
   - AI risk explanation and safer alternative suggestions.

6. **AI Coach & Safety Guardrails (`/api/services/llm.py` & `/api/services/guardrails.py`)**
   - Injects user profile, personality, budget, and goals into system prompt.
   - Enforces disclaimer: "Education only, not financial advice".
   - Regulated stock recommendation blocker (catches ticker names / direct buy instructions).
   - Mock LLM fallback when API keys are not supplied.

7. **Explain-Like-I'm-15 Glossary (`/api/data/glossary.json`)**
   - Zero-LLM cost glossary for ~30 foundational Indian finance terms (SIP, FD, Index Fund, PPF, NPS, Inflation, etc.).

