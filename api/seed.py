import os
import sys
import datetime
import random

# Ensure root api is on path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, init_db
from app.models import User, Expense, Budget, Goal, CoinLedger, LessonDone

DEMO_USER_ID = "demo_student_01"

def seed_demo_data():
    """Seeds realistic demo data for one student user."""
    init_db()
    db = SessionLocal()
    try:
        # 1. Clean existing demo user data if present
        existing_user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()

        print(f"Creating demo student user: {DEMO_USER_ID}...")
        now = datetime.datetime.utcnow()
        user = User(
            id=DEMO_USER_ID,
            category="student",
            income_type="stipend",
            monthly_income=18000.0,
            fixed_expenses=4500.0,
            personality="Safe Saver",
            onboarding_completed=True,
            mentor_notes="Disciplined student earner. Manages college stipend, avoids debt, building savings for a laptop upgrade."
        )
        db.add(user)
        db.commit()

        # 2. Add Budgets for current month
        current_month = now.strftime("%Y-%m")
        budget_allocations = [
            ("Food", 4500.0),
            ("Transport", 1500.0),
            ("Bills", 1000.0),
            ("Entertainment", 2000.0),
            ("Books & Supplies", 2000.0),
            ("Investments", 2500.0)
        ]
        for cat, alloc in budget_allocations:
            b = Budget(
                user_id=DEMO_USER_ID,
                category=cat,
                allocated_amount=alloc,
                month_year=current_month
            )
            db.add(b)
        db.commit()

        # 3. Add 1 Target Goal
        print("Adding goal: Coding Laptop Upgrade...")
        goal = Goal(
            user_id=DEMO_USER_ID,
            name="Coding Laptop Upgrade",
            target_amount=55000.0,
            current_amount=16500.0,
            target_date=(now + datetime.timedelta(days=365)).strftime("%Y-%m-%d"),
            monthly_contribution=2500.0
        )
        db.add(goal)
        db.commit()

        # 4. Add 30 Days of realistic student expenses
        print("Inserting 30 days of realistic student expenses...")
        sample_expenses = [
            ("Food", "Campus canteen lunch", 80.0),
            ("Food", "Evening chai & samosa with friends", 45.0),
            ("Transport", "Metro smartcard recharge", 200.0),
            ("Books & Supplies", "Data Structures notebook & pens", 120.0),
            ("Food", "Hostel evening snack", 60.0),
            ("Bills", "Monthly mobile data recharge", 299.0),
            ("Entertainment", "Coding competition registration", 150.0),
            ("Food", "Juice stall near college gate", 50.0),
            ("Transport", "Auto share to railway station", 70.0),
            ("Food", "Weekend dosa treat", 120.0),
            ("Books & Supplies", "Second-hand Algorithms textbook", 350.0),
            ("Food", "Campus canteen thali", 90.0),
            ("Entertainment", "Movie ticket with batchmates", 220.0),
            ("Food", "Chai break", 30.0),
            ("Transport", "Metro token", 40.0),
            ("Food", "Fruit stall bananas & apples", 95.0),
            ("Bills", "College library photocopying", 65.0),
            ("Food", "Canteen lunch", 85.0),
            ("Transport", "Bus pass daily ticket", 35.0),
            ("Food", "Evening snacks", 55.0),
            ("Investments", "Monthly index fund micro-SIP", 1000.0),
            ("Food", "Tea & biscuits", 30.0),
            ("Entertainment", "Spotify student subscription", 59.0),
            ("Food", "Mess food extra egg curry", 50.0),
            ("Transport", "Metro ride to internship", 40.0),
            ("Books & Supplies", "Printouts for project submission", 110.0),
            ("Food", "Campus coffee", 40.0),
            ("Transport", "Metro ride home", 40.0),
            ("Food", "Dinner at local dhaba", 130.0),
            ("Food", "Chai and snacks", 45.0)
        ]

        for day_offset in range(30):
            exp_date = now - datetime.timedelta(days=30 - day_offset, hours=random.randint(1, 10))
            category, desc, amount = sample_expenses[day_offset % len(sample_expenses)]
            exp = Expense(
                user_id=DEMO_USER_ID,
                amount=amount,
                category=category,
                description=desc,
                created_at=exp_date
            )
            db.add(exp)
        db.commit()

        # 5. Add append-only Coin Ledger entries
        print("Adding append-only coin ledger records...")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=100, reason="onboarding_bonus", reference_id="onboard_01")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=20, reason="lesson_complete", reference_id="lesson_1_50_30_20")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=5, reason="log_expense", reference_id="exp_day_1")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=5, reason="log_expense", reference_id="exp_day_2")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=-15, reason="game_entry", reference_id="sip_farm_01")
        CoinLedger.append_entry(db, DEMO_USER_ID, delta=30, reason="game_win", reference_id="sip_farm_win_01")

        # Record completed lesson
        lesson = LessonDone(user_id=DEMO_USER_ID, lesson_id="lesson_1_50_30_20")
        db.add(lesson)
        db.commit()

        balance = CoinLedger.get_balance(db, DEMO_USER_ID)
        print(f"Demo student successfully seeded! Total coin balance = {balance} coins.")
        print(f"Total expenses = {db.query(Expense).filter(Expense.user_id == DEMO_USER_ID).count()} entries.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()

