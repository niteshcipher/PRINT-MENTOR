import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.llm import (
    chat,
    stream_chat,
    json_call,
    build_user_context,
    sanitize_llm_output,
    is_mock_mode
)

# Maintain backward compatibility with previous generate_mentor_reply signature
def generate_mentor_reply(user, message: str, chat_history=None):
    context = build_user_context(user)
    reply_text = chat(message, user_context=context, history=chat_history)
    return {
        "reply": reply_text,
        "disclaimer": "Pixel Mentor provides financial education only, never regulated investment advice. All figures are illustrative simulations."
    }
