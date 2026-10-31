# Pixel Mentor - API Contract

## Overview
All endpoints require the request header:
`X-User-Id: <user_id>` (String UUID).
If the user does not exist in the database, the backend automatically registers them on first sight.

---

## 1. Profile Router (`/profile`)

### `GET /profile`
Returns user information, financial category, personality, and completion status.
- **Response**:
```json
{
  "user_id": "string",
  "category": "student | professional | gig_worker",
  "income_type": "monthly | irregular | stipend",
  "monthly_income": 35000.0,
  "fixed_expenses": 12000.0,
  "personality": "Safe Saver",
  "onboarding_completed": true,
  "coins": 250,
  "created_at": "2026-10-31T00:00:00Z"
}
```

### `POST /profile/onboard`
Submits onboarding responses, assigns money personality, sets initial goal & budget defaults, grants 100 starting coins.
- **Request**:
```json
{
  "category": "student | professional | gig_worker",
  "income_type": "monthly | irregular | stipend",
  "monthly_income": 35000.0,
  "fixed_expenses": 12000.0,
  "goal_name": "Emergency Fund",
  "goal_target_amount": 50000.0,
  "quiz_answers": [1, 2, 0, 3]
}
```
- **Response**:
```json
{
  "success": true,
  "personality": "Safe Saver",
  "personality_description": "You prioritize stability and cautious steps.",
  "starting_coins": 100
}
```

---

## 2. Expenses Router (`/expenses`)

### `GET /expenses`
Retrieves recent logged expenses.
- **Query params**: `limit=50`
- **Response**:
```json
[
  {
    "id": 1,
    "amount": 250.0,
    "category": "Food",
    "description": "Lunch with peers",
    "created_at": "2026-10-31T01:00:00Z"
  }
]
```

### `POST /expenses`
Logs an expense. Enforces daily cap for coin reward (+5 coins per log, max 3 rewarded per day).
- **Request**:
```json
{
  "amount": 150.0,
  "category": "Transport",
  "description": "Metro ticket"
}
```
- **Response**:
```json
{
  "id": 2,
  "amount": 150.0,
  "category": "Transport",
  "coins_earned": 5
}
```

---

## 3. Budget Router (`/budget`)

### `GET /budget`
Returns budget limits, spent amount per category, savings rate, and gig-worker analysis if applicable.
- **Response**:
```json
{
  "monthly_income": 35000.0,
  "fixed_expenses": 12000.0,
  "total_spent": 18450.0,
  "savings_rate_pct": 47.2,
  "categories": [
    {
      "category": "Food",
      "allocated": 6000.0,
      "spent": 4200.0,
      "remaining": 1800.0
    }
  ],
  "gig_mode": {
    "is_gig": false,
    "baseline_income": 0,
    "buffer_saved": 0,
    "safe_to_spend_today": 450.0
  }
}
```

### `POST /budget/limits`
Customizes category allocations.
- **Request**:
```json
{
  "categories": [
    { "category": "Food", "allocated": 7000.0 }
  ]
}
```

---

## 4. Simulation Engine Router (`/sim`)

Pure calculations. Never regulated advice.

### `POST /sim/calculate`
Calculates SIP future value, lump sum, inflation adjustment, and time to reach goal.
- **Request**:
```json
{
  "monthly_investment": 3000.0,
  "lump_sum": 0.0,
  "annual_return_pct": 12.0,
  "inflation_rate_pct": 6.0,
  "duration_years": 5,
  "goal_amount": 250000.0
}
```
- **Response**:
```json
{
  "total_invested": 180000.0,
  "future_value_nominal": 247466.0,
  "future_value_real": 210850.0,
  "estimated_months_to_goal": 61,
  "wealth_gain": 67466.0,
  "chart_points": [
    { "year": 1, "invested": 36000, "nominal": 38472, "real": 36294 }
  ],
  "disclaimer": "Educational simulation based on assumed rates. Past performance does not guarantee future results."
}
```

### `POST /sim/scenarios`
Generates deterministic 12-month paths for Normal, Crash, and Bull markets given a fixed seed.
- **Request**:
```json
{
  "monthly_investment": 5000.0,
  "seed": 42
}
```
- **Response**:
```json
{
  "scenarios": {
    "normal": [...],
    "crash": [...],
    "bull": [...]
  }
}
```

---

## 5. Coins Router (`/coins`)

### `GET /coins/balance`
- **Response**:
```json
{
  "balance": 185,
  "history": [
    {
      "delta": 100,
      "reason": "onboarding_bonus",
      "created_at": "2026-10-31T00:00:00Z"
    }
  ]
}
```

### `POST /coins/spend`
Deducts coins for game entry or level unlocks. Validates that balance >= cost.
- **Request**:
```json
{
  "cost": 20,
  "reason": "game_entry",
  "reference_id": "sip_farm_101"
}
```
- **Response**:
```json
{
  "success": true,
  "new_balance": 165
}
```

---

## 6. Scam Shield Router (`/scam`)

### `POST /scam/analyze`
Analyzes a financial message or stock tip. Flags suspicious terms, calculates risk score (0-100), gives plain explanation and safe alternatives.
- **Request**:
```json
{
  "message": "Join our VIP Telegram group for 30% guaranteed daily return on secret multibagger stocks!"
}
```
- **Response**:
```json
{
  "risk_score": 95,
  "verdict": "DANGER - Highly Likely Scam",
  "flagged_keywords": ["guaranteed", "vip telegram", "secret multibagger", "30% daily"],
  "explanation": "Guaranteed returns do not exist in equity markets. Demands for urgency and private groups are classic fraud markers.",
  "safer_alternative": "SEBI-registered index funds or RBI-regulated bank fixed deposits."
}
```

---

## 7. Explain-Like-I'm-15 Glossary Router (`/glossary`)

### `GET /glossary`
Returns all 30 financial terms with simple definitions, intermediate details, and real-life analogies.
- **Response**:
```json
[
  {
    "term": "SIP (Systematic Investment Plan)",
    "simple_def": "Putting a small fixed amount into mutual funds every month automatically.",
    "intermediate_def": "A rupee-cost averaging method that buys more units when prices fall and fewer when prices rise.",
    "analogy": "Like subscribing to your favourite streaming service, except instead of movies, you accumulate ownership of companies."
  }
]
```

### `GET /glossary/{term}`
Returns term details or mentor fallback.

---

## 8. AI Coach Router (`/coach`)

### `GET /coach/starter-questions`
Returns 3-4 proactive questions based on the user's spending and income.

### `POST /coach/chat`
Streams or returns AI mentor message.
- Enforces system prompt with user context.
- Passes through guardrail filter: blocks recommendation of specific stock tickers or buy/sell orders.
- Adds "Learning mode, not advice" watermark.
- **Request**:
```json
{
  "message": "Should I invest in crypto or index funds?"
}
```
- **Response**:
```json
{
  "reply": "As your mentor, let's look at risk! Crypto is highly volatile, whereas broad index funds track India's top companies. For beginners, building an emergency fund comes first!",
  "disclaimer": "Educational commentary only, never financial advice."
}
```

---

## 9. Games Router (`/games`)

### `GET /games`
Lists the 5 games: SIP Farm, Crash Survivor, Scam Detective, Budget Bazaar, Inflation Island with entry cost and unlocked status.

### `POST /games/start`
Validates coin balance, deducts entry fee (e.g. 15 coins), generates game session ID.
- **Request**:
```json
{
  "game_type": "sip_farm"
}
```
- **Response**:
```json
{
  "session_id": "uuid-string",
  "game_type": "sip_farm",
  "initial_state": {}
}
```

### `POST /games/finish`
Evaluates user decisions, awards coins, runs Mistake Replay comparing user actions against optimal path.
- **Request**:
```json
{
  "session_id": "uuid-string",
  "decisions": [ ... ]
}
```
- **Response**:
```json
{
  "score": 85,
  "coins_awarded": 30,
  "replay": {
    "user_result": "Panic sold in Month 6 at a 15% loss.",
    "optimal_result": "Stayed invested and averaged down, finishing +18%.",
    "mentor_lesson": "Market dips are normal. Selling during a crash locks in your losses permanently!"
  }
}
```

