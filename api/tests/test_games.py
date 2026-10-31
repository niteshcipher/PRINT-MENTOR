import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User, GameSession
from routers.games import list_games, start_game, submit_game, get_game_replay, GameStartPayload, GameSubmitPayload
from services.coins import validate_and_earn, get_user_balance

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

def test_list_games_returns_all_games_and_dummy_test(db_session):
    user = User(id="gamer1", category="student", monthly_income=15000, fixed_expenses=5000)
    db_session.add(user)
    db_session.commit()

    res = list_games(user=user, db=db_session)
    assert "games" in res
    game_ids = [g["id"] for g in res["games"]]
    assert "sip_farm" in game_ids
    assert "crash_survivor" in game_ids
    assert "scam_detective" in game_ids
    assert "budget_bazaar" in game_ids
    assert "inflation_island" in game_ids
    assert "dummy_test" in game_ids

def test_dummy_game_loop_and_coins_flow(db_session):
    user = User(id="dummy_gamer", category="professional", personality="FOMO Investor", monthly_income=50000, fixed_expenses=20000)
    db_session.add(user)
    db_session.commit()

    # Credit 20 coins
    validate_and_earn(db_session, user.id, "lesson_completed", reference_id="setup", custom_amount=20)
    assert get_user_balance(db_session, user.id) == 20

    # Start dummy_test (costs 5 coins)
    start_res = start_game(req=GameStartPayload(game_id="dummy_test"), user=user, db=db_session)
    assert start_res["session_id"] is not None
    assert start_res["difficulty"] == "high_noise"  # Scaled for FOMO Investor
    assert get_user_balance(db_session, user.id) == 15

    # Submit decisions
    submit_res = submit_game(
        req=GameSubmitPayload(session_id=start_res["session_id"], decisions=[{"action": "test"}]),
        user=user,
        db=db_session
    )
    assert submit_res["score"] == 100
    assert submit_res["coins_awarded"] == 10
    # 15 + 10 = 25 coins
    assert get_user_balance(db_session, user.id) == 25

    # Fetch replay
    replay_res = get_game_replay(session_id=start_res["session_id"], user=user, db=db_session)
    assert "comparison_curve" in replay_res
    assert len(replay_res["comparison_curve"]) > 0
    assert "mentor_explanation" in replay_res
