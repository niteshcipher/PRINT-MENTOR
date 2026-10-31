from typing import List, Dict, Any

def score_crash_survivor(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Evaluates Crash Survivor:
    - Panic Sell: converts temporary paper drop into permanent cash loss
    - Hold Firm: portfolio fully recovers
    - Buy The Dip: captures highest recovery alpha (+28%)
    """
    action = "hold"
    if decisions and isinstance(decisions[0], dict):
        action = decisions[0].get("action", "hold")

    if action == "sell":
        score = 30
        user_summary = "You panic-sold at the -30% bottom, turning ₹1,00,000 into ₹70,000 in permanent cash loss."
        optimal_summary = "Holding firm or buying the dip yielded +28% total recovery over the next 18 months."
        mentor_lesson = "Market crashes trigger fight-or-flight panic. But selling locks in the loss. Market recoveries belong to those who stay invested."
    elif action == "hold":
        score = 85
        user_summary = "You held firm through the storm. Your ₹1,00,000 fully recovered to ₹1,14,000 as economic health returned."
        optimal_summary = "Buying the 30% discount would have pushed your final portfolio to ₹1,28,000."
        mentor_lesson = "Patience is a great investor superpower. Doing nothing during a panic is far better than panic-selling."
    else:  # buy
        score = 98
        user_summary = "Masterclass! You treated the 30% drop as a mega festival sale and bought the dip. Portfolio surged to ₹1,28,000!"
        optimal_summary = "Maximized return by dollar-cost averaging into premier assets during market pessimism."
        mentor_lesson = "Be fearful when others are greedy, and greedy when others are fearful. Dips are compounding gifts."

    return {
        "score": score,
        "user_summary": user_summary,
        "optimal_summary": optimal_summary,
        "mentor_lesson": mentor_lesson
    }

