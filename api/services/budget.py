from app.services.budget import (
    CATEGORY_WEIGHTS,
    calculate_category_limits,
    ensure_user_budgets,
    get_budget_summary
)

def get_budget_overview(db, user):
    """Alias for backwards compatibility."""
    return get_budget_summary(db, user)
