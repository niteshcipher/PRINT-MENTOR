from typing import List, Dict, Any

def score_inflation_island(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Evaluates Inflation Island:
    15-year simulation (2010 to 2025) comparing cash under mattress vs index fund compounding.
    """
    strategy = "cash"
    if decisions and isinstance(decisions[0], dict):
        strategy = decisions[0].get("strategy", "cash")

    if strategy == "cash":
        score = 35
        user_summary = "Held ₹1,00,000 cash under a mattress. After 15 years, real purchasing power dropped to ₹38,200 (-61.8% loss)."
        optimal_summary = "Investing in NIFTY 50 Index Fund grew ₹1,00,000 into ₹5,47,000, crushing inflation by 5.47x."
        mentor_lesson = "Cash feels 'safe' day to day, but over decades, inflation guarantees permanent destruction of purchasing power."
    elif strategy == "balanced":
        score = 80
        user_summary = "Balanced 50/50 approach yielded ₹3,23,000, providing stability while still beating inflation."
        optimal_summary = "100% Index allocation over a 15-year horizon produced ₹5,47,000 in real capital growth."
        mentor_lesson = "Asset allocation gives you sleep-at-night comfort while protecting against inflation erosion."
    else:  # index
        score = 98
        user_summary = "Full equity index compounding! Your ₹1,00,000 compounded at ~12% CAGR, growing to ₹5,47,000 across 15 years."
        optimal_summary = "Patience and diversified equity ownership created 5.47x real wealth expansion."
        mentor_lesson = "Compounding equity returns beat the silent wealth-destroyer of inflation every single time."

    return {
        "score": score,
        "strategy": strategy,
        "user_summary": user_summary,
        "optimal_summary": optimal_summary,
        "mentor_lesson": mentor_lesson
    }

