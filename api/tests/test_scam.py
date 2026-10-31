import pytest
from app.services.scam_rules import check_scam_rules
from routers.scam import check_message, ScamCheckRequest, SAMPLE_TEXTS

def test_character_spans_in_scam_rules():
    text = "Join our VIP Telegram group for 100% guaranteed return!"
    result = check_scam_rules(text)
    assert len(result["spans"]) >= 2
    for span in result["spans"]:
        assert "start" in span
        assert "end" in span
        assert span["start"] < span["end"]
        assert span["matched_text"] == text[span["start"]:span["end"]]

def test_five_scam_samples_score_high_and_two_neutral_score_low():
    scam_samples = [s for s in SAMPLE_TEXTS if s["is_scam"]]
    neutral_samples = [s for s in SAMPLE_TEXTS if not s["is_scam"]]

    assert len(scam_samples) == 5
    assert len(neutral_samples) == 2

    # All 5 scam samples must score >= 60
    for s in scam_samples:
        res = check_message(ScamCheckRequest(text=s["text"]))
        assert res.risk_score >= 60, f"Expected high score for scam sample '{s['title']}', got {res.risk_score}"
        assert "DANGER" in res.verdict or "CAUTION" in res.verdict
        assert len(res.spans) > 0

    # All 2 neutral samples must score < 30
    for s in neutral_samples:
        res = check_message(ScamCheckRequest(text=s["text"]))
        assert res.risk_score < 30, f"Expected low score for neutral sample '{s['title']}', got {res.risk_score}"
        assert "LOW RISK" in res.verdict
