from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.scam_rules import check_scam_rules, SAFE_ALTERNATIVES
from app.services.llm import json_call
from schemas import ScamAnalyzeRequest, ScamAnalyzeResponse
from services.scam import analyze_scam_text

router = APIRouter(prefix="/scam", tags=["Scam Shield"])

class ScamCheckRequest(BaseModel):
    text: Optional[str] = None
    message: Optional[str] = None

class SpanModel(BaseModel):
    start: int
    end: int
    matched_text: str
    label: str

class ScamCheckResponse(BaseModel):
    risk_score: int
    verdict: str
    flagged_keywords: List[str]
    explanation: str
    safer_alternative: str
    spans: List[SpanModel]

SAMPLE_TEXTS = [
    # 5 Scam Samples (Score high >= 60)
    {
        "id": "scam_1",
        "title": "VIP Crypto Bot",
        "is_scam": True,
        "text": "Join our secret VIP Telegram group! 100% guaranteed 25% weekly returns on secret crypto trading bot. Deposit 5000 now to unlock."
    },
    {
        "id": "scam_2",
        "title": "Urgent Penny Stock Tip",
        "is_scam": True,
        "text": "URGENT penny stock tip: Tomorrow it will hit upper circuit 20%. Put your full salary before market opens at 9:15 AM!"
    },
    {
        "id": "scam_3",
        "title": "48-Hour Double Money",
        "is_scam": True,
        "text": "Hey bro, transfer ₹10,000 to my verified algo trading bot and I will double your money within 48 hours with zero risk guaranteed!"
    },
    {
        "id": "scam_4",
        "title": "Pyramid Forex Scheme",
        "is_scam": True,
        "text": "Deposit ₹15,000 in Global Forex Pool and earn ₹2,000 daily return, plus ₹3,000 referral bonus for every friend you recruit to join!"
    },
    {
        "id": "scam_5",
        "title": "Advance Tax Unlock Fee",
        "is_scam": True,
        "text": "Your account has accumulated ₹2,50,000 profits! Please send money for 15% tax deposit first before we can release and transfer your payout."
    },
    # 2 Neutral / Legitimate Samples (Score low < 30)
    {
        "id": "neutral_1",
        "title": "Broad Index Fund SIP",
        "is_scam": False,
        "text": "Invest in low-cost NIFTY 50 Index Fund via direct plan with 0.1% expense ratio for a 10-year compounding horizon."
    },
    {
        "id": "neutral_2",
        "title": "Bank Fixed Deposit",
        "is_scam": False,
        "text": "Public Provident Fund (PPF) offering 7.1% tax-free annual returns backed by the Government of India, or scheduled bank FD insured up to ₹5 lakh by DICGC."
    }
]

@router.get("/samples")
def get_sample_texts():
    """Returns 7 sample texts: 5 scam and 2 neutral."""
    return SAMPLE_TEXTS

@router.post("/check", response_model=ScamCheckResponse)
def check_message(req: ScamCheckRequest):
    """
    Part 15: Two-step scam detection:
    Step 1: Rule-based regex detector returning matched red flags with character spans.
    Step 2: json_call to LLM for final score calibration, plain explanation, and safe alternative.
    """
    text = (req.text or req.message or "").strip()
    rule_result = check_scam_rules(text)

    # Step 2: LLM consultation
    score = rule_result["base_score"]
    explanation = ""
    safer_choice = SAFE_ALTERNATIVES[0] if score >= 50 else SAFE_ALTERNATIVES[1]

    try:
        llm_eval = json_call(
            f"Analyze financial message for fraud risk: '{text}'. Flagged: {rule_result['flagged_rules']}. Return score (0-100), explanation and safer_alternative."
        )
        if isinstance(llm_eval, dict):
            if "score" in llm_eval and rule_result["flagged_rules"]:
                # Merge score
                score = max(score, int(llm_eval.get("score", score)))
            if "explanation" in llm_eval:
                explanation = llm_eval["explanation"]
            if "safer_alternative" in llm_eval:
                safer_choice = llm_eval["safer_alternative"]
    except Exception:
        pass

    if not explanation:
        if score >= 60:
            explanation = "Multiple critical fraud red flags detected: guaranteed return claims, artificial urgency, or unregulated private channels."
        elif score >= 30:
            explanation = "Suspicious signals detected. Be cautious and verify SEBI/RBI registration before sending any funds."
        else:
            explanation = "No overt fraudulent patterns detected. This message describes standard or regulated financial instruments."

    if score >= 60:
        verdict = "DANGER - High Risk / Scam Alert!"
    elif score >= 30:
        verdict = "CAUTION - Suspicious Flags Detected"
    else:
        verdict = "LOW RISK - Standard Regulated Discussion"

    return ScamCheckResponse(
        risk_score=score,
        verdict=verdict,
        flagged_keywords=rule_result["flagged_rules"],
        explanation=explanation,
        safer_alternative=safer_choice,
        spans=[SpanModel(**s) for s in rule_result["spans"]]
    )

@router.post("/analyze", response_model=ScamAnalyzeResponse)
def analyze_message(req: ScamAnalyzeRequest):
    """Backward compatibility for existing /analyze calls."""
    result = analyze_scam_text(req.message)
    return ScamAnalyzeResponse(**result)
