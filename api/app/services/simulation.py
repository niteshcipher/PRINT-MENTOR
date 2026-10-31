import math
import random
from typing import Dict, List, Any

DISCLAIMER_TEXT = "Educational simulation based on assumed mathematical rates. Past performance does not guarantee future results."

def sip_future_value(monthly: float, annual_rate: float, years: float) -> float:
    """
    Computes the Future Value of a recurring monthly SIP compounding monthly:
    FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    where:
      P = monthly amount
      i = annual_rate / 12 / 100
      n = years * 12
    """
    if monthly <= 0 or years <= 0:
        return 0.0

    n = int(round(years * 12))
    if n <= 0:
        return 0.0

    i = (annual_rate / 100.0) / 12.0
    if i == 0:
        return round(monthly * n, 2)

    fv = monthly * (((1.0 + i) ** n - 1.0) / i) * (1.0 + i)
    return round(fv, 2)

def lump_sum(principal: float, annual_rate: float, years: float) -> float:
    """
    Computes Future Value of a lump-sum principal compounding annually:
    FV = P * (1 + r)^t
    where r = annual_rate / 100, t = years
    """
    if principal <= 0 or years <= 0:
        return round(float(principal), 2)

    r = annual_rate / 100.0
    fv = principal * ((1.0 + r) ** years)
    return round(fv, 2)

def inflation_adjusted(nominal: float, annual_inflation: float, years: float) -> float:
    """
    Computes real purchasing power adjusted for inflation:
    Real = Nominal / ((1 + inf)^t)
    where inf = annual_inflation / 100, t = years
    """
    if nominal <= 0 or years <= 0:
        return round(float(nominal), 2)

    inf = annual_inflation / 100.0
    real_val = nominal / ((1.0 + inf) ** years)
    return round(real_val, 2)

def months_to_goal(target: float, monthly: float, annual_rate: float, lump_sum_init: float = 0.0) -> int:
    """
    Computes the number of months required to reach a target corpus
    starting with lump_sum_init and adding monthly investments with monthly compounding.
    """
    if target <= 0:
        return 0
    if target <= lump_sum_init:
        return 0
    if monthly <= 0 and lump_sum_init <= 0:
        return 999  # unreachable

    i = (annual_rate / 100.0) / 12.0
    accumulated = float(lump_sum_init)
    month = 0
    max_months = 480  # 40 years cap

    while accumulated < target and month < max_months:
        month += 1
        accumulated = (accumulated + monthly) * (1.0 + i)

    return month

def generate_scenario(kind: str, months: int = 12, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates deterministic month-by-month return series for 'normal', 'crash', or 'bull'.
    Using a fixed seed ensures repeatable results.
    """
    rng = random.Random(seed)

    # Base monthly percentage returns
    preset_returns = {
        "normal": [0.9, 1.1, -0.4, 1.2, 0.8, -0.2, 1.3, 1.0, 0.5, -0.3, 1.4, 0.9],
        "crash": [0.8, -3.5, -12.0, -14.5, -4.0, 2.0, 5.0, 3.5, 4.0, 2.5, 3.0, 4.5],
        "bull": [2.2, 3.1, 1.5, 2.8, 3.4, 1.2, 2.9, 3.8, 2.1, 1.8, 3.0, 2.5]
    }

    base = preset_returns.get(kind.lower(), preset_returns["normal"])
    series = []

    for m in range(1, months + 1):
        # repeat or extrapolate pattern
        idx = (m - 1) % len(base)
        ret = base[idx]
        series.append({
            "month": m,
            "monthly_return_pct": ret,
            "market_condition": "Bullish" if ret > 1.5 else "Bearish" if ret < -1.0 else "Stable"
        })

    return series

