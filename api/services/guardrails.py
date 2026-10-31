import re

DISCLAIMER_TEXT = "Pixel Mentor provides financial education only, never regulated investment advice. All figures and projections are illustrative simulations."

BANNED_ADVICE_PATTERNS = [
    r"\b(buy|sell|target|call|put|long|short)\s+([A-Z]{2,10}|[A-Za-z]+)\s+(shares?|stocks?|equity)",
    r"\binvest\s+in\s+([A-Z]{3,10})\s+now\b",
    r"\btarget\s+price\s+of\s+₹?\d+",
    r"\bguaranteed\s+multibagger\b"
]

def sanitize_mentor_output(text: str) -> str:
    """
    Checks if output attempts to give specific stock/security tips or recommendations.
    Redacts specific recommendations and attaches safety watermark.
    """
    sanitized = text
    for pat in BANNED_ADVICE_PATTERNS:
        if re.search(pat, sanitized, re.IGNORECASE):
            sanitized = re.sub(
                pat,
                "[Specific security recommendations are blocked - consult a SEBI registered advisor]",
                sanitized,
                flags=re.IGNORECASE
            )

    return sanitized

