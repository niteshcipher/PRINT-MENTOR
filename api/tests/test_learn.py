import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User
from schemas import LessonCompleteRequest
from routers.glossary import get_glossary, get_term_definition
from routers.learn import get_lessons, complete_lesson
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

def test_glossary_has_at_least_30_indian_finance_terms_with_levels():
    terms = get_glossary()
    assert len(terms) >= 30
    term_names = [t["term"] for t in terms]
    assert any("SIP" in t for t in term_names)
    assert any("Index Fund" in t for t in term_names)
    assert any("Compounding" in t for t in term_names)

    # Verify simple, intermediate, and analogy exist
    for t in terms:
        assert "simple" in t or "simple_def" in t
        assert "intermediate" in t or "intermediate_def" in t
        assert "analogy" in t

def test_term_lookup():
    sip = get_term_definition("SIP")
    assert "simple" in sip or "simple_def" in sip
    assert "intermediate" in sip or "intermediate_def" in sip
    assert "analogy" in sip

def test_eight_short_lessons_with_mini_quizzes(db_session):
    user = User(id="quizzer", category="student", monthly_income=12000, fixed_expenses=4000)
    db_session.add(user)
    db_session.commit()

    lessons = get_lessons(user=user, db=db_session)
    assert len(lessons) == 8

    for lesson in lessons:
        assert "quiz" in lesson
        quiz = lesson["quiz"]
        assert "question" in quiz
        assert len(quiz["options"]) >= 3
        assert 0 <= quiz["correct"] < len(quiz["options"])
        assert len(quiz["explanation"]) > 10

def test_lesson_completion_is_idempotent(db_session):
    user = User(id="learner1", category="student", monthly_income=10000, fixed_expenses=3000)
    db_session.add(user)
    db_session.commit()

    lessons = get_lessons(user=user, db=db_session)
    first_lesson_id = lessons[0]["id"]
    reward = lessons[0]["coins_reward"]

    # First completion awards coins
    res1 = complete_lesson(req=LessonCompleteRequest(lesson_id=first_lesson_id), user=user, db=db_session)
    assert res1.coins_awarded == reward
    assert get_user_balance(db_session, user.id) == reward

    # Second completion of the same lesson does NOT double-reward
    res2 = complete_lesson(req=LessonCompleteRequest(lesson_id=first_lesson_id), user=user, db=db_session)
    assert res2.coins_awarded == 0
    assert get_user_balance(db_session, user.id) == reward
