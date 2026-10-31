import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship, Session
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    category = Column(String(32), default="student")
    income_type = Column(String(32), default="monthly")
    monthly_income = Column(Float, default=0.0)
    fixed_expenses = Column(Float, default=0.0)
    personality = Column(String(64), default="Safe Saver")
    onboarding_completed = Column(Boolean, default=False)
    mentor_notes = Column(Text, default="")
    user_insights = Column(Text, default="")
    level = Column(String(16), default="beginner")

    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    coin_entries = relationship("CoinLedger", back_populates="user", cascade="all, delete-orphan")
    game_sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    lessons_done = relationship("LessonDone", back_populates="user", cascade="all, delete-orphan")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="expenses")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    category = Column(String(64), nullable=False)
    allocated_amount = Column(Float, nullable=False)
    month_year = Column(String(7), nullable=False)  # 'YYYY-MM'

    user = relationship("User", back_populates="budgets")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(128), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(String(10), default="")  # 'YYYY-MM-DD'
    monthly_contribution = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="goals")

class CoinLedger(Base):
    """
    APPEND-ONLY LEDGER.
    Entries are strictly immutable.
    Balance is always calculated as the SUM of delta for a given user_id.
    No update or delete helper functions exist for this table.
    """
    __tablename__ = "coin_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    delta = Column(Integer, nullable=False)
    reason = Column(String(128), nullable=False)
    reference_id = Column(String(64), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="coin_entries")

    @classmethod
    def append_entry(cls, db: Session, user_id: str, delta: int, reason: str, reference_id: str = ""):
        """Append-only entry recorder. Cannot modify or remove past rows."""
        entry = cls(
            user_id=user_id,
            delta=delta,
            reason=reason,
            reference_id=reference_id
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @classmethod
    def get_balance(cls, db: Session, user_id: str) -> int:
        """Calculates current user balance by summing all historical delta entries."""
        total = db.query(func.coalesce(func.sum(cls.delta), 0)).filter(cls.user_id == user_id).scalar()
        return int(total or 0)

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    game_type = Column(String(64), nullable=False)
    score = Column(Integer, default=0)
    decisions = Column(Text, default="[]")
    replay_summary = Column(Text, default="")
    coins_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="game_sessions")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    role = Column(String(16), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")

class LessonDone(Base):
    __tablename__ = "lessons_done"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    lesson_id = Column(String(64), nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="lessons_done")

