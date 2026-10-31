import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import CoinLedger
from fastapi import HTTPException

EARN_RULES: Dict[str, Dict[str, Any]] = {
    "onboarding_bonus": {
        "amount": 100,
        "daily_cap": None,
        "one_time": True,
        "description": "Onboarding completed and money personality assigned"
    },
    "expense_logged": {
        "amount": 5,
        "daily_cap": 5,
        "one_time": False,
        "description": "Logged an expense to maintain daily budget awareness"
    },
    "lesson_completed": {
        "amount": 20,
        "daily_cap": None,
        "one_time": True,
        "description": "Read a financial literacy lesson and passed mini-quiz"
    },
    "budget_adherence": {
        "amount": 30,
        "daily_cap": 1,
        "one_time": False,
        "description": "Kept monthly discretionary expenses within limits"
    },
    "dashboard_analysis_qa": {
        "amount": 25,
        "daily_cap": None,
        "one_time": True,
        "description": "Answered personalized mentor analysis Q&A"
    },
    "game_win": {
        "amount": 30,
        "daily_cap": None,
        "one_time": False,
        "description": "Completed arcade simulation challenge with positive score"
    }
}

SPEND_RULES: Dict[str, Dict[str, Any]] = {
    "game_entry_sip_farm": {"cost": 15, "description": "SIP Farm 10-season simulation entry"},
    "game_entry_crash_survivor": {"cost": 20, "description": "Crash Survivor crisis simulation entry"},
    "game_entry_scam_detective": {"cost": 10, "description": "Scam Detective 8-tip inspection entry"},
    "game_entry_budget_bazaar": {"cost": 15, "description": "Budget Bazaar 4-week shock survival entry"},
    "game_entry_inflation_island": {"cost": 15, "description": "Inflation Island 15-year compounding entry"},
    "level_unlock": {"cost": 50, "description": "Advanced intermediate financial module unlock"}
}

def get_user_balance(db: Session, user_id: str) -> int:
    """Calculates balance by summing delta across all user ledger entries."""
    total = db.query(func.coalesce(func.sum(CoinLedger.delta), 0)).filter(CoinLedger.user_id == user_id).scalar()
    return int(total or 0)

def validate_and_earn(
    db: Session,
    user_id: str,
    reason: str,
    reference_id: str = "",
    custom_amount: Optional[int] = None
) -> Dict[str, Any]:
    """
    Validates earn rules:
    - Server-side validation: cannot earn the same one-time reward twice (idempotency).
    - Server-side validation: enforces daily caps.
    - Double-clicking earn button does not double the reward.
    """
    rule = EARN_RULES.get(reason, {
        "amount": custom_amount or 5,
        "daily_cap": None,
        "one_time": False
    })

    amount = custom_amount if custom_amount is not None else rule["amount"]

    # 1. One-time validation
    if rule.get("one_time", False):
        query = db.query(CoinLedger).filter(
            CoinLedger.user_id == user_id,
            CoinLedger.reason == reason
        )
        if reference_id:
            query = query.filter(CoinLedger.reference_id == reference_id)
        existing = query.first()
        if existing:
            return {
                "success": False,
                "already_claimed": True,
                "detail": "One-time reward already claimed.",
                "coins_awarded": 0,
                "new_balance": get_user_balance(db, user_id)
            }

    # 2. Daily cap validation
    daily_cap = rule.get("daily_cap")
    if daily_cap is not None:
        today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        count_today = db.query(CoinLedger).filter(
            CoinLedger.user_id == user_id,
            CoinLedger.reason == reason,
            CoinLedger.created_at >= today_start
        ).count()
        if count_today >= daily_cap:
            return {
                "success": False,
                "cap_reached": True,
                "detail": f"Daily limit reached (max {daily_cap} per day).",
                "coins_awarded": 0,
                "new_balance": get_user_balance(db, user_id)
            }

    # Append immutable row
    entry = CoinLedger.append_entry(
        db=db,
        user_id=user_id,
        delta=amount,
        reason=reason,
        reference_id=reference_id
    )

    new_balance = get_user_balance(db, user_id)
    return {
        "success": True,
        "already_claimed": False,
        "cap_reached": False,
        "coins_awarded": amount,
        "new_balance": new_balance
    }

def validate_and_spend(
    db: Session,
    user_id: str,
    reason: str,
    cost: Optional[int] = None,
    reference_id: str = ""
) -> Dict[str, Any]:
    """
    Validates spend rules:
    - Cannot spend more than current balance (rejects with 400).
    - Appends negative delta to coin_ledger.
    """
    rule_cost = cost
    if rule_cost is None:
        rule_info = SPEND_RULES.get(reason)
        rule_cost = rule_info["cost"] if rule_info else 10

    if rule_cost <= 0:
        return {"success": True, "new_balance": get_user_balance(db, user_id)}

    current_balance = get_user_balance(db, user_id)
    if current_balance < rule_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient coins. Required: {rule_cost}, Current Balance: {current_balance}."
        )

    CoinLedger.append_entry(
        db=db,
        user_id=user_id,
        delta=-rule_cost,
        reason=reason,
        reference_id=reference_id
    )

    new_balance = get_user_balance(db, user_id)
    return {
        "success": True,
        "cost": rule_cost,
        "new_balance": new_balance
    }

# Backward compatible helpers
def award_coins(db: Session, user_id: str, delta: int, reason: str, reference_id: str = "") -> int:
    res = validate_and_earn(db, user_id, reason, reference_id=reference_id, custom_amount=delta)
    return res["new_balance"]

def spend_coins(db: Session, user_id: str, cost: int, reason: str, reference_id: str = "") -> bool:
    try:
        validate_and_spend(db, user_id, reason, cost=cost, reference_id=reference_id)
        return True
    except HTTPException:
        return False

