import os
import sys
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure api directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import (
    User,
    Expense,
    Budget,
    Goal,
    CoinLedger,
    GameSession,
    ChatMessage,
    LessonDone
)

# Test in-memory SQLite database
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

def test_user_creation_and_attributes(db_session):
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = User(
        id=user_id,
        category="student",
        income_type="monthly",
        monthly_income=25000.0,
        fixed_expenses=8000.0,
        personality="Calculated Builder",
        onboarding_completed=True,
        mentor_notes="Test learner profile"
    )
    db_session.add(user)
    db_session.commit()

    saved_user = db_session.query(User).filter(User.id == user_id).first()
    assert saved_user is not None
    assert saved_user.id == user_id
    assert saved_user.category == "student"
    assert saved_user.monthly_income == 25000.0
    assert saved_user.personality == "Calculated Builder"
    assert saved_user.onboarding_completed is True

def test_add_expenses_for_user(db_session):
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = User(id=user_id, category="professional", monthly_income=50000.0)
    db_session.add(user)
    db_session.commit()

    # Add 3 expenses
    exp1 = Expense(user_id=user_id, amount=250.0, category="Food", description="Lunch")
    exp2 = Expense(user_id=user_id, amount=120.0, category="Transport", description="Metro")
    exp3 = Expense(user_id=user_id, amount=1500.0, category="Bills", description="Internet")
    db_session.add_all([exp1, exp2, exp3])
    db_session.commit()

    user_expenses = db_session.query(Expense).filter(Expense.user_id == user_id).all()
    assert len(user_expenses) == 3
    total_spent = sum(e.amount for e in user_expenses)
    assert total_spent == 1870.0

def test_append_only_coin_ledger_and_balance_calculation(db_session):
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = User(id=user_id, category="gig_worker", monthly_income=30000.0)
    db_session.add(user)
    db_session.commit()

    # 1. Initial balance is 0
    initial_bal = CoinLedger.get_balance(db_session, user_id)
    assert initial_bal == 0

    # 2. Append onboarding grant (+100)
    CoinLedger.append_entry(db_session, user_id, delta=100, reason="onboarding_bonus", reference_id="onboard")
    assert CoinLedger.get_balance(db_session, user_id) == 100

    # 3. Append expense log reward (+5)
    CoinLedger.append_entry(db_session, user_id, delta=5, reason="log_expense", reference_id="exp_1")
    assert CoinLedger.get_balance(db_session, user_id) == 105

    # 4. Append game entry fee deduction (-15)
    CoinLedger.append_entry(db_session, user_id, delta=-15, reason="game_entry", reference_id="game_1")
    assert CoinLedger.get_balance(db_session, user_id) == 90

    # 5. Append game victory reward (+30)
    CoinLedger.append_entry(db_session, user_id, delta=30, reason="game_win", reference_id="game_1_win")
    assert CoinLedger.get_balance(db_session, user_id) == 120

    # 6. Verify ledger rows count and immutability
    entries = db_session.query(CoinLedger).filter(CoinLedger.user_id == user_id).all()
    assert len(entries) == 4
    deltas = [e.delta for e in entries]
    assert deltas == [100, 5, -15, 30]
    assert sum(deltas) == 120

def test_all_remaining_models(db_session):
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = User(id=user_id)
    db_session.add(user)
    db_session.commit()

    # Budget
    budget = Budget(user_id=user_id, category="Food", allocated_amount=6000.0, month_year="2026-10")
    db_session.add(budget)

    # Goal
    goal = Goal(user_id=user_id, name="Emergency Shield", target_amount=30000.0, current_amount=5000.0)
    db_session.add(goal)

    # GameSession
    session = GameSession(user_id=user_id, id="sess_123", game_type="crash_survivor", score=85, coins_awarded=40)
    db_session.add(session)

    # ChatMessage
    msg = ChatMessage(user_id=user_id, role="assistant", content="Keep compounding!")
    db_session.add(msg)

    # LessonDone
    lesson = LessonDone(user_id=user_id, lesson_id="lesson_1_50_30_20")
    db_session.add(lesson)

    db_session.commit()

    assert db_session.query(Budget).filter(Budget.user_id == user_id).count() == 1
    assert db_session.query(Goal).filter(Goal.user_id == user_id).count() == 1
    assert db_session.query(GameSession).filter(GameSession.user_id == user_id).count() == 1
    assert db_session.query(ChatMessage).filter(ChatMessage.user_id == user_id).count() == 1
    assert db_session.query(LessonDone).filter(LessonDone.user_id == user_id).count() == 1

