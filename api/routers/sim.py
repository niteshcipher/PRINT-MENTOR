from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime
from app.services.simulation import (
    sip_future_value,
    lump_sum,
    inflation_adjusted,
    months_to_goal,
    generate_scenario,
    DISCLAIMER_TEXT
)

router = APIRouter(prefix="/sim", tags=["Simulation"])

# Pydantic Request Models
class SimSipRequest(BaseModel):
    monthly: float = Field(gt=0, description="Monthly SIP amount in INR")
    annual_rate: float = Field(ge=0, le=50, default=12.0, description="Assumed annual return rate percentage")
    years: float = Field(gt=0, le=50, default=5.0, description="Investment horizon in years")

class SimWhatIfRequest(BaseModel):
    monthly: float = Field(ge=0, default=3000.0)
    years: float = Field(gt=0, le=40, default=5.0)
    annual_rate: float = Field(ge=0, le=40, default=12.0)
    inflation_rate: float = Field(ge=0, le=25, default=6.0)
    goal_amount: float = Field(ge=0, default=100000.0)
    lump_sum: float = Field(ge=0, default=0.0)

class SimScenarioRequest(BaseModel):
    kind: str = Field(default="normal", description="normal | crash | bull")
    monthly: float = Field(default=5000.0, ge=100)
    months: int = Field(default=12, ge=1, le=120)
    seed: int = Field(default=42)

# Endpoints
@router.post("/sip")
def compute_sip(req: SimSipRequest):
    fv = sip_future_value(req.monthly, req.annual_rate, req.years)
    total_inv = round(req.monthly * req.years * 12.0, 2)
    wealth_gain = round(fv - total_inv, 2)
    return {
        "monthly": req.monthly,
        "annual_rate": req.annual_rate,
        "years": req.years,
        "total_invested": total_inv,
        "future_value": fv,
        "wealth_gain": wealth_gain,
        "disclaimer": DISCLAIMER_TEXT
    }

@router.post("/whatif")
@router.post("/calculate")
def compute_whatif(req: SimWhatIfRequest):
    # Support alternate field names if sent from older components
    monthly = req.monthly
    years = req.years
    annual_rate = req.annual_rate
    inflation_rate = req.inflation_rate
    goal_amount = req.goal_amount
    principal = req.lump_sum

    chart_points = []
    num_years = int(math_ceil(years))

    for yr in range(1, num_years + 1):
        months_count = yr * 12
        invested = round(principal + (monthly * months_count), 2)
        nominal = round(sip_future_value(monthly, annual_rate, yr) + lump_sum(principal, annual_rate, yr), 2)
        real = round(inflation_adjusted(nominal, inflation_rate, yr), 2)
        chart_points.append({
            "year": yr,
            "invested": invested,
            "nominal": nominal,
            "real": real
        })

    final_nominal = round(sip_future_value(monthly, annual_rate, years) + lump_sum(principal, annual_rate, years), 2)
    final_real = round(inflation_adjusted(final_nominal, inflation_rate, years), 2)
    total_invested = round(principal + (monthly * years * 12.0), 2)
    months_req = months_to_goal(goal_amount, monthly, annual_rate, principal)

    # Compute projected reach date
    now = datetime.datetime.utcnow()
    projected_date_str = ""
    if months_req < 480:
        target_year = now.year + (now.month + months_req - 1) // 12
        target_month = (now.month + months_req - 1) % 12 + 1
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        projected_date_str = f"{month_names[target_month - 1]} {target_year}"

    # Mentor feedback
    if months_req <= years * 12:
        mentor_comment = f"Fantastic momentum! Compounding reaches your ₹{int(goal_amount):,} target by {projected_date_str} (in ~{months_req} months)!"
    elif months_req < 480:
        mentor_comment = f"You are on track to hit ₹{int(goal_amount):,} by {projected_date_str} (~{months_req} months). Shave off months with the lifestyle sliders!"
    else:
        mentor_comment = "Increase your monthly investment or assumed time horizon to reach this target."

    return {
        "total_invested": total_invested,
        "future_value_nominal": final_nominal,
        "future_value_real": final_real,
        "wealth_gain": round(final_nominal - total_invested, 2),
        "estimated_months_to_goal": months_req,
        "projected_date": projected_date_str,
        "mentor_comment": mentor_comment,
        "chart_points": chart_points,
        "disclaimer": "Simulation for learning, not a prediction. Assumed mathematical rates, not promised returns."
    }

def math_ceil(val):
    import math
    return math.ceil(val)

@router.post("/scenario")
@router.post("/scenarios")
def compute_scenario(req: SimScenarioRequest):
    series = generate_scenario(req.kind, req.months, req.seed)
    
    chart_points = []
    accumulated = 0.0
    invested = 0.0
    for s in series:
        invested += req.monthly
        accumulated = (accumulated + req.monthly) * (1.0 + (s["monthly_return_pct"] / 100.0))
        chart_points.append({
            "month": s["month"],
            "invested": round(invested, 2),
            "portfolio_value": round(accumulated, 2),
            "monthly_return_pct": s["monthly_return_pct"]
        })

    return {
        "scenario_type": req.kind,
        "monthly_investment": req.monthly,
        "months": req.months,
        "total_invested": round(invested, 2),
        "final_value": round(accumulated, 2),
        "returns_series": series,
        "chart_points": chart_points,
        "disclaimer": DISCLAIMER_TEXT
    }
