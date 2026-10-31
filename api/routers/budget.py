from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app.models import User, Budget
from schemas import BudgetResponse, BudgetUpdateRequest
from deps import get_current_user
from app.services.budget import get_budget_summary

router = APIRouter(prefix="/budget", tags=["Budget"])

@router.get("/summary")
@router.get("", response_model=BudgetResponse)
@router.get("/")
def get_budget(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = get_budget_summary(db, user)
    return summary

@router.post("/limits")
def update_budget_limits(
    req: BudgetUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_month = datetime.datetime.now(datetime.UTC).strftime("%Y-%m")
    for item in req.categories:
        b = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.category == item.category,
            Budget.month_year == current_month
        ).first()
        if b:
            b.allocated_amount = item.allocated
        else:
            b = Budget(
                user_id=user.id,
                category=item.category,
                allocated_amount=item.allocated,
                month_year=current_month
            )
            db.add(b)
    db.commit()
    return {"success": True, "message": "Budget limits updated."}
