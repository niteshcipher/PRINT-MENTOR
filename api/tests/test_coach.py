import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User, Expense, ChatMessage
from app.services.llm import (
    chat,
    stream_chat,
    json_call,
    build_user_context,
    sanitize_llm_output
)
from routers.coach import get_analysis_questions, submit_analysis_answers, chat_with_coach
from schemas import CoachChatRequest
from services.coins import get_user_balance

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

def test_guardrail_sanitizes_specific_stock_tips_and_adds_projection_note():
    dirty_text = "I recommend you buy RELIANCE shares today with target price of ₹3200! Your portfolio will grow to ₹10 Lakhs."
    clean_text = sanitize_llm_output(dirty_text)
    assert "RELIANCE" not in clean_text or "[Specific security recommendations are blocked" in clean_text
    assert "[Note: Projections are illustrative simulations for learning, not guaranteed predictions.]" in clean_text

def test_llm_chat_and_stream_chat():
    reply = chat("What is an emergency fund?")
    assert len(reply) > 20
    assert "armor" in reply.lower() or "emergency" in reply.lower()

    # Stream generator
    chunks = list(stream_chat("Explain SIP"))
    assert len(chunks) > 1
    assert "".join(chunks).strip() == chat("Explain SIP").strip()

def test_json_call_produces_valid_dict():
    res = json_call("Generate questions for user budget")
    assert isinstance(res, dict)
    assert "questions" in res
    assert len(res["questions"]) > 0

def test_build_user_context(db_session):
    user = User(
        id="context_user",
        category="professional",
        monthly_income=50000,
        fixed_expenses=15000,
        personality="Balanced Planner"
    )
    db_session.add(user)
    db_session.add(Expense(user_id=user.id, amount=5000, category="food", description="Groceries"))
    db_session.commit()

    context = build_user_context(user, db_session)
    assert "professional" in context.lower()
    assert "50,000" in context
    assert "Balanced Planner" in context
    assert "food" in context.lower()

def test_dashboard_analysis_qa_awards_coins(db_session):
    user = User(
        id="qa_user",
        category="gig_worker",
        monthly_income=30000,
        fixed_expenses=10000,
        personality="Impulsive Spender"
    )
    db_session.add(user)
    db_session.commit()

    # 1. Fetch analysis questions
    q_data = get_analysis_questions(user=user, db=db_session)
    assert len(q_data["questions"]) >= 3
    assert len(q_data["starter_chips"]) > 0

    # 2. Submit answers
    answers_payload = {
        "answers": {
            "q1": "Takeout & Zomato",
            "q2": "1-2 months buffer"
        }
    }
    submit_res = submit_analysis_answers(data=answers_payload, user=user, db=db_session)
    assert submit_res["coins_awarded"] == 25
    assert get_user_balance(db_session, user.id) == 25
    assert "Takeout & Zomato" in user.user_insights
