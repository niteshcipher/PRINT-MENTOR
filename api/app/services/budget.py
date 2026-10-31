import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, Expense, Budget

# Default allocation weights per user category
CATEGORY_WEIGHTS = {
    "student": {
        "Food": 0.40,
        "Transport": 0.15,
        "Bills": 0.10,
        "Entertainment": 0.15,
        "Shopping": 0.10,
        "Investments": 0.10
    },
    "professional": {
        "Rent": 0.30,
        "Food": 0.20,
        "Transport": 0.10,
        "Bills": 0.10,
        "Entertainment": 0.10,
        "Investments": 0.20
    },
    "gig_worker": {
        "Food": 0.30,
        "Transport": 0.20,
        "Bills": 0.15,
        "Emergency Buffer": 0.15,
        "Investments": 0.10,
        "Other": 0.10
    }
}

def calculate_category_limits(user: User) -> Dict[str, float]:
    """
    Computes default budget limits adjusted for rent share and user category.
    If rent/fixed expenses exceed 40% of income, discretionary categories are compressed.
    """
    weights = CATEGORY_WEIGHTS.get(user.category, CATEGORY_WEIGHTS["student"]).copy()
    income = max(user.monthly_income, 5000.0)
    fixed = max(user.fixed_expenses, 0.0)
    disposable = max(income - fixed, income * 0.4)

    # Rent share adjustment: if fixed expenses > 40% of income
    fixed_ratio = fixed / income if income > 0 else 0
    if fixed_ratio > 0.40:
        # Scale down entertainment and shopping by 20%
        if "Entertainment" in weights:
            weights["Entertainment"] = round(weights["Entertainment"] * 0.8, 3)
        if "Shopping" in weights:
            weights["Shopping"] = round(weights["Shopping"] * 0.8, 3)

    limits = {}
    for cat, weight in weights.items():
        limits[cat] = round(disposable * weight, 2)
    return limits

def ensure_user_budgets(db: Session, user: User, month_year: str = None) -> List[Budget]:
    if not month_year:
        month_year = datetime.datetime.utcnow().strftime("%Y-%m")

    budgets = db.query(Budget).filter(
        Budget.user_id == user.id,
        Budget.month_year == month_year
    ).all()

    if budgets:
        return budgets

    # Compute default limits
    computed_limits = calculate_category_limits(user)
    created_budgets = []
    for cat, alloc in computed_limits.items():
        b = Budget(
            user_id=user.id,
            category=cat,
            allocated_amount=alloc,
            month_year=month_year
        )
        db.add(b)
        created_budgets.append(b)

    db.commit()
    return created_budgets

def get_budget_summary(db: Session, user: User) -> Dict[str, Any]:
    """
    Computes per-category spent vs limit, savings rate,
    and for gig users the lean-month baseline, buffer target and safe_to_spend_today.
    """
    now = datetime.datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    budgets = ensure_user_budgets(db, user, current_month)

    # Current month's actual expenses
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.created_at >= start_of_month
    ).all()

    # Expenses spent today
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    spent_today = sum(e.amount for e in expenses if e.created_at and e.created_at >= start_of_today)

    spent_by_category: Dict[str, float] = {}
    total_spent = 0.0
    for exp in expenses:
        spent_by_category[exp.category] = spent_by_category.get(exp.category, 0.0) + exp.amount
        total_spent += exp.amount

    categories_list = []
    overbudget_categories = []

    for b in budgets:
        spent = round(spent_by_category.get(b.category, 0.0), 2)
        allocated = round(b.allocated_amount, 2)
        remaining = round(allocated - spent, 2)
        pct = round((spent / allocated) * 100, 1) if allocated > 0 else (100.0 if spent > 0 else 0.0)
        is_over = spent > allocated

        if is_over:
            overbudget_categories.append(b.category)

        categories_list.append({
            "category": b.category,
            "allocated": allocated,
            "spent": spent,
            "remaining": remaining,
            "percentage_used": pct,
            "is_overbudget": is_over
        })

    # Savings rate calculation
    income = user.monthly_income if user.monthly_income > 0 else 25000.0
    effective_savings = max(0.0, income - (total_spent + user.fixed_expenses))
    savings_rate_pct = round((effective_savings / income) * 100, 1)

    # Gig Worker Analysis
    is_gig = (user.category == "gig_worker" or user.income_type == "irregular")
    # For gig users: lean-month baseline is assumed 75% of reported income
    baseline_income = round(user.monthly_income * 0.75 if is_gig else user.monthly_income, 2)
    # Buffer target is 15% of baseline
    buffer_target = round(baseline_income * 0.15, 2) if is_gig else 0.0

    # safe_to_spend_today = ((disposable monthly after fixed and buffer) / 30) - today's variable spent
    disposable_pool = max(0.0, baseline_income - user.fixed_expenses - buffer_target)
    daily_quota = round(disposable_pool / 30.0, 2)
    safe_to_spend_today = max(0.0, round(daily_quota - spent_today, 2))

    mentor_alert = None
    if overbudget_categories:
        mentor_alert = f"Watch out! You've crossed the target limit in {', '.join(overbudget_categories)}. Consider cooling off discretionary spends!"

    return {
        "monthly_income": user.monthly_income,
        "fixed_expenses": user.fixed_expenses,
        "total_spent": round(total_spent, 2),
        "savings_rate_pct": savings_rate_pct,
        "categories": categories_list,
        "overbudget_categories": overbudget_categories,
        "has_overbudget": len(overbudget_categories) > 0,
        "mentor_alert": mentor_alert,
        "gig_mode": {
            "is_gig": is_gig,
            "baseline_income": baseline_income,
            "buffer_target": buffer_target,
            "buffer_saved": 0.0,
            "safe_to_spend_today": safe_to_spend_today,
            "daily_allowance": daily_quota,
            "spent_today": round(spent_today, 2)
        }
    }
