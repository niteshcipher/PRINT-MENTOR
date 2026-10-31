import json
import os
import uuid
import random
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, GameSession
from deps import get_current_user
from app.services.coins import get_user_balance, validate_and_spend, validate_and_earn
from app.services.llm import chat, build_user_context

# Import game scoring modules
from app.games.sip_farm import score_sip_farm
from app.games.crash_survivor import score_crash_survivor
from app.games.scam_detective import score_scam_detective
from app.games.budget_bazaar import score_budget_bazaar
from app.games.inflation_island import score_inflation_island
from app.games.dummy_test import score_dummy_test

router = APIRouter(prefix="/games", tags=["Games"])

GAMES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "games_data.json")

def load_games_data() -> List[Dict[str, Any]]:
    if os.path.exists(GAMES_FILE):
        with open(GAMES_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("games", [])
    return []

# Personality-based difficulty scaling (Part 18)
def get_personality_difficulty(personality: str) -> str:
    mapping = {
        "FOMO Investor": "high_noise",
        "Impulsive Spender": "tight_cashflow",
        "Safe Saver": "high_inflation",
        "Balanced Planner": "normal"
    }
    return mapping.get(personality, "normal")

class GameStartPayload(BaseModel):
    game_id: Optional[str] = None
    game_type: Optional[str] = None

class GameSubmitPayload(BaseModel):
    session_id: str
    decisions: List[Any] = Field(default_factory=list)

@router.get("")
def list_games(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Part 18: Lists all games with entry cost, user best score, and lock/unlock state.
    """
    games = load_games_data()
    balance = get_user_balance(db, user.id)

    # Fetch user's best scores
    best_scores = {}
    sessions = db.query(GameSession).filter(GameSession.user_id == user.id).all()
    for s in sessions:
        if s.game_type not in best_scores or s.score > best_scores[s.game_type]:
            best_scores[s.game_type] = s.score

    enriched_games = []
    for g in games:
        enriched_games.append({
            **g,
            "best_score": best_scores.get(g["id"], None),
            "unlocked": balance >= g.get("entry_cost", 10),
            "difficulty": get_personality_difficulty(user.personality)
        })

    # Include trivial test game to prove loop (Part 18)
    enriched_games.append({
        "id": "dummy_test",
        "name": "Quick Test Simulator",
        "tagline": "Trivial test loop proving the framework mechanics.",
        "entry_cost": 5,
        "reward_coins": 10,
        "category": "framework_test",
        "rules": [
            "This is a 1-step verification game.",
            "Click execute to complete the full loop.",
            "Awards score 100 and confirms coin transactions."
        ],
        "best_score": best_scores.get("dummy_test", None),
        "unlocked": balance >= 5,
        "difficulty": "normal"
    })

    return {
        "user_balance": balance,
        "games": enriched_games
    }

@router.post("/start")
def start_game(
    req: GameStartPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 18: POST /games/start checks and spends entry coins,
    creates a game_sessions row with a seed and personality-scaled difficulty.
    """
    game_type = req.game_id or req.game_type
    games = load_games_data()
    game_info = next((g for g in games if g["id"] == game_type), None)

    if not game_info and game_type != "dummy_test":
        raise HTTPException(status_code=404, detail="Game not found")

    entry_cost = game_info.get("entry_cost", 10) if game_info else 5

    # 1. Deduct entry coins
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    try:
        validate_and_spend(
            db=db,
            user_id=user.id,
            reason=f"game_entry_{game_type}",
            cost=entry_cost,
            reference_id=session_id
        )
    except HTTPException:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient coins. You need {entry_cost} coins to play {game_type}."
        )

    difficulty = get_personality_difficulty(user.personality)
    seed = random.randint(1000, 9999)

    # 2. Record game session
    session = GameSession(
        id=session_id,
        user_id=user.id,
        game_type=game_type,
        score=0,
        decisions="[]",
        replay_summary="",
        coins_awarded=0
    )
    db.add(session)
    db.commit()

    return {
        "session_id": session_id,
        "game_type": game_type,
        "seed": seed,
        "difficulty": difficulty,
        "initial_state": {"game": game_info or {"name": "Test Simulator", "entry_cost": 5, "reward_coins": 10}}
    }

@router.post("/submit")
@router.post("/finish")
def submit_game(
    req: GameSubmitPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 18 & 19: Validates session, scores decisions in game-specific module,
    stores decisions JSON and replay summary, and awards win coins.
    """
    session = db.query(GameSession).filter(
        GameSession.id == req.session_id,
        GameSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    games = load_games_data()
    game_info = next((g for g in games if g["id"] == session.game_type), {})
    reward_pool = 10 if session.game_type == "dummy_test" else game_info.get("reward_coins", 30)

    difficulty = get_personality_difficulty(user.personality)
    decisions = req.decisions

    # Route to game-specific scoring engine
    if session.game_type == "sip_farm":
        res = score_sip_farm(decisions, difficulty)
    elif session.game_type == "crash_survivor":
        res = score_crash_survivor(decisions, difficulty)
    elif session.game_type == "scam_detective":
        res = score_scam_detective(decisions, difficulty)
    elif session.game_type == "budget_bazaar":
        res = score_budget_bazaar(decisions, difficulty)
    elif session.game_type == "inflation_island":
        res = score_inflation_island(decisions, difficulty)
    else:  # dummy_test or fallback
        res = score_dummy_test(decisions, difficulty)

    score = res["score"]
    user_summary = res["user_summary"]
    optimal_summary = res["optimal_summary"]
    mentor_lesson = res["mentor_lesson"]

    # Award win coins
    coins_awarded = reward_pool if score >= 60 else max(5, int(reward_pool * 0.3))
    validate_and_earn(
        db=db,
        user_id=user.id,
        reason=f"game_win_{session.game_type}",
        reference_id=session.id,
        custom_amount=coins_awarded
    )

    replay_dict = {
        "user_result": user_summary,
        "optimal_result": optimal_summary,
        "mentor_lesson": mentor_lesson,
        "score": score
    }

    session.score = score
    session.decisions = json.dumps(decisions)
    session.replay_summary = json.dumps(replay_dict)
    session.coins_awarded = coins_awarded
    db.commit()

    return {
        "score": score,
        "coins_awarded": coins_awarded,
        "replay": replay_dict
    }

@router.get("/{session_id}/replay")
def get_game_replay(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 19: GET /games/{id}/replay returns the player's path and the optimal
    comparison path, with an educational mentor explanation.
    """
    session = db.query(GameSession).filter(
        GameSession.id == session_id,
        GameSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        decisions = json.loads(session.decisions or "[]")
    except Exception:
        decisions = []

    try:
        replay = json.loads(session.replay_summary or "{}")
    except Exception:
        replay = {}

    # Mentor educational commentary
    mentor_notes = replay.get("mentor_lesson", "Patience and discipline yield consistent financial compounding.")

    # Time-series chart points for User vs Optimal comparison
    comparison_curve = [
        {"round": 1, "user_path": 100, "optimal_path": 100},
        {"round": 3, "user_path": 115 if session.score >= 60 else 90, "optimal_path": 125},
        {"round": 6, "user_path": 140 if session.score >= 60 else 85, "optimal_path": 165},
        {"round": 10, "user_path": session.score * 2.2, "optimal_path": 240}
    ]

    return {
        "session_id": session.id,
        "game_type": session.game_type,
        "score": session.score,
        "coins_awarded": session.coins_awarded,
        "decisions": decisions,
        "user_path_summary": replay.get("user_result", "Your decision route"),
        "optimal_path_summary": replay.get("optimal_result", "Disciplined optimal route"),
        "mentor_explanation": mentor_notes,
        "comparison_curve": comparison_curve
    }
