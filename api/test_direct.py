import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, Base, engine
import models
from services.sim import generate_simulation_data, generate_market_scenarios
from services.scam import analyze_scam_text
from services.personality import determine_personality
from services.coins import award_coins, get_user_balance, spend_coins
from services.budget import get_budget_overview
from routers.glossary import load_glossary
from routers.games import load_games_data
from schemas import OnboardRequest
from routers.profile import onboard_user

def test_direct():
    print("Testing DB models & engine...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Testing Personality Quiz...")
    p, d, t = determine_personality([1, 2, 0, 3])
    print(f"Personality assigned: {p}")
    assert p in ["Safe Saver", "Impulsive Spender", "FOMO Investor", "Calculated Builder"]

    print("Testing Coin Engine...")
    import uuid
    test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
    # Ensure user exists
    user = db.query(models.User).filter(models.User.id == test_user_id).first()
    if not user:
        user = models.User(id=test_user_id, monthly_income=30000.0, fixed_expenses=8000.0)
        db.add(user)
        db.commit()

    award_coins(db, test_user_id, 100, "test_grant", "ref1")
    bal = get_user_balance(db, test_user_id)
    print(f"Balance after award: {bal}")
    assert bal >= 100

    spent = spend_coins(db, test_user_id, 25, "test_spend", "ref2")
    assert spent is True
    bal2 = get_user_balance(db, test_user_id)
    print(f"Balance after spend 25: {bal2}")
    assert bal2 == bal - 25

    print("Testing Simulation...")
    sim = generate_simulation_data(5000, 0, 12.0, 6.0, 5, 250000)
    print(f"Total invested: {sim['total_invested']}, FV: {sim['future_value_nominal']}")
    assert sim['total_invested'] == 300000.0
    assert sim['future_value_nominal'] > 300000.0

    print("Testing Scam Shield...")
    scam = analyze_scam_text("Join our VIP Telegram group for 100% guaranteed 30% weekly return!")
    print(f"Risk Score: {scam['risk_score']}, Verdict: {scam['verdict']}")
    assert scam['risk_score'] >= 60

    print("Testing Glossary & Games data...")
    glossary = load_glossary()
    games = load_games_data()
    print(f"Loaded {len(glossary)} glossary terms, {len(games)} games.")
    assert len(glossary) >= 25
    assert len(games) == 5

    print("Testing Budget Overview...")
    overview = get_budget_overview(db, user)
    print(f"Budget categories: {len(overview['categories'])}, Safe to spend: {overview['gig_mode']['safe_to_spend_today']}")
    assert len(overview['categories']) > 0

    db.close()
    print("\n>>> ALL DIRECT ENGINE TESTS PASSED! <<<")

if __name__ == "__main__":
    test_direct()
