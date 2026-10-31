from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CoinLedger
import datetime

def get_current_user(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency: Reads the X-User-Id header.
    Rejects requests with missing X-User-Id header with 400 Bad Request.
    If valid header is provided, retrieves or auto-creates the user row on first sight.
    """
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Missing required header: X-User-Id"
        )
    
    user_id = x_user_id.strip()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Auto-create user row on first sight
        user = User(
            id=user_id,
            category="student",
            income_type="monthly",
            monthly_income=20000.0,
            fixed_expenses=5000.0,
            personality="Safe Saver",
            onboarding_completed=False,
            mentor_notes="First-time visitor. Needs foundational orientation."
        )
        db.add(user)
        # Give initial welcome entry (append-only ledger)
        CoinLedger.append_entry(
            db=db,
            user_id=user_id,
            delta=50,
            reason="first_visit_grant",
            reference_id="welcome"
        )
        db.commit()
        db.refresh(user)

    return user
