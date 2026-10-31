# Pixel Mentor 🎮🪙🧙

A pixel-art financial literacy game and AI coach built for first-time earners in India (students, first-job professionals, and gig workers).
**EDUCATION ONLY**: Never regulated financial advice. All projections are illustrative simulations.

---

## Architecture & Roadmap Progress

### Phase A: Foundation (Complete)
- **Part 1: Project Setup**: Vite + React + React Router + Axios + Zustand + Recharts (`/web`) & FastAPI + SQLAlchemy 2.0 + SQLite + pytest (`/api`). Root `.env.example`, `.gitignore`, CORS, Vite proxy, and health check (`/health` $\rightarrow$ `{"status": "ok"}`).
- **Part 2: Database Schema (SQLite)**: All 8 tables implemented in `api/app/models.py`. Append-only `coin_ledger`. Database seeder (`api/seed.py`).
- **Part 3: Anonymous Identity & Session Handling**: UUID generation in `src/lib/session.js`, Axios request interceptor attaching `X-User-Id` in `src/lib/api.js`, FastAPI dependency `get_current_user` rejecting missing headers with `400` and auto-provisioning new users on first sight.
- **Part 4: Design System & Pixel Assets**: 6-colour palette, typography, reusable components (`PixelButton`, `PixelCard`, `DialogueBox`, `CoinCounter`, `Modal`, `ProgressBar`, `Tooltip`, and inline SVG `Mentor` in 4 moods: `idle`, `happy`, `worried`, `thinking`). Visual styleguide at `/styleguide`.

### Phase B: Dashboard & Simulation Core (Complete)
- **Part 5: Landing Page (`/`)**:
  - Hero with animated Mentor, one-line promise, and "Get Started" CTA button.
  - 3-step how-it-works strip.
  - 9 USP cards.
  - Demo preview mock UI strip.
  - Education-only legal disclaimer footer.
  - Fully responsive on mobile phone width with zero backend calls.
- **Part 6: Onboarding & Personality Quiz (`/onboarding`)**:
  - 5-step wizard with progress bar (Category $\rightarrow$ Cash flow $\rightarrow$ Fixed expenses $\rightarrow$ Goal target $\rightarrow$ 4 Risk-scenario questions).
  - Mentor reacts to answers in real time with typewriter dialogue.
  - Deterministic scoring function in `api/app/services/personality.py` assigning `Safe Saver`, `Impulsive Spender`, `FOMO Investor`, or `Balanced Planner`.
  - Grants 100 bonus coins via append-only ledger on `POST /profile`.
  - Route guard redirects completed profiles to `/dashboard`.
- **Part 7: Dashboard Shell (`/dashboard/*`)**:
  - Responsive shell: left sidebar on desktop, bottom navigation tab bar on mobile.
  - Header with live coin counter (`GET /coins/balance`), user personality badge, and API health status.
  - Floating Mentor dock.
  - Reusable `LoadingState`, `EmptyState`, and `ErrorState` components.
  - Nested routes for all 7 tabs: Overview, Budget, Goals, Coach, Games, Learn, Scam Shield.
- **Part 8: Budget Engine (Python)**:
  - `api/app/services/budget.py`: Computes default limits by category and rent share.
  - Gig mode: Lean-month baseline, buffer allocation, and `safe_to_spend_today`.
  - Endpoints: `GET /expenses`, `POST /expenses`, `DELETE /expenses/{id}`, `GET /budget/summary`.
  - Unit tests covering fixed income, irregular income, and overspending.
- **Part 9: Budget Tab (React)**:
  - Quick-add expense form.
  - Recharts Donut chart of category spending and budget-vs-actual bars.
  - Gig-mode card showing daily safe-to-spend allowance.
  - Coin rewards (+5 per log, max 5/day).
  - Recent expenses list with individual delete action.
  - Adding/deleting expenses updates charts inline without page reload.
  - Mentor warning comment if any category goes over limit.
- **Part 10: Simulation Engine (Python)**:
  - Pure functions in `api/app/services/simulation.py`:
    - `sip_future_value(monthly, annual_rate, years)`
    - `lump_sum(principal, annual_rate, years)`
    - `inflation_adjusted(nominal, annual_inflation, years)`
    - `months_to_goal(target, monthly, annual_rate, lump_sum)`
    - `generate_scenario(kind, months, seed)`
  - Endpoints: `POST /sim/sip`, `POST /sim/whatif`, `POST /sim/scenario`.
  - Hand-calculated tests verifying exact mathematical outputs.

- **Part 11: Goals Tab and What If Time Machine (`/dashboard/goals`)**:
  - Goal cards (Laptop, Bike, Emergency Fund, Custom) showing current vs target and percentage progress.
  - Interactive What If Time Machine with debounced sliders (monthly SIP, tenure, expected return rate, inflation).
  - Lifestyle sacrifice sliders (Skip 2 food deliveries/month, pack office lunch, switch to cheaper phone plan) instantly projecting extra monthly compounding.
  - Recharts Area chart comparing nominal vs real wealth with goal reference line.
  - Callout: "At this rate, you reach your goal by [Month, Year]!"

---

### Phase C & D: AI Coach, Scam Shield, Games & Learn (Complete)
- **Part 12: AI Coach Tab & Memory (`/dashboard/coach`)**:
  - `POST /coach/chat`, `GET /coach/starter-questions`, and `GET /coach/history`.
  - Contextual mentor intelligence customized to user profile, income, category, and past memory.
  - Strict guardrails in `api/services/guardrails.py` blocking specific stock/crypto ticker purchase recommendations.
  - Proactive starter questions reactive to user's real data (e.g. food spend % of income).
  - Robust fallback intelligence ensuring mentor always responds instantly.
- **Part 13: Scam Shield Tab & Red Flag Detector (`/dashboard/scam`)**:
  - `POST /scam/analyze`: Regex-driven rule engine scoring 0-100 risk meter.
  - Detects: guaranteed returns, urgency, secret VIP Telegram/WhatsApp groups, pump-and-dump penny stock manipulations, advance fee fraud, and pyramid/MLM schemes.
  - Clear explanations, highlighted flags, and SEBI/RBI-regulated safe alternatives.
  - Interactive analyzer UI with 4 preloaded 1-click test cases.
- **Part 14: Arcade Games & Mistake Replays (`/dashboard/games`)**:
  - Standardized arcade shell: rules briefing, "I Understand" agreement gate, entry fee deduction via append-only ledger, gameplay HUD, and post-game Mistake Replay comparing user decisions with optimal financial strategies.
  - 5 interactive simulations:
    1. *SIP Farm*: 10 seasons, monthly planting vs skipping, discipline compounding bonus.
    2. *Crash Survivor*: Sudden -30% market drop; panic sell vs hold firm vs buy the dip.
    3. *Scam Detective*: 8 tips to evaluate as legitimate or fraudulent red flags.
    4. *Budget Bazaar*: 4 weekly life shocks (bike breakdown, destination wedding, root canal, festival flash sale); choices between Emergency Buffer, Cutting Wants, or Credit Card debt.
    5. *Inflation Island*: 15-year simulation (2010 to 2025) comparing ₹1,00,000 cash under mattress vs broad equity index fund as real consumer prices soar.
- **Part 15: Learn & ELI15 Tab (`/dashboard/learn`)**:
  - 30 Indian financial literacy terms in `api/data/glossary.json` with Simple (ELI15), Real-Life Analogy, and Technical definitions with search and zero LLM cost.
  - Bite-sized financial lessons with idempotent coin rewards via `POST /learn/complete`.
### Phase D: Games, Coin Economy & Production Polish (Complete)
- **Part 17: Coin Economy ([`coins.py`](file:///c:/Users/nites/Desktop/invest/api/app/services/coins.py))**:
  - `EARN_RULES` and `SPEND_RULES` tables with daily caps and one-time flags.
  - Endpoints: `GET /coins/balance`, `POST /coins/earn`, `POST /coins/spend`.
  - Server-side validation against append-only `coin_ledger` preventing overspending, double-clicking reward exploitation, and daily cap breaches.
  - Global Zustand coin store with live animated `CoinCounter` and ledger history modal.
- **Part 18: Game Framework ([`GameShell.jsx`](file:///c:/Users/nites/Desktop/invest/web/src/components/games/GameShell.jsx))**:
  - Standardized reusable shell: rules briefing, *"I understand"* verification gate, entry fee deduction, live play viewport, Mistake Replay, and comparison chart.
  - `POST /games/start` creates `game_sessions` row with personality-scaled difficulty and seed.
  - `POST /games/submit` validates session, scores decisions, awards win coins, and stores decision history.
  - Includes a trivial test simulator proving the framework loop.
- **Part 19: The 5 Arcade Simulations & Mistake Replays**:
  - **19a SIP Farm**: 10 seasons / 24 months, consistency vs skipping, dollar-cost averaging harvest.
  - **19b Crash Survivor**: -30% market drop; emotional discipline: panic sell vs hold firm vs buy the dip.
  - **19c Scam Detective**: 8 incoming tips to evaluate as legitimate or fraudulent red flags.
  - **19d Budget Bazaar**: 4 weekly life shocks; emergency buffer vs cutting wants vs high-interest credit card debt.
  - **19e Inflation Island**: 15-year compounding simulation comparing idle cash vs equity index fund.
  - Replay API `GET /games/{session_id}/replay`: returns user path vs optimal strategy curve with educational Mentor debrief.
- **Part 20: Production Polish, Deployment & Demo**:
  - **Demo Mode**: Instant access via `?demo=1` (e.g. `http://localhost:5173/?demo=1`) loading pre-seeded student profile with goals, expenses, and coins.
  - **Startup Hook**: Auto-seeds demo data if SQLite database is empty.
  - **Mobile Ready**: All 7 tabs fully responsive at 360px phone width.
  - **Deployment Configs**: `vercel.json` for frontend and `render.yaml` for backend.
  - **3-Minute Demo Script**: Detailed walkthrough path documented in [`docs/DEMO_SCRIPT.md`](file:///c:/Users/nites/Desktop/invest/docs/DEMO_SCRIPT.md).

---

## How to Run

### 1. Start the FastAPI Backend
```bash
python -m uvicorn main:app --app-dir api --port 8000 --reload
```
- API Health Check: `http://localhost:8000/health` $\rightarrow$ `{"status": "ok"}`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Start the React Frontend
```bash
cd web
npm run dev
```
- Landing Page: `http://localhost:5173/`
- Instant Demo Mode: `http://localhost:5173/?demo=1`
- Onboarding Wizard: `http://localhost:5173/onboarding`
- Dashboard: `http://localhost:5173/dashboard`
- Styleguide: `http://localhost:5173/styleguide`

---

## How to Test

### Automated Pytest Suite (31 Tests)
```bash
python -m pytest api/tests -v -p no:anyio
```
Verifies:
1. Budget engine: fixed income, irregular gig mode, overspending alert.
2. Models: user creation, expense linkage, append-only coin ledger math, all 8 models.
3. Personality quiz: deterministic scoring algorithm.
4. Anonymous session: 400 on missing header, auto-provisioning on first sight.
5. Simulation engine: SIP future value, lump sum compounding, inflation adjustment, and goal solver against hand-calculated references.
6. AI Coach: guardrail ticker sanitization, fallback coach generation, expense-reactive starter questions.
7. Coin economy: daily caps on expense logging, one-time reward idempotency, overspending prevention.
8. Scam Shield: character spans extraction, 5 scam samples high score, 2 neutral samples low risk.
9. Arcade Games: 5 games listing + dummy test, entry fee deduction, difficulty scaling, mistake replay evaluation.
10. Learn & Glossary: 30 terms verification, level switch definitions, 8 short lessons with mini-quizzes, idempotent coin rewards.

### Direct Engine Tests
```bash
python api/test_direct.py
```

### Production Frontend Build
```bash
cd web
npm run build
```
```bash
cd web
npm run build
```
```bash
cd web
npm run build
```
