import os
import re
import json
import time
import urllib.request
from typing import List, Dict, Any, Generator, Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Auto-load .env
load_dotenv()

# Load system prompt template
PROMPT_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs", "PROMPTS.md")

BASE_SYSTEM_PROMPT = """You are Pixel Mentor, an AI financial coach inside a 16-bit retro RPG game dialogue box, guiding first-time earners in India (students, early-career professionals, gig workers).

CRITICAL FORMAT RULES:
1. PUNCHY & CONVERSATIONAL: Keep responses SHORT (strictly 2 to 4 sentences, or a quick 3-bullet list). NEVER write lengthy textbooks, giant multi-row tables, or academic lectures. Speak like a friendly, encouraging retro game companion!
2. GAMING METAPHORS: Naturally sprinkle in retro gaming terms (mana = cash flow, armor/shield = emergency fund, XP = financial discipline, dungeon boss = market volatility, loot/treasure = savings/compounding).
3. INDIAN CONTEXT: Relate to Indian realities (UPI, monthly SIP, NIFTY 50 index funds, FDs, PPF, hostel/PG expenses, swiggy/zomato splurges). Use Rupee symbol (₹).
4. EDUCATION ONLY & GUARDRAILS: Never recommend buying specific stocks or crypto tokens. Redirect stock picks to broad low-cost index funds and consulting a SEBI-registered advisor.
5. PROJECTIONS: All financial simulations must note: "[Illustrative simulation for learning, not guaranteed returns]".
"""

BANNED_SECURITY_PATTERNS = [
    r"\b(buy|sell|call|put|long|short)\s+([A-Z]{2,10}|[A-Za-z]+)\s+(shares?|stocks?|equity)",
    r"\binvest\s+in\s+([A-Z]{3,10})\s+now\b",
    r"\btarget\s+price\s+of\s+₹?\d+",
    r"\bguaranteed\s+multibagger\b",
    r"\bupper\s+circuit\s+target\b"
]

PROJECTION_PATTERNS = [
    r"\b(grow\s+to|returns?\s+of\s+\d+%\s*p\.a\.|projected\s+value|future\s+value|compounds?\s+to)\b"
]

LEARNING_NOTE = "\n\n[Note: Projections are illustrative simulations for learning, not guaranteed predictions.]"

def sanitize_llm_output(text: str) -> str:
    """
    Post-filter that blocks replies naming specific securities to buy
    and appends a learning-mode note to projections.
    """
    sanitized = text
    for pat in BANNED_SECURITY_PATTERNS:
        if re.search(pat, sanitized, re.IGNORECASE):
            sanitized = re.sub(
                pat,
                "[Specific security recommendations are blocked - consult a SEBI registered advisor]",
                sanitized,
                flags=re.IGNORECASE
            )

    has_projection = any(re.search(pat, sanitized, re.IGNORECASE) for pat in PROJECTION_PATTERNS)
    if has_projection and "[Note: Projections are illustrative" not in sanitized:
        sanitized = sanitized.strip() + LEARNING_NOTE

    return sanitized

def build_user_context(user, db: Optional[Session] = None) -> str:
    """
    Builds structured context summarizing user profile, personality, budget, goals, and insights.
    """
    category = getattr(user, "category", "student")
    income = getattr(user, "monthly_income", 0.0)
    fixed = getattr(user, "fixed_expenses", 0.0)
    personality = getattr(user, "personality", "Safe Saver")
    level = getattr(user, "level", "beginner")
    insights = getattr(user, "user_insights", "") or "No specific answers recorded yet."
    notes = getattr(user, "mentor_notes", "") or "New adventurer in the financial realm."

    spent = 0.0
    budget_limit = max(1.0, income - fixed)
    top_category = "General"
    goals_summary = "None set yet"

    if db:
        try:
            from app.models import Expense, Goal
            expenses = db.query(Expense).filter(Expense.user_id == user.id).all()
            if expenses:
                spent = sum(e.amount for e in expenses)
                # Find top category
                cat_totals = {}
                for e in expenses:
                    cat_totals[e.category] = cat_totals.get(e.category, 0) + e.amount
                if cat_totals:
                    top_category = max(cat_totals, key=cat_totals.get)

            goals = db.query(Goal).filter(Goal.user_id == user.id).all()
            if goals:
                goals_summary = ", ".join(f"{g.name} (₹{g.current_amount:.0f}/₹{g.target_amount:.0f})" for g in goals)
        except Exception:
            pass

    spent_pct = round((spent / max(1.0, budget_limit)) * 100, 1)
    savings_rate = round(max(0.0, (income - fixed - spent) / max(1.0, income)) * 100, 1) if income > 0 else 0.0
    safe_today = round(max(0.0, (income - fixed - spent) / 30), 1) if income > 0 else 0.0

    return f"PLAYER CONTEXT: {personality} ({category}). Monthly Income: ₹{income:,.0f}, Fixed Expenses: ₹{fixed:,.0f}, Discretionary remaining: ₹{budget_limit:,.0f} (Spent: {spent_pct}%). Top Spend: {top_category}. Savings Rate: {savings_rate}%. Safe to spend today: ₹{safe_today:,.0f}. Active Goals: {goals_summary}. (Reference their context naturally; do not recite these statistics verbatim)."

MOCK_REPLIES = {
    "sip": "A Systematic Investment Plan (SIP) is like an automated planting mechanic in RPGs! Every month on salary day, a fixed rupee amount buys index fund units. When markets dip, you get more units at a discount; when sunny, your net worth compounds.",
    "budget": "Your mana pool (income) must be allocated wisely! Aim for 50% on essentials, 30% on personal joy, and 20% into your compounding treasury. Check your 'Safe to Spend Today' card on the dashboard to never run out before month-end.",
    "emergency": "Before taking on high-volatility dungeon bosses, equip your armor! An emergency fund with 3 to 6 months of mandatory living expenses keeps you safe so you never panic-sell investments.",
    "scam": "Warning alert! Any tip promising guaranteed returns, 20% weekly gains, or secret Telegram VIP access is a trap. Regulated investments carry transparent market risk.",
    "default": "Greetings! I'm Pixel Mentor. We can analyze your budget numbers, test compounding time machines, or scan suspicious social media tips in Scam Shield. What quest shall we tackle?"
}

def get_llm_config():
    load_dotenv()
    api_key = (
        os.getenv("LLM_API_KEY") or 
        os.getenv("GROK_API_KEY") or 
        os.getenv("GROQ_API_KEY") or 
        os.getenv("OPENAI_API_KEY") or
        os.getenv("XAI_API_KEY")
    )
    model = os.getenv("LLM_MODEL") or os.getenv("GROK_MODEL") or "qwen/qwen3.8-27b"
    base_url = os.getenv("LLM_BASE_URL")
    
    if api_key:
        if not base_url:
            if api_key.startswith("gsk_"):
                base_url = "https://api.groq.com/openai/v1"
                if not model or model == "gemini-1.5-flash" or model == "openai/gpt-oss-120b":
                    model = "qwen/qwen3.8-27b"
            elif api_key.startswith("xai-"):
                base_url = "https://api.x.ai/v1"
                if not model or model == "gemini-1.5-flash":
                    model = "grok-2-latest"
            else:
                base_url = "https://api.groq.com/openai/v1"
                
    return api_key, model, base_url

def is_mock_mode() -> bool:
    mock_env = os.getenv("MOCK_LLM", "false").lower()
    if mock_env in ("true", "1", "yes"):
        return True
    api_key, _, _ = get_llm_config()
    return not bool(api_key)

def call_live_llm(messages: List[Dict[str, str]], json_mode: bool = False) -> str:
    """Calls Groq / Grok (xAI) / OpenAI compatible completions API."""
    api_key, model, base_url = get_llm_config()
    if not api_key or not base_url:
        raise ValueError("No LLM API configuration found")

    url = f"{base_url.rstrip('/')}/chat/completions"
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 400 if json_mode else 220
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "PixelMentor/1.0"
        }
    )
    with urllib.request.urlopen(req, timeout=12) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        return res_data["choices"][0]["message"]["content"]

def chat(prompt: str, user_context: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> str:
    """
    Generates a chat response using live Grok / Groq API when configured,
    with smart fallback and guardrail sanitization.
    """
    if not is_mock_mode():
        try:
            sys_content = BASE_SYSTEM_PROMPT
            if user_context:
                sys_content += f"\n\nCURRENT USER CONTEXT:\n{user_context}"

            messages = [{"role": "system", "content": sys_content}]
            if history:
                for h in history[-6:]:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": prompt})

            live_reply = call_live_llm(messages, json_mode=False)
            if live_reply and len(live_reply.strip()) > 5:
                return sanitize_llm_output(live_reply)
        except Exception as e:
            print(f"[LLM Live Call Warning: {e} - using contextual fallback]")

    # Contextual fallback generator
    p_lower = prompt.lower()
    if any(k in p_lower for k in ["sip", "invest", "compound", "mutual fund", "stock"]):
        reply = MOCK_REPLIES["sip"]
    elif any(k in p_lower for k in ["budget", "spend", "expense", "save"]):
        reply = MOCK_REPLIES["budget"]
    elif any(k in p_lower for k in ["emergency", "safe", "fd"]):
        reply = MOCK_REPLIES["emergency"]
    elif any(k in p_lower for k in ["scam", "telegram", "guaranteed", "tip"]):
        reply = MOCK_REPLIES["scam"]
    else:
        reply = MOCK_REPLIES["default"]
    return sanitize_llm_output(reply)

def stream_chat(prompt: str, user_context: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> Generator[str, None, None]:
    """
    Generator yielding reply tokens/chunks for Server-Sent Events (SSE).
    """
    full_text = chat(prompt, user_context=user_context, history=history)
    words = full_text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")

def json_call(prompt: str, system_prompt: Optional[str] = None, user_context: Optional[str] = None, max_retries: int = 1) -> Dict[str, Any]:
    """
    Calls LLM and returns parsed JSON.
    """
    if not is_mock_mode():
        try:
            sys_content = (system_prompt or BASE_SYSTEM_PROMPT) + "\nYou must respond strictly with valid JSON only."
            if user_context:
                sys_content += f"\n\nCURRENT USER CONTEXT:\n{user_context}"

            messages = [
                {"role": "system", "content": sys_content},
                {"role": "user", "content": prompt}
            ]
            raw_json = call_live_llm(messages, json_mode=True)
            return json.loads(raw_json)
        except Exception as e:
            print(f"[LLM JSON Call Note: {e} - using structured fallback]")

    # Structured fallback
    p_lower = prompt.lower()
    if "question" in p_lower or "budget" in p_lower:
        return {
            "questions": [
                {"id": "q1", "text": "Your food spend is 35% of monthly income. Is that planned or takeout convenience?", "chips": ["Mostly takeout", "Planned groceries", "Special celebration"]},
                {"id": "q2", "text": "How many months of emergency buffer do you have saved right now?", "chips": ["0 months (starting out)", "1-2 months", "3+ months ready"]},
                {"id": "q3", "text": "Are you currently investing in an automated monthly SIP or holding cash?", "chips": ["Active SIP", "Cash in savings", "New to investing"]}
            ]
        }
    elif "scam" in p_lower or "risk" in p_lower:
        return {
            "score": 85,
            "explanation": "Promises of guaranteed high returns and private chat groups are textbook fraudulent signals.",
            "safer_alternative": "SEBI-regulated low-cost index funds or DICGC-insured bank FDs."
        }
    else:
        return {"status": "ok", "message": "Parsed successfully"}

