import math
from app.services.simulation import (
    sip_future_value,
    lump_sum,
    inflation_adjusted,
    months_to_goal,
    generate_scenario,
    DISCLAIMER_TEXT
)

def calculate_sip_fv(monthly_amount, annual_return_pct, months):
    return sip_future_value(monthly_amount, annual_return_pct, months / 12.0)

def calculate_lump_sum_fv(principal, annual_return_pct, years):
    return lump_sum(principal, annual_return_pct, years)

def adjust_for_inflation(nominal_value, annual_inflation_pct, years):
    return inflation_adjusted(nominal_value, annual_inflation_pct, years)

def generate_simulation_data(monthly_investment, lump_sum_val, annual_return_pct, inflation_rate_pct, duration_years, goal_amount):
    total_invested = round(lump_sum_val + (monthly_investment * duration_years * 12), 2)
    nominal = round(sip_future_value(monthly_investment, annual_return_pct, duration_years) + lump_sum(lump_sum_val, annual_return_pct, duration_years), 2)
    real = round(inflation_adjusted(nominal, inflation_rate_pct, duration_years), 2)
    m_req = months_to_goal(goal_amount, monthly_investment, annual_return_pct, lump_sum_val)
    return {
        "total_invested": total_invested,
        "future_value_nominal": nominal,
        "future_value_real": real,
        "estimated_months_to_goal": m_req,
        "wealth_gain": round(nominal - total_invested, 2),
        "disclaimer": DISCLAIMER_TEXT
    }

def generate_market_scenarios(monthly_investment, seed=42):
    return {
        "normal": generate_scenario("normal", 12, seed),
        "crash": generate_scenario("crash", 12, seed),
        "bull": generate_scenario("bull", 12, seed)
    }
