import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.simulation import (
    sip_future_value,
    lump_sum,
    inflation_adjusted,
    months_to_goal,
    generate_scenario
)

def test_sip_future_value_hand_calculation():
    """
    Hand-calculated test:
    Monthly P = 1,000, Annual Rate = 12%, Horizon = 1 Year (12 months).
    Monthly interest i = 0.01
    FV = 1000 * [((1.01)^12 - 1) / 0.01] * 1.01 = 12,809.33
    """
    fv = sip_future_value(monthly=1000.0, annual_rate=12.0, years=1.0)
    assert fv == 12809.33

def test_lump_sum_hand_calculation():
    """
    Hand-calculated test:
    Principal P = 10,000, Annual Rate = 10%, Years = 2.
    FV = 10,000 * (1 + 0.10)^2 = 12,100.00
    """
    fv = lump_sum(principal=10000.0, annual_rate=10.0, years=2.0)
    assert fv == 12100.00

def test_inflation_adjusted_hand_calculation():
    """
    Hand-calculated test:
    Nominal Value = 12,100.00, Inflation = 5%, Years = 2.
    Real = 12,100 / (1.05)^2 = 10,975.06
    """
    real = inflation_adjusted(nominal=12100.0, annual_inflation=5.0, years=2.0)
    assert real == 10975.06

def test_months_to_goal():
    """
    Test goal-date countdown calculation:
    With 1,000/mo at 12% p.a., accumulating 12,800 takes exactly 12 months.
    """
    months = months_to_goal(target=12800.0, monthly=1000.0, annual_rate=12.0)
    assert months == 12

def test_scenario_generator_normal_crash_bull():
    normal_series = generate_scenario("normal", months=12, seed=42)
    assert len(normal_series) == 12
    assert normal_series[0]["month"] == 1

    crash_series = generate_scenario("crash", months=12, seed=42)
    assert len(crash_series) == 12
    # Verify crash exhibits steep negative months
    negatives = [s for s in crash_series if s["monthly_return_pct"] < -5.0]
    assert len(negatives) >= 2

    bull_series = generate_scenario("bull", months=12, seed=42)
    assert len(bull_series) == 12
    # Bull series average return is consistently positive
    avg_return = sum(s["monthly_return_pct"] for s in bull_series) / 12
    assert avg_return > 2.0

