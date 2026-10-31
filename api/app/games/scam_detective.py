from typing import List, Dict, Any

def score_scam_detective(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Evaluates Scam Detective:
    Inspects 8 tips. High score requires unmasking guaranteed returns, VIP channels, and urgency.
    """
    total = len(decisions) if decisions else 8
    correct = sum(1 for d in decisions if d.get("correct") is True)
    pct = (correct / max(1, total)) * 100
    score = int(pct)

    if score >= 85:
        user_summary = f"Sherlock level! Unmasked {correct} of {total} tips with precision."
        optimal_summary = "100% vigilance: spotted every fake VIP group, pump-and-dump, and guaranteed return claim."
        mentor_lesson = "Whenever anyone claims 'zero risk guaranteed 25% returns', run the other way. Legitimate investing is always transparent."
    elif score >= 50:
        user_summary = f"Identified {correct} of {total} tips correctly, but fell for a few sophisticated traps."
        optimal_summary = "Scrutinize requests for advance release fees and urgent penny stock circuit predictions."
        mentor_lesson = "Scammers weaponize urgency and FOMO. If an offer forces you to act before 9:15 AM, it is almost certainly manipulation."
    else:
        user_summary = f"Identified only {correct} of {total} tips correctly. Several deceptive claims bypassed your radar."
        optimal_summary = "Check SEBI Research Analyst registration and never pay upfront 'tax release deposits'."
        mentor_lesson = "Treat unsolicited financial DMs like suspicious links in email: never click, never deposit."

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "user_summary": user_summary,
        "optimal_summary": optimal_summary,
        "mentor_lesson": mentor_lesson
    }

