from typing import List, Dict, Any

def score_budget_bazaar(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Evaluates Budget Bazaar:
    4 weekly life events. User chooses between Emergency Buffer, Cutting Wants, or Credit Card debt.
    """
    total = len(decisions) if decisions else 4
    debt_count = sum(1 for d in decisions if d.get("choice_id") == "debt")
    buffer_for_wants = sum(1 for d in decisions if d.get("choice_id") == "buffer" and not d.get("is_emergency", False))

    if debt_count > 0:
        score = max(25, 80 - (debt_count * 25))
        user_summary = f"Took revolving credit card / BNPL debt {debt_count} time(s) to fund surprises."
        optimal_summary = "Use emergency buffer exclusively for real medical/repair emergencies, and trim wants for social events."
        mentor_lesson = "High-interest consumer credit cards charge 36% to 42% APR. Borrowing for discretionary spending is financial self-sabotage."
    elif buffer_for_wants > 0:
        score = 65
        user_summary = "Drained emergency savings for non-essential vacations or festive shopping."
        optimal_summary = "Keep emergency reserves strictly cordoned off from lifestyle FOMO."
        mentor_lesson = "Your emergency buffer is life armor, not bonus pocket money. Once drained, a real crisis leaves you defenseless."
    else:
        score = 95
        user_summary = "Flawless cashflow navigation! Buffered true shocks while keeping lifestyle wants within boundaries."
        optimal_summary = "Disciplined 50/30/20 allocation absorbed all 4 life shocks with zero high-interest debt."
        mentor_lesson = "Having cash reserves gives you the superpower to absorb life's unexpected surprises without stress."

    return {
        "score": score,
        "debt_count": debt_count,
        "user_summary": user_summary,
        "optimal_summary": optimal_summary,
        "mentor_lesson": mentor_lesson
    }

