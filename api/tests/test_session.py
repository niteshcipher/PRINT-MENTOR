import os
import sys
import uuid
import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure api directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base
from app.models import User
from deps import get_current_user
from routers.profile import get_profile

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

def test_missing_user_id_header_returns_400(db_session):
    """Verify that requests with empty or missing X-User-Id header are rejected with 400 Bad Request."""
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(x_user_id=None, db=db_session)
    assert exc_info.value.status_code == 400
    assert "Missing required header: X-User-Id" in exc_info.value.detail

    with pytest.raises(HTTPException) as exc_info_empty:
        get_current_user(x_user_id="   ", db=db_session)
    assert exc_info_empty.value.status_code == 400

def test_auto_create_user_on_first_sight(db_session):
    """Verify that providing a new UUID X-User-Id header creates the user row on first sight."""
    random_user_id = str(uuid.uuid4())

    # First sight: auto-creates user
    user = get_current_user(x_user_id=random_user_id, db=db_session)
    assert user is not None
    assert user.id == random_user_id
    assert user.category == "student"
    assert user.onboarding_completed is False

    # Check GET /profile logic
    profile = get_profile(user=user, db=db_session)
    assert profile.user_id == random_user_id
    assert profile.category == "student"
    assert profile.coins >= 50

    # Second request with the same user_id returns the existing user (idempotent identity)
    user_again = get_current_user(x_user_id=random_user_id, db=db_session)
    assert user_again.id == random_user_id
    assert user_again.created_at == user.created_at

    # Total user count in database remains 1
    total_users = db_session.query(User).filter(User.id == random_user_id).count()
    assert total_users == 1
