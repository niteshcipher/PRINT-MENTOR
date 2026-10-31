from fastapi import APIRouter, HTTPException
import json
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/glossary", tags=["Glossary"])

GLOSSARY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "glossary.json")

def load_glossary() -> List[Dict[str, Any]]:
    if os.path.exists(GLOSSARY_FILE):
        with open(GLOSSARY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Ensure both key conventions (simple & simple_def, intermediate & intermediate_def) exist
            for item in data:
                if "simple" not in item and "simple_def" in item:
                    item["simple"] = item["simple_def"]
                if "simple_def" not in item and "simple" in item:
                    item["simple_def"] = item["simple"]
                if "intermediate" not in item and "intermediate_def" in item:
                    item["intermediate"] = item["intermediate_def"]
                if "intermediate_def" not in item and "intermediate" in item:
                    item["intermediate_def"] = item["intermediate"]
            return data
    return []

@router.get("", response_model=List[Dict[str, Any]])
def get_glossary():
    return load_glossary()

@router.get("/{term}")
def get_term_definition(term: str):
    terms = load_glossary()
    term_lower = term.lower().strip()
    for item in terms:
        if term_lower in item["term"].lower():
            return item
    # Fallback explanation
    return {
        "term": term,
        "simple_def": f"A financial term related to money, wealth or investment discipline.",
        "intermediate_def": f"Learn more by chatting with the Pixel Mentor coach in the Coach tab.",
        "analogy": "Ask your mentor in the Coach tab for a personalized gaming analogy!"
    }

