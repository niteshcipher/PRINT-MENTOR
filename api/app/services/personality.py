from typing import List, Tuple, Dict, Any

PERSONALITY_PROFILES = {
    "Safe Saver": {
        "title": "Safe Saver",
        "description": "You prioritize capital safety and emergency cushions above all. You dislike volatility and prefer assured progress, but need to watch out for inflation silently eroding idle cash.",
        "tip": "Protect your emergency fund first, then slowly introduce low-risk broad index funds to beat inflation."
    },
    "Balanced Planner": {
        "title": "Balanced Planner",
        "description": "You balance smart spending with regular savings. You understand that market fluctuations are normal and focus on long-term discipline through automated investing.",
        "tip": "Automate your monthly SIP and review your asset allocation annually without stressing over daily price swings."
    },
    "Impulsive Spender": {
        "title": "Impulsive Spender",
        "description": "You enjoy instant lifestyle rewards and treating peers. Daily discretionary splurges can quietly drain your potential investment seed capital before you notice.",
        "tip": "Pay yourself first! Transfer your 20% savings on the day your salary or stipend arrives before spending on wants."
    },
    "FOMO Investor": {
        "title": "FOMO Investor",
        "description": "You get tempted by viral screenshot gains and trending social media tips. This leaves you vulnerable to hype traps, pump-and-dump channels, and panic selling in market drops.",
        "tip": "Run every hot tip through Scam Shield! Stick to boring, regular index fund compounding to remove emotion from your portfolio."
    }
}

def determine_personality(answers: List[int]) -> Tuple[str, str, str]:
    """
    Deterministic scoring function for the 4 risk-scenario quiz questions.
    Each answer is an integer index (0, 1, 2, or 3).
    
    Q1: Reaction to -10% drop in a week (0: panic sell, 1: anxious wait, 2: ignore noise, 3: buy the dip)
    Q2: Windfall/bonus instinct (0: full savings/SIP, 1: 50/50 split, 2: wishlist gadget, 3: party/treat)
    Q3: Friend 500% crypto gain (0: scam alert, 1: check SEBI, 2: watch link, 3: FOMO ape in)
    Q4: 2-year horizon goal (0: emergency buffer, 1: gadget/trip, 2: long-term compound, 3: live day-to-day)
    """
    if not answers or len(answers) < 4:
        return "Safe Saver", PERSONALITY_PROFILES["Safe Saver"]["description"], PERSONALITY_PROFILES["Safe Saver"]["tip"]

    # Check for direct FOMO indicator in Q3 (Telegram / crypto hype)
    if answers[2] == 3:
        key = "FOMO Investor"
    # Check for heavy spender in Q2 and Q4
    elif answers[1] == 3 or (answers[1] == 2 and answers[3] == 3):
        key = "Impulsive Spender"
    else:
        # Aggregate score
        total_score = sum(answers[:4])
        if total_score <= 3:
            key = "Safe Saver"
        elif total_score in [4, 5, 6]:
            key = "Balanced Planner"
        elif total_score in [7, 8]:
            key = "Impulsive Spender"
        else:
            key = "FOMO Investor"

    profile = PERSONALITY_PROFILES[key]
    return profile["title"], profile["description"], profile["tip"]

