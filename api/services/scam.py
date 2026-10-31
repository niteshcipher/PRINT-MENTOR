import re
from typing import Dict, List, Any

SCAM_PATTERNS = [
    {
        "pattern": r"(guarantee|guaranteed|100%\s*sure|zero\s*risk|risk[\s-]free|assured\s*return)",
        "label": "Guaranteed Returns Claim",
        "weight": 35,
        "detail": "No legitimate equity or crypto investment can ever promise guaranteed profits under SEBI regulations."
    },
    {
        "pattern": r"(double\s*(your)?\s*money|2x\s*in|10x|multibagger\s*within|daily\s*return|weekly\s*return|\d+%\s*daily|\d+%\s*weekly)",
        "label": "Unrealistic High Returns",
        "weight": 30,
        "detail": "Promises of doubling money or guaranteed daily/weekly percentage gains are the hallmark of Ponzi schemes."
    },
    {
        "pattern": r"(vip\s*(telegram|whatsapp)|secret\s*group|insider\s*(tip|info)|exclusive\s*channel|crypto\s*bot)",
        "label": "Private Unregulated Channels",
        "weight": 25,
        "detail": "Fraudulent operators herd victims into private chat groups to evade SEBI surveillance and create fake peer pressure."
    },
    {
        "pattern": r"(hurry|urgent|limited\s*slots|only\s*\d+\s*spots|before\s*market\s*opens|act\s*now|last\s*chance)",
        "label": "Urgency & Artificial Scarcity",
        "weight": 20,
        "detail": "Creating artificial urgency prevents you from doing basic research and due diligence."
    },
    {
        "pattern": r"(recruit|referral\s*bonus|earn\s*per\s*friend|downline|commission\s*on\s*joining)",
        "label": "Pyramid / MLM Structure",
        "weight": 25,
        "detail": "Money circulation schemes where income depends on enrolling new members are illegal prize chits in India."
    },
    {
        "pattern": r"(penny\s*stock|upper\s*circuit|operator\s*stock|pump\s*and\s*dump|jackpot\s*call)",
        "label": "Pump & Dump / Circuit Manipulation",
        "weight": 25,
        "detail": "Touting penny stocks or predicting upper circuits is a known market manipulation tactic penalized by SEBI."
    },
    {
        "pattern": r"(send\s*(money|crypto|usdt)|transfer\s*fee|unlock\s*fee|tax\s*deposit\s*first)",
        "label": "Advance Fee Fraud",
        "weight": 30,
        "detail": "Scammers ask for upfront deposits or 'release fees' to withdraw your supposed earnings."
    }
]

SAFE_ALTERNATIVES = [
    "SEBI-registered broad market index funds (e.g. NIFTY 50 / NIFTY Next 50) via direct mutual fund apps.",
    "RBI-regulated Scheduled Commercial Bank Fixed Deposits with DICGC deposit insurance up to ₹5 Lakh.",
    "Government of India sovereign instruments such as Public Provident Fund (PPF) or Sovereign Gold Bonds (SGB).",
    "Treasury Bills and Sovereign Debt Funds for short-to-medium term capital preservation."
]

def analyze_scam_text(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    flagged = []
    total_score = 0
    matched_explanations = []

    for rule in SCAM_PATTERNS:
        match = re.search(rule["pattern"], text_lower, re.IGNORECASE)
        if match:
            flagged.append(rule["label"])
            total_score += rule["weight"]
            matched_explanations.append(rule["detail"])

    # Cap score at 99 max or 5 min if text is short
    risk_score = min(99, max(5, total_score)) if flagged else 10

    if risk_score >= 60:
        verdict = "DANGER - High Risk / Scam Alert!"
    elif risk_score >= 30:
        verdict = "CAUTION - Suspicious Flags Detected"
    else:
        verdict = "LOW RISK - Standard Financial Discussion"

    if matched_explanations:
        explanation = " ".join(matched_explanations)
    else:
        explanation = "No overt fraudulent keywords were detected. However, always verify that the entity providing advice holds a valid SEBI Research Analyst (RA) registration."

    safer_choice = SAFE_ALTERNATIVES[0] if risk_score > 50 else SAFE_ALTERNATIVES[1]

    return {
        "risk_score": risk_score,
        "verdict": verdict,
        "flagged_keywords": flagged,
        "explanation": explanation,
        "safer_alternative": safer_choice
    }

