import sys
import os
import asyncio
import httpx

sys.path.append(os.path.dirname(__file__))
from main import app

TEST_USER_HEADER = {"X-User-Id": "test_player_001"}

async def run_all_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("1. Testing Root & Health...", flush=True)
        resp = await client.get("/")
        assert resp.status_code == 200
        assert "Pixel Mentor" in resp.json()["app"]

        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

        print("2. Testing Profile & Onboard...", flush=True)
        resp = await client.get("/profile", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_id"] == "test_player_001"
        assert data["coins"] >= 50

        onboard_payload = {
            "category": "professional",
            "income_type": "monthly",
            "monthly_income": 45000.0,
            "fixed_expenses": 15000.0,
            "goal_name": "Emergency Fund",
            "goal_target_amount": 100000.0,
            "quiz_answers": [1, 2, 1, 1]
        }
        resp = await client.post("/profile/onboard", headers=TEST_USER_HEADER, json=onboard_payload)
        assert resp.status_code == 200
        res_data = resp.json()
        assert res_data["success"] is True
        assert "personality" in res_data
        assert res_data["starting_coins"] == 100

        print("3. Testing Budget & Expenses...", flush=True)
        exp_payload = {
            "amount": 250.0,
            "category": "Food",
            "description": "Lunch box"
        }
        resp = await client.post("/expenses", headers=TEST_USER_HEADER, json=exp_payload)
        assert resp.status_code == 200
        assert resp.json()["coins_earned"] == 5

        resp = await client.get("/budget", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        b_data = resp.json()
        assert b_data["monthly_income"] == 45000.0
        assert len(b_data["categories"]) > 0

        print("4. Testing Simulation...", flush=True)
        sim_payload = {
            "monthly_investment": 5000.0,
            "lump_sum": 0.0,
            "annual_return_pct": 12.0,
            "inflation_rate_pct": 6.0,
            "duration_years": 5,
            "goal_amount": 300000.0
        }
        resp = await client.post("/sim/calculate", json=sim_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_invested"] == 300000.0
        assert data["future_value_nominal"] > 300000.0
        assert "disclaimer" in data

        resp = await client.post("/sim/scenarios", json={"monthly_investment": 5000.0, "seed": 42})
        assert resp.status_code == 200
        assert "crash" in resp.json()["scenarios"]

        print("5. Testing Scam Shield...", flush=True)
        scam_msg = {
            "message": "Join our VIP Telegram group for 100% guaranteed 30% weekly returns!"
        }
        resp = await client.post("/scam/analyze", json=scam_msg)
        assert resp.status_code == 200
        res = resp.json()
        assert res["risk_score"] >= 60
        assert len(res["flagged_keywords"]) > 0

        print("6. Testing Glossary...", flush=True)
        resp = await client.get("/glossary")
        assert resp.status_code == 200
        terms = resp.json()
        assert len(terms) >= 25

        resp = await client.get("/glossary/SIP")
        assert resp.status_code == 200
        assert "SIP" in resp.json()["term"]

        print("7. Testing Coach & Guardrails...", flush=True)
        resp = await client.get("/coach/starter-questions", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        assert len(resp.json()["questions"]) > 0

        chat_payload = {"message": "Should I buy Tata Motors stock right now?"}
        resp = await client.post("/coach/chat", headers=TEST_USER_HEADER, json=chat_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "disclaimer" in data

        print("8. Testing Games & Mistake Replay...", flush=True)
        resp = await client.get("/games", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        games = resp.json()["games"]
        assert len(games) == 5

        resp = await client.post("/games/start", headers=TEST_USER_HEADER, json={"game_type": "crash_survivor"})
        assert resp.status_code == 200
        sess_id = resp.json()["session_id"]

        finish_payload = {
            "session_id": sess_id,
            "decisions": [{"round": 1, "action": "sell"}]
        }
        resp = await client.post("/games/finish", headers=TEST_USER_HEADER, json=finish_payload)
        assert resp.status_code == 200
        f_data = resp.json()
        assert "replay" in f_data

        print("9. Testing Learn Lessons & Coin Economy...", flush=True)
        resp = await client.get("/learn/lessons", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        assert len(resp.json()) >= 4

        resp = await client.post("/learn/complete", headers=TEST_USER_HEADER, json={"lesson_id": "lesson_1_50_30_20"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        # Check coin balance and ledger
        resp = await client.get("/coins/balance", headers=TEST_USER_HEADER)
        assert resp.status_code == 200
        assert resp.json()["balance"] > 0
        assert len(resp.json()["history"]) > 0

        print("\n>>> ALL 9 PIXEL MENTOR API MODULES PASSED ALL VERIFICATIONS! <<<", flush=True)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
