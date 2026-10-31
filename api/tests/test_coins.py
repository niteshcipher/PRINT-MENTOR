import os
import sys
import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User, CoinLedger
from app.services.coins import (
    EARN_RULES,
    SPEND_RULES,
    get_user_balance,
    validate_and_earn,
    validate_and_spend
)

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

def test_daily_cap_on_expense_logging(db_session):
    user_id = "test_cap_user"
    db_session.add(User(id=user_id, category="student"))
    db_session.commit()

    # Cap is 5 for expense_logged
    for i in range(5):
        res = validate_and_earn(db_session, user_id, "expense_logged", reference_id=f"exp_{i}")
        assert res["success"] is True
        assert res["coins_awarded"] == 5

    assert get_user_balance(db_session, user_id) == 25

    # 6th attempt hits daily cap
    res6 = validate_and_earn(db_session, user_id, "expense_logged", reference_id="exp_6")
    assert res6["success"] is False
    assert res6["cap_reached"] is True
    assert res6["coins_awarded"] == 0
    # Balance remains 25
    assert get_user_balance(db_session, user_id) == 25

def test_one_time_reward_and_double_click_idempotency(db_session):
    user_id = "test_onetime_user"
    db_session.add(User(id=user_id, category="student"))
    db_session.commit()

    # Click 1: Earn onboarding bonus
    click1 = validate_and_earn(db_session, user_id, "onboarding_bonus", reference_id="ref_onboarding")
    assert click1["success"] is True
    assert click1["coins_awarded"] == 100
    assert get_user_balance(db_session, user_id) == 100

    # Click 2 (Simulated rapid double-click): Same user and reason
    click2 = validate_and_earn(db_session, user_id, "onboarding_bonus", reference_id="ref_onboarding")
    assert click2["success"] is False
    assert click2["already_claimed"] is True
    assert click2["coins_awarded"] == 0
    # Balance must remain exactly 100, not 200
    assert get_user_balance(db_session, user_id) == 100

def test_overspending_prevention(db_session):
    user_id = "test_spend_user"
    db_session.add(User(id=user_id, category="student"))
    db_session.commit()

    # Balance starts at 0
    assert get_user_balance(db_session, user_id) == 0

    # Attempt to spend 20 coins with 0 balance -> raises HTTPException 400
    with pytest.raises(HTTPException) as exc_info:
        validate_and_spend(db_session, user_id, "game_entry_crash_survivor", cost=20)
    assert exc_info.value.status_code == 400
    assert "Insufficient coins" in exc_info.value.detail

    # Credit 30 coins
    validate_and_earn(db_session, user_id, "lesson_completed", reference_id="lesson_1", custom_amount=30)
    assert get_user_balance(db_session, user_id) == 30

    # Now spend 20 coins -> succeeds, balance is 10
    spend_res = validate_and_spend(db_session, user_id, "game_entry_crash_survivor", cost=20)
    assert spend_res["success"] is True
    assert spend_res["new_balance"] == 10
    assert get_user_balance(db_session, user_id) == 10

