import os
import sys
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User, Expense, Budget
from app.services.budget import get_budget_summary, calculate_category_limits

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_fixed_income_professional_budget(db_session):
    user_id = f"pro_{uuid.uuid4().hex[:6]}"
    user = User(
        id=user_id,
        category="professional",
        income_type="monthly",
        monthly_income=50000.0,
        fixed_expenses=15000.0
    )
    db_session.add(user)
    db_session.commit()

    summary = get_budget_summary(db_session, user)
    assert summary["monthly_income"] == 50000.0
    assert summary["fixed_expenses"] == 15000.0
    assert summary["gig_mode"]["is_gig"] is False
    assert len(summary["categories"]) > 0
    # Professional has 20% investment share
    cats = {c["category"]: c["allocated"] for c in summary["categories"]}
    assert "Investments" in cats

def test_irregular_income_gig_mode(db_session):
    user_id = f"gig_{uuid.uuid4().hex[:6]}"
    user = User(
        id=user_id,
        category="gig_worker",
        income_type="irregular",
        monthly_income=30000.0,
        fixed_expenses=8000.0
    )
    db_session.add(user)
    db_session.commit()

    summary = get_budget_summary(db_session, user)
    assert summary["gig_mode"]["is_gig"] is True
    # Lean-month baseline is 75% of 30,000 = 22,500
    assert summary["gig_mode"]["baseline_income"] == 22500.0
    # Buffer target is 15% of 22,500 = 3,375
    assert summary["gig_mode"]["buffer_target"] == 3375.0
    # Safe to spend today must be positive
    assert summary["gig_mode"]["safe_to_spend_today"] > 0

def test_overspending_scenario(db_session):
    user_id = f"spender_{uuid.uuid4().hex[:6]}"
    user = User(
        id=user_id,
        category="student",
        income_type="monthly",
        monthly_income=15000.0,
        fixed_expenses=3000.0
    )
    db_session.add(user)
    db_session.commit()

    # Budget summary creates default budgets (Food limit ~4800)
    summary_before = get_budget_summary(db_session, user)
    food_cat = next(c for c in summary_before["categories"] if c["category"] == "Food")
    limit = food_cat["allocated"]

    # Log expense that exceeds limit (e.g. limit + 1000)
    over_expense = Expense(
        user_id=user.id,
        amount=limit + 1000.0,
        category="Food",
        description="Fancy party"
    )
    db_session.add(over_expense)
    db_session.commit()

    summary_after = get_budget_summary(db_session, user)
    assert summary_after["has_overbudget"] is True
    assert "Food" in summary_after["overbudget_categories"]
    assert summary_after["mentor_alert"] is not None
    assert "Food" in summary_after["mentor_alert"]

