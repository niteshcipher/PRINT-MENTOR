from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import datetime

# Profile schemas
class ProfileResponse(BaseModel):
    user_id: str
    category: str
    income_type: str
    monthly_income: float
    fixed_expenses: float
    personality: str
    onboarding_completed: bool
    coins: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class OnboardRequest(BaseModel):
    category: str  # student | professional | gig_worker
    income_type: str  # monthly | irregular | stipend
    monthly_income: float = Field(ge=0)
    fixed_expenses: float = Field(ge=0)
    goal_name: str
    goal_target_amount: float = Field(gt=0)
    quiz_answers: List[int] = Field(min_length=4, max_length=4)

class OnboardResponse(BaseModel):
    success: bool
    personality: str
    personality_description: str
    starting_coins: int

# Expense schemas
class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: str
    description: Optional[str] = ""

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ExpenseCreateResponse(BaseModel):
    id: int
    amount: float
    category: str
    coins_earned: int

# Budget schemas
class CategoryBudget(BaseModel):
    category: str
    allocated: float
    spent: float
    remaining: float
    percentage_used: Optional[float] = 0.0
    is_overbudget: Optional[bool] = False

class GigWorkerStats(BaseModel):
    is_gig: bool
    baseline_income: float
    buffer_saved: float = 0.0
    safe_to_spend_today: float
    buffer_target: Optional[float] = 0.0
    daily_allowance: Optional[float] = 0.0
    spent_today: Optional[float] = 0.0

class BudgetResponse(BaseModel):
    monthly_income: float
    fixed_expenses: float
    total_spent: float
    savings_rate_pct: float
    categories: List[CategoryBudget]
    gig_mode: GigWorkerStats
    overbudget_categories: Optional[List[str]] = []
    has_overbudget: Optional[bool] = False
    mentor_alert: Optional[str] = None

class BudgetUpdateCategory(BaseModel):
    category: str
    allocated: float

class BudgetUpdateRequest(BaseModel):
    categories: List[BudgetUpdateCategory]

# Simulation schemas
class SimCalculateRequest(BaseModel):
    monthly_investment: float = Field(ge=0)
    lump_sum: float = Field(default=0.0, ge=0)
    annual_return_pct: float = Field(default=12.0)
    inflation_rate_pct: float = Field(default=6.0)
    duration_years: int = Field(default=5, ge=1, le=40)
    goal_amount: float = Field(default=100000.0, ge=0)

class SimChartPoint(BaseModel):
    year: int
    invested: float
    nominal: float
    real: float

class SimCalculateResponse(BaseModel):
    total_invested: float
    future_value_nominal: float
    future_value_real: float
    estimated_months_to_goal: int
    wealth_gain: float
    chart_points: List[SimChartPoint]
    disclaimer: str

class SimScenarioRequest(BaseModel):
    monthly_investment: float = Field(default=5000.0, ge=100)
    seed: int = Field(default=42)

# Coins schemas
class CoinHistoryItem(BaseModel):
    delta: int
    reason: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CoinBalanceResponse(BaseModel):
    balance: int
    history: List[CoinHistoryItem]

class CoinSpendRequest(BaseModel):
    cost: int = Field(gt=0)
    reason: str
    reference_id: Optional[str] = ""

class CoinSpendResponse(BaseModel):
    success: bool
    new_balance: int

# Scam Shield schemas
class ScamAnalyzeRequest(BaseModel):
    message: str

class ScamAnalyzeResponse(BaseModel):
    risk_score: int
    verdict: str
    flagged_keywords: List[str]
    explanation: str
    safer_alternative: str

# Coach schemas
class CoachChatRequest(BaseModel):
    message: str

class CoachChatResponse(BaseModel):
    reply: str
    disclaimer: str

# Games schemas
class GameStartRequest(BaseModel):
    game_type: str

class GameStartResponse(BaseModel):
    session_id: str
    game_type: str
    initial_state: Dict[str, Any]

class GameFinishRequest(BaseModel):
    session_id: str
    decisions: List[Any]

class GameFinishResponse(BaseModel):
    score: int
    coins_awarded: int
    replay: Dict[str, str]

# Lesson schemas
class LessonCompleteRequest(BaseModel):
    lesson_id: str

class LessonCompleteResponse(BaseModel):
    success: bool
    coins_awarded: int

