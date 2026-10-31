import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure api directory is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base, init_db
import app.models

# Routers
from routers.profile import router as profile_router
from routers.budget import router as budget_router
from routers.expenses import router as expenses_router
from routers.sim import router as sim_router
from routers.coins import router as coins_router
from routers.scam import router as scam_router
from routers.glossary import router as glossary_router
from routers.coach import router as coach_router
from routers.games import router as games_router
from routers.learn import router as learn_router
from routers.goals import router as goals_router
from routers.news import router as news_router

# Auto-create SQLite database tables on startup
init_db()

from app.database import SessionLocal
from app.models import User
from seed import seed_demo_data

app = FastAPI(
    title="Pixel Mentor API",
    description="Pixel-art financial literacy game & AI coach for first-time earners in India. Educational only.",
    version="1.0.0"
)

@app.on_event("startup")
def startup_seed_check():
    """Seeds realistic demo data on startup if database is empty or resets."""
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.id == "demo_student_01").first()
        if not demo_user:
            seed_demo_data()
    except Exception as e:
        print(f"Startup seed check note: {e}")
    finally:
        db.close()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints: returns {status: "ok"}
@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/health")
def api_health_check():
    return {"status": "ok"}

# Register feature routers
app.include_router(profile_router)
app.include_router(budget_router)
app.include_router(expenses_router)
app.include_router(sim_router)
app.include_router(coins_router)
app.include_router(scam_router)
app.include_router(glossary_router)
app.include_router(coach_router)
app.include_router(games_router)
app.include_router(learn_router)
app.include_router(goals_router)
app.include_router(news_router)

# Mount same routers under /api prefix for proxy transparency
app.include_router(profile_router, prefix="/api")
app.include_router(budget_router, prefix="/api")
app.include_router(expenses_router, prefix="/api")
app.include_router(sim_router, prefix="/api")
app.include_router(coins_router, prefix="/api")
app.include_router(scam_router, prefix="/api")
app.include_router(glossary_router, prefix="/api")
app.include_router(coach_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(learn_router, prefix="/api")
app.include_router(goals_router, prefix="/api")
app.include_router(news_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "Pixel Mentor API",
        "status": "ok",
        "tagline": "Gamified financial literacy for first-time earners",
        "disclaimer": "Pixel Mentor provides financial education only, never regulated investment advice."
    }
