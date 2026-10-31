from typing import List, Dict, Any

def score_dummy_test(decisions: List[Dict[str, Any]], difficulty: str = "normal") -> Dict[str, Any]:
    """
    Trivial test game scoring to verify the framework loop.
    """
    return {
        "score": 100,
        "user_summary": "Successfully completed dummy test loop.",
        "optimal_summary": "Executed test actions as intended.",
        "mentor_lesson": "Testing every loop ensures reliable gameplay."
    }

