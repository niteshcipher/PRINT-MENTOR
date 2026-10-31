import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pixel_mentor.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Auto-creates all tables in the SQLite database on startup and migrates columns."""
    import app.models  # Ensure models are registered
    Base.metadata.create_all(bind=engine)

    # Safe SQLite column migration for added columns
    try:
        with engine.connect() as conn:
            for col, col_type in [("user_insights", "TEXT DEFAULT ''"), ("level", "VARCHAR(16) DEFAULT 'beginner'")]:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

