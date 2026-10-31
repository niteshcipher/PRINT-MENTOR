from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models import User, CoinLedger
from schemas import CoinBalanceResponse, CoinSpendRequest, CoinSpendResponse
from deps import get_current_user
from app.services.coins import (
    EARN_RULES,
    SPEND_RULES,
    get_user_balance,
    validate_and_earn,
    validate_and_spend
)

router = APIRouter(prefix="/coins", tags=["Coins"])

class CoinEarnRequest(BaseModel):
    amount: Optional[int] = None
    reason: str = Field(default="expense_logged")
    reference_id: Optional[str] = ""

class CoinEarnResponse(BaseModel):
    success: bool
    coins_awarded: int
    new_balance: int
    already_claimed: bool = False
    cap_reached: bool = False
    detail: Optional[str] = None

@router.get("/rules")
def get_rules():
    return {
        "earn_rules": EARN_RULES,
        "spend_rules": SPEND_RULES
    }

@router.get("/balance", response_model=CoinBalanceResponse)
def get_balance(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    balance = get_user_balance(db, user.id)
    history = db.query(CoinLedger).filter(
        CoinLedger.user_id == user.id
    ).order_by(CoinLedger.created_at.desc()).limit(30).all()
    return CoinBalanceResponse(balance=balance, history=history)

@router.post("/earn", response_model=CoinEarnResponse)
def earn_coins(
    req: CoinEarnRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 17: Validates earn rules:
    - Server-side validation: cannot earn the same one-time reward twice.
    - Server-side validation: enforces daily caps.
    - Double-clicking earn button does not double the reward.
    """
    result = validate_and_earn(
        db=db,
        user_id=user.id,
        reason=req.reason,
        reference_id=req.reference_id or "",
        custom_amount=req.amount
    )
    return CoinEarnResponse(**result)

@router.post("/spend", response_model=CoinSpendResponse)
def spend(
    req: CoinSpendRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 17: Validates spend rules:
    - Server-side validation: cannot spend more than the balance (returns 400).
    """
    result = validate_and_spend(
        db=db,
        user_id=user.id,
        reason=req.reason,
        cost=req.cost,
        reference_id=req.reference_id or ""
    )
    return CoinSpendResponse(success=True, new_balance=result["new_balance"])
