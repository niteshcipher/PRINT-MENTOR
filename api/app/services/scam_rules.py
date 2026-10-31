import re
from typing import Dict, List, Any

SCAM_RULE_DEFINITIONS = [
    {
        "id": "guaranteed_returns",
        "pattern": r"(guarantee|guaranteed|100%\s*sure|zero\s*risk|risk[\s-]free|assured\s*return)",
        "label": "Guaranteed Returns Claim",
        "weight": 35,
        "detail": "Under SEBI regulations, no equity or market investment can promise guaranteed or risk-free returns."
    },
    {
        "id": "unrealistic_returns",
        "pattern": r"(double\s*(your)?\s*money|2x\s*in|10x|multibagger\s*within|daily\s*return|weekly\s*return|\d+%\s*daily|\d+%\s*weekly)",
        "label": "Unrealistic Return Multiplication",
        "weight": 30,
        "detail": "Promises of doubling capital or daily/weekly percentage yields are hallmarks of Ponzi and pyramid frauds."
    },
    {
        "id": "unregulated_channels",
        "pattern": r"(vip\s*(telegram|whatsapp)|secret\s*group|insider\s*(tip|info)|exclusive\s*channel|crypto\s*bot)",
        "label": "Private Unregulated Channel",
        "weight": 25,
        "detail": "Fraudsters isolate victims in private WhatsApp/Telegram channels to evade regulatory surveillance."
    },
    {
        "id": "urgency_scarcity",
        "pattern": r"(hurry|urgent|limited\s*slots|only\s*\d+\s*spots|before\s*market\s*opens|act\s*now|last\s*chance)",
        "label": "Artificial Urgency & Pressure",
        "weight": 20,
        "detail": "Creating artificial time pressure aims to trigger FOMO before you can do basic due diligence."
    },
    {
        "id": "pump_and_dump",
        "pattern": r"(penny\s*stock|upper\s*circuit|operator\s*stock|pump\s*and\s*dump|jackpot\s*call)",
        "label": "Pump & Dump / Circuit Manipulation",
        "weight": 25,
        "detail": "Orchestrated social media touting of illiquid penny stocks to dump shares onto retail buyers."
    },
    {
        "id": "advance_fee",
        "pattern": r"(send\s*(money|crypto|usdt)|transfer\s*fee|unlock\s*fee|tax\s*deposit\s*first|deposit\s*₹?\d+)",
        "label": "Advance Deposit / Fee Fraud",
        "weight": 30,
        "detail": "Legitimate investment brokers never ask for deposits to private accounts or 'unlock fees'."
    },
    {
        "id": "pyramid_referral",
        "pattern": r"(recruit|referral\s*bonus|earn\s*per\s*friend|downline|commission\s*on\s*joining)",
        "label": "Pyramid / MLM Structure",
        "weight": 25,
        "detail": "Schemes where earnings depend on enrolling new participants are illegal under the Prize Chits and Money Circulation Schemes Act."
    }
]

SAFE_ALTERNATIVES = [
    "SEBI-registered broad market index funds (e.g. NIFTY 50 / NIFTY Next 50) via direct mutual fund apps.",
    "RBI-regulated Scheduled Commercial Bank Fixed Deposits with DICGC insurance up to ₹5 Lakh.",
    "Government of India sovereign instruments such as Public Provident Fund (PPF) or Sovereign Gold Bonds (SGB).",
    "Treasury Bills and Sovereign Debt Funds for short-to-medium term capital preservation."
]

def check_scam_rules(text: str) -> Dict[str, Any]:
    """
    Step 1: Rule-based detector returning matched red flags with exact character spans [start, end].
    """
    spans = []
    flagged_rules = []
    base_score = 0

    for rule in SCAM_RULE_DEFINITIONS:
        for match in re.finditer(rule["pattern"], text, re.IGNORECASE):
            spans.append({
                "start": match.start(),
                "end": match.end(),
                "matched_text": match.group(0),
                "label": rule["label"]
            })
            if rule["label"] not in flagged_rules:
                flagged_rules.append(rule["label"])
                base_score += rule["weight"]

    # Deduplicate overlapping spans
    spans.sort(key=lambda s: s["start"])

    # Score calculation
    risk_score = min(99, max(5, base_score)) if flagged_rules else 10

    return {
        "flagged_rules": flagged_rules,
        "spans": spans,
        "base_score": risk_score
    }

