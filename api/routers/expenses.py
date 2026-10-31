import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Expense, CoinLedger
from schemas import ExpenseCreate, ExpenseResponse, ExpenseCreateResponse
from deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])

DAILY_EXPENSE_CAP = 5  # Max 5 rewarded expense logs per day
COINS_PER_EXPENSE = 5

def can_earn_expense_coins(db: Session, user_id: str) -> bool:
    """Checks if the user has reached the daily limit of rewarded expense logs (max 5/day)."""
    today_start = datetime.datetime.now(datetime.UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    count = db.query(CoinLedger).filter(
        CoinLedger.user_id == user_id,
        CoinLedger.reason == "expense_logged",
        CoinLedger.created_at >= today_start
    ).count()
    return count < DAILY_EXPENSE_CAP

@router.get("", response_model=List[ExpenseResponse])
@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id
    ).order_by(Expense.created_at.desc()).limit(limit).all()
    return expenses

@router.post("", response_model=ExpenseCreateResponse)
@router.post("/", response_model=ExpenseCreateResponse)
def log_expense(
    exp_in: ExpenseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if exp_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Expense amount must be greater than 0")

    expense = Expense(
        user_id=user.id,
        amount=exp_in.amount,
        category=exp_in.category,
        description=exp_in.description or ""
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    coins_earned = 0
    if can_earn_expense_coins(db, user.id):
        CoinLedger.append_entry(
            db=db,
            user_id=user.id,
            delta=COINS_PER_EXPENSE,
            reason="expense_logged",
            reference_id=f"expense_{expense.id}"
        )
        coins_earned = COINS_PER_EXPENSE

    return ExpenseCreateResponse(
        id=expense.id,
        amount=expense.amount,
        category=expense.category,
        coins_earned=coins_earned
    )

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"success": True, "message": "Expense deleted", "id": expense_id}
