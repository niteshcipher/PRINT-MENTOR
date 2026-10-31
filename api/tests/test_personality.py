import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.personality import determine_personality

def test_deterministic_personality_scoring():
    # 1. Safe Saver: low risk answers (0, 0, 0, 0)
    p_safe, desc, tip = determine_personality([0, 0, 0, 0])
    assert p_safe == "Safe Saver"
    assert "security" in desc.lower() or "safety" in desc.lower()

    # 2. Balanced Planner: balanced answers (1, 1, 1, 1) -> sum = 4
    p_bal, desc, tip = determine_personality([1, 1, 1, 1])
    assert p_bal == "Balanced Planner"
    assert "balance" in desc.lower() or "discipline" in desc.lower()

    # 3. FOMO Investor: answer 3 in Q3 (crypto Telegram screenshot)
    p_fomo, desc, tip = determine_personality([1, 1, 3, 1])
    assert p_fomo == "FOMO Investor"
    assert "fomo" in p_fomo.lower()

    # 4. Impulsive Spender: high spending in Q2 (3: party/treat immediately)
    p_imp, desc, tip = determine_personality([0, 3, 1, 1])
    assert p_imp == "Impulsive Spender"
    assert "spend" in p_imp.lower() or "splurge" in desc.lower()

