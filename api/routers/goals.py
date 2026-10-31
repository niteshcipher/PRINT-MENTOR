import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Goal
from deps import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    target_amount: float = Field(gt=0)
    current_amount: Optional[float] = Field(default=0.0, ge=0)
    target_date: Optional[str] = ""
    monthly_contribution: Optional[float] = Field(default=0.0, ge=0)

class GoalResponse(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    target_date: Optional[str] = ""
    monthly_contribution: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

DEFAULT_GOALS = [
    {"name": "Emergency Fund", "target_amount": 35000.0, "current_amount": 14000.0, "monthly_contribution": 2000.0},
    {"name": "Coding Laptop", "target_amount": 55000.0, "current_amount": 18500.0, "monthly_contribution": 2500.0},
    {"name": "Electric Bike", "target_amount": 110000.0, "current_amount": 22000.0, "monthly_contribution": 3000.0}
]

def ensure_user_goals(db: Session, user: User) -> List[Goal]:
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    if goals:
        return goals

    # Seed initial goals for user
    created = []
    now = datetime.datetime.utcnow()
    for g in DEFAULT_GOALS:
        target_dt = (now + datetime.timedelta(days=365)).strftime("%Y-%m-%d")
        goal_obj = Goal(
            user_id=user.id,
            name=g["name"],
            target_amount=g["target_amount"],
            current_amount=g["current_amount"],
            target_date=target_dt,
            monthly_contribution=g["monthly_contribution"]
        )
        db.add(goal_obj)
        created.append(goal_obj)
    db.commit()
    return created

@router.get("", response_model=List[GoalResponse])
@router.get("/", response_model=List[GoalResponse])
def get_goals(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ensure_user_goals(db, user)

@router.post("", response_model=GoalResponse)
@router.post("/", response_model=GoalResponse)
def create_goal(
    goal_in: GoalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = Goal(
        user_id=user.id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount or 0.0,
        target_date=goal_in.target_date or "",
        monthly_contribution=goal_in.monthly_contribution or 0.0
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"success": True, "id": goal_id}
