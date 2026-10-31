from typing import List, Dict, Any

def score_sip_farm(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Evaluates SIP Farm decisions:
    - Consistency: uninterrupted monthly seeds compound higher
    - Skipping reduces harvest compounding momentum
    """
    total_rounds = len(decisions) if decisions else 10
    planted = sum(1 for d in decisions if d.get("action") == "plant")
    skipped = sum(1 for d in decisions if d.get("action") == "skip")

    monthly_amount = 3000
    # Compounding calculation
    accumulated_units = 0
    total_invested = 0
    for r in range(1, total_rounds + 1):
        d = next((item for item in decisions if item.get("round") == r), {"action": "plant"})
        if d.get("action") == "plant":
            total_invested += monthly_amount
            # Bonus units when market dipped
            accumulated_units += 1.0 * (1.05 ** (total_rounds - r))

    final_value = round(accumulated_units * monthly_amount * 1.35)

    if skipped == 0:
        score = 95
        user_summary = f"Perfect discipline across all {total_rounds} seasons! Invested ₹{total_invested:,.0f} growing to ₹{final_value:,.0f}."
        optimal_summary = f"Flawless dollar-cost averaging yielded maximum harvest multiplier (1.78x)."
        mentor_lesson = "Consistent practice beats timing the market! Automated regular investing turns volatile dips into discount buying opportunities."
    elif skipped <= 2:
        score = 75
        user_summary = f"Planted {planted} seasons, but skipped {skipped} seasons. Harvest reached ₹{final_value:,.0f}."
        optimal_summary = "Zero skips would have yielded +22% larger final harvest due to compounding momentum."
        mentor_lesson = "Skipping a few months seems minor, but missed compounding in early years costs thousands in later years."
    else:
        score = 45
        user_summary = f"Skipped {skipped} seasons out of {total_rounds}. Compounding momentum was severely broken."
        optimal_summary = "Disciplined regular investing would have produced nearly double the final harvest."
        mentor_lesson = "An SIP only works as digital armor when you keep feeding it regardless of market weather."

    return {
        "score": score,
        "final_value": final_value,
        "total_invested": total_invested,
        "user_summary": user_summary,
        "optimal_summary": optimal_summary,
        "mentor_lesson": mentor_lesson
    }

