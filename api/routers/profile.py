from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Goal, CoinLedger
from schemas import ProfileResponse
from deps import get_current_user
from app.services.personality import determine_personality
from app.services.budget import ensure_user_budgets

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileOnboardPayload(BaseModel):
    category: str = Field(default="student")          # student | professional | gig_worker
    income_type: str = Field(default="monthly")        # monthly | irregular | stipend
    monthly_income: float = Field(default=25000.0, ge=0)
    fixed_expenses: float = Field(default=8000.0, ge=0)
    goal_name: str = Field(default="Emergency Fund")
    goal_target_amount: float = Field(default=50000.0, gt=0)
    goal_target_date: Optional[str] = ""
    quiz_answers: List[int] = Field(default=[1, 1, 1, 1], min_length=4, max_length=4)

@router.get("", response_model=ProfileResponse)
@router.get("/", response_model=ProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    balance = CoinLedger.get_balance(db, user.id)
    return ProfileResponse(
        user_id=user.id,
        category=user.category,
        income_type=user.income_type,
        monthly_income=user.monthly_income,
        fixed_expenses=user.fixed_expenses,
        personality=user.personality,
        onboarding_completed=user.onboarding_completed,
        coins=balance,
        created_at=user.created_at
    )

@router.post("", response_model=dict)
@router.post("/", response_model=dict)
@router.post("/onboard", response_model=dict)
def save_profile_and_onboard(
    req: ProfileOnboardPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    personality_type, desc, tip = determine_personality(req.quiz_answers)

    user.category = req.category
    user.income_type = req.income_type
    user.monthly_income = req.monthly_income
    user.fixed_expenses = req.fixed_expenses
    user.personality = personality_type
    user.onboarding_completed = True
    user.mentor_notes = f"Completed onboarding as {personality_type}. Primary goal: {req.goal_name} (₹{req.goal_target_amount}). Advice: {tip}"

    # Setup initial goal
    goal = Goal(
        user_id=user.id,
        name=req.goal_name,
        target_amount=req.goal_target_amount,
        current_amount=0.0,
        target_date=req.goal_target_date or "",
        monthly_contribution=round(req.monthly_income * 0.15, 2)
    )
    db.add(goal)
    db.commit()

    # Create default budget allocations
    ensure_user_budgets(db, user)

    # Award onboarding bonus coins (100 coins) via append-only ledger
    CoinLedger.append_entry(
        db=db,
        user_id=user.id,
        delta=100,
        reason="onboarding_bonus",
        reference_id="onboard_complete"
    )

    mentor_reaction = f"Welcome aboard, {personality_type}! I have deposited your +100 bonus coins. Let's start building your financial armor!"

    return {
        "success": True,
        "personality": personality_type,
        "personality_type": personality_type,
        "personality_description": desc,
        "mentor_tip": tip,
        "mentor_reaction": mentor_reaction,
        "starting_coins": 100,
        "user_id": user.id
    }

# Alias for backwards compatibility
onboard_user = save_profile_and_onboard
