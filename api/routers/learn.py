from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models import User, LessonDone
from schemas import LessonCompleteRequest, LessonCompleteResponse
from deps import get_current_user
from services.coins import award_coins

router = APIRouter(prefix="/learn", tags=["Learn"])

LESSONS_CATALOG = [
    {
        "id": "lesson_1_50_30_20",
        "title": "The Golden 50/30/20 Rule",
        "category": "Budgeting",
        "duration": "3 min",
        "coins_reward": 20,
        "content": "Split your income into 3 buckets: 50% for Needs (rent, groceries, utilities), 30% for Wants (dining out, entertainment), and 20% for Savings & Investments (emergency fund, SIPs). Pay yourself first on the day money arrives!",
        "takeaway": "Automate transferring 20% to savings before spending on discretionary wants.",
        "quiz": {
            "question": "Under the 50/30/20 rule, which bucket do dining out and weekend movies belong to?",
            "options": ["50% Needs", "30% Wants", "20% Savings", "Emergency Fund"],
            "correct": 1,
            "explanation": "Dining out and entertainment are discretionary 'Wants' capped at 30%."
        }
    },
    {
        "id": "lesson_2_power_of_compounding",
        "title": "Compounding: The 8th Wonder",
        "category": "Investing",
        "duration": "4 min",
        "coins_reward": 25,
        "content": "If you invest ₹5,000 every month at an assumed 12% return for 10 years, you invest ₹6 lakh, growing to ~₹11.6 lakh. If you wait another 10 years (20 total), your ₹12 lakh invested turns into ~₹50 lakh! Time in the market does the heavy lifting.",
        "takeaway": "Starting 5 years earlier matters far more than attempting to pick risky multi-baggers.",
        "quiz": {
            "question": "What is the primary driver of exponential compounding growth?",
            "options": ["High trading frequency", "Time in the market over decades", "Timing market daily bottoms", "Taking margin loans"],
            "correct": 1,
            "explanation": "Uninterrupted time allows past returns to generate their own returns."
        }
    },
    {
        "id": "lesson_3_spotting_scams",
        "title": "Scam Shield: Red Flags 101",
        "category": "Security",
        "duration": "3 min",
        "coins_reward": 20,
        "content": "Rule 1: Nobody can guarantee 20% monthly returns. Rule 2: Unregulated Telegram tip channels are illegal prize chits. Rule 3: Never pay upfront 'withdrawal unlock fees'. Real investments have transparent risk.",
        "takeaway": "If someone promises guaranteed profits with zero risk, block and report immediately.",
        "quiz": {
            "question": "A Telegram channel claims a '100% guaranteed 25% weekly return bot'. What should you do?",
            "options": ["Deposit ₹5,000 to test it", "Ask friends to join for bonus", "Block and report as a fraud red flag", "Wait 1 week then deposit"],
            "correct": 2,
            "explanation": "Guaranteed weekly returns do not exist. It is a textbook advance-fee scam."
        }
    },
    {
        "id": "lesson_4_emergency_fund_armor",
        "title": "Emergency Fund: Your Financial Armor",
        "category": "Saving",
        "duration": "3 min",
        "coins_reward": 20,
        "content": "Before investing in stocks, build armor. Keep 3 to 6 months of mandatory living expenses in a liquid savings account or bank FD. This ensures you never panic-sell investments during medical or mechanical crises.",
        "takeaway": "An emergency fund protects your investments from being liquidated at a loss.",
        "quiz": {
            "question": "Where is the best place to keep your emergency fund?",
            "options": ["High-risk crypto tokens", "Illiquid real estate land", "High-liquidity bank savings or FD", "Equity penny stocks"],
            "correct": 2,
            "explanation": "Emergency funds require instant liquidity and sovereign capital safety."
        }
    },
    {
        "id": "lesson_5_index_vs_active",
        "title": "Index Funds: Owning the Market",
        "category": "Investing",
        "duration": "4 min",
        "coins_reward": 25,
        "content": "A NIFTY 50 Index Fund buys the 50 largest companies in India with ultra-low expense ratios (0.1%-0.2%). Instead of betting on one company surviving, you bet on the entire Indian economy growing over the next 15 years.",
        "takeaway": "Low expense ratios and broad diversification beat most stock pickers over long horizons.",
        "quiz": {
            "question": "Why do index funds have significantly lower fees than actively managed funds?",
            "options": ["They trade 100 times a day", "They passively mirror an index without expensive research teams", "They invest only in government debt", "They do not pay dividends"],
            "correct": 1,
            "explanation": "Passive replication eliminates expensive trading and management overhead."
        }
    },
    {
        "id": "lesson_6_inflation_silent_thief",
        "title": "Inflation: The Silent Wealth Destroyer",
        "category": "Economics",
        "duration": "3 min",
        "coins_reward": 20,
        "content": "At 6% annual inflation, ₹100 today buys only ₹55 worth of goods in 10 years, and ₹38 in 15 years. Keeping savings under a mattress or in a 3% account guarantees real purchasing power loss. Equity index funds outpace inflation.",
        "takeaway": "Investing is not just about getting rich—it is required to keep your money from shrinking in purchasing power.",
        "quiz": {
            "question": "If annual inflation is 6% and your savings account yields 3%, what is your real annual return?",
            "options": ["+9% gain", "+3% gain", "-3% purchasing power loss", "Zero change"],
            "correct": 2,
            "explanation": "Real return = nominal return (3%) minus inflation (6%) = -3% real loss."
        }
    },
    {
        "id": "lesson_7_debt_trap_credit_cards",
        "title": "Credit Cards: Weapon vs Tool",
        "category": "Debt",
        "duration": "3 min",
        "coins_reward": 20,
        "content": "If paid in full every month, credit cards offer 45-day interest-free credit and reward points. But if you pay only the 'minimum due', the remaining balance triggers 36% to 42% APR interest from day one, trapping you in a debt spiral.",
        "takeaway": "Always pay the 'Total Amount Due' before the due date, never just the minimum due.",
        "quiz": {
            "question": "What happens when you pay only the 'Minimum Amount Due' on your credit card bill?",
            "options": ["The remaining balance is forgiven", "You get extra cashback points", "Remaining balance incurs 36-42% APR interest from transaction date", "Your credit score improves immediately"],
            "correct": 2,
            "explanation": "Revolving interest rates compound aggressively on unpaid balances."
        }
    },
    {
        "id": "lesson_8_gig_worker_cashflows",
        "title": "Gig & Irregular Income Playbook",
        "category": "Cashflow",
        "duration": "4 min",
        "coins_reward": 25,
        "content": "For gig earners and freelancers, monthly income fluctuates. Step 1: Base your living budget on your lowest month in the last 6 months. Step 2: In good months, sweep all surplus into an Income Buffer Account. Step 3: Draw a consistent salary from the buffer.",
        "takeaway": "Turn erratic irregular earnings into a stable artificial salary via a buffer account.",
        "quiz": {
            "question": "How should a freelancer baseline their essential living budget?",
            "options": ["Based on their best record-breaking month", "Based on their lowest recent lean month", "Based on credit card limits", "By spending all cash before month-end"],
            "correct": 1,
            "explanation": "Budgeting off the lowest lean month prevents cash shortfalls when gigs slow down."
        }
    }
]

@router.get("/lessons")
def get_lessons(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    completed_ids = {l.lesson_id for l in db.query(LessonDone).filter(LessonDone.user_id == user.id).all()}
    result = []
    for lesson in LESSONS_CATALOG:
        result.append({
            **lesson,
            "completed": lesson["id"] in completed_ids
        })
    return result

@router.post("/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    req: LessonCompleteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = next((l for l in LESSONS_CATALOG if l["id"] == req.lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = db.query(LessonDone).filter(
        LessonDone.user_id == user.id,
        LessonDone.lesson_id == req.lesson_id
    ).first()

    coins_awarded = 0
    if not existing:
        done = LessonDone(user_id=user.id, lesson_id=req.lesson_id)
        db.add(done)
        db.commit()
        reward = lesson.get("coins_reward", 20)
        award_coins(db, user.id, reward, "lesson_completed", req.lesson_id)
        coins_awarded = reward

    return LessonCompleteResponse(success=True, coins_awarded=coins_awarded)
