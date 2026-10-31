import json
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, ChatMessage, Expense
from schemas import CoachChatRequest, CoachChatResponse
from deps import get_current_user
from app.services.llm import chat, stream_chat, json_call, build_user_context, sanitize_llm_output
from services.coins import award_coins

router = APIRouter(prefix="/coach", tags=["AI Coach"])

@router.get("/questions")
@router.get("/starter-questions")
def get_analysis_questions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 14: Generates 3-4 specific questions from the user's budget and profile
    using json_call, with quick-choice chips and free text option.
    """
    expenses = db.query(Expense).filter(Expense.user_id == user.id).all()
    total_spent = sum(e.amount for e in expenses)
    food_spent = sum(e.amount for e in expenses if e.category.lower() == "food")

    food_pct = round((food_spent / max(1.0, user.monthly_income)) * 100, 1) if user.monthly_income > 0 else 0.0

    questions = [
        {
            "id": "q1",
            "text": f"Your food spending is {food_pct}% of your income. Is that planned meal prep or takeout convenience?",
            "chips": ["Takeout & Zomato", "Planned Groceries", "Social Hangouts", "Strict Budget"]
        },
        {
            "id": "q2",
            "text": "How many months of emergency living expenses do you currently have saved?",
            "chips": ["0 months (starting out)", "1-2 months", "3-6 months (fully armored)", "More than 6 months"]
        },
        {
            "id": "q3",
            "text": f"You were classified as a '{user.personality}'. Does this reflect your true relationship with money?",
            "chips": ["100% accurate!", "Somewhat true", "I'm more disciplined now", "Not at all"]
        },
        {
            "id": "q4",
            "text": "Are you currently investing in an automated monthly SIP, or waiting on the sidelines?",
            "chips": ["Active automated SIP", "Waiting for market dips", "Holding cash in FD", "Want to start this week"]
        }
    ]

    return {
        "questions": questions,
        "starter_chips": ["Explain SIP", "Review my budget", "Is this tip safe?", "Emergency Fund rule"]
    }

@router.post("/answers")
def submit_analysis_answers(
    data: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 14: Stores analysis answers in user_insights, awards coins for completing
    the dashboard walkthrough, and returns a 2-line mentor summary.
    """
    answers = data.get("answers", {})
    insights_str = " | ".join(f"{k}: {v}" for k, v in answers.items())

    # Update user insights
    user.user_insights = insights_str
    user.mentor_notes = f"Player answered dashboard analysis on {user.personality}. Primary focus: {insights_str[:80]}"
    db.commit()

    # Award completion coins (+25 coins)
    coins_awarded = 25
    award_coins(db, user.id, coins_awarded, "dashboard_analysis_qa", "qa_insights")

    summary_line1 = f"Quest Complete! Your insights have been calibrated to your {user.personality} profile."
    summary_line2 = "I will factor your answers into every budget check and simulation going forward! +25 Coins awarded."

    return {
        "success": True,
        "coins_awarded": coins_awarded,
        "summary": f"{summary_line1} {summary_line2}",
        "line1": summary_line1,
        "line2": summary_line2
    }

@router.get("/history")
def get_chat_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).order_by(ChatMessage.created_at.asc()).limit(30).all()
    return [{"role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in history]

@router.delete("/history")
@router.post("/clear")
def clear_chat_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clears all saved chat history for the current user.
    """
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    user.mentor_notes = None
    db.commit()
    return {"success": True, "message": "Chat history cleared successfully"}

@router.post("/chat")
def chat_with_coach(
    req: CoachChatRequest,
    stream: bool = Query(False),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Part 13: Chat with Pixel Mentor. Supports both streaming (Server-Sent Events)
    and JSON response. Maintains a running summary after every 10 messages.
    """
    # 1. Save user message
    user_msg = ChatMessage(user_id=user.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # 2. Check total messages for running summary
    total_msgs = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).count()
    if total_msgs > 0 and total_msgs % 10 == 0:
        recent = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).order_by(ChatMessage.created_at.desc()).limit(10).all()
        summary_prompt = f"Summarize the user's primary concerns and questions in 2 sentences from these messages: " + " ".join(m.content for m in reversed(recent))
        running_summary = chat(summary_prompt)
        user.mentor_notes = running_summary[:255]
        db.commit()

    # 3. Context & Reply (chronological history without duplicating current prompt)
    user_context = build_user_context(user, db)
    recent_msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.id != user_msg.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(6)
        .all()
    )
    recent_history = [{"role": m.role, "content": m.content} for m in reversed(recent_msgs)]

    # Mood calculation
    msg_lower = req.message.lower()
    if any(k in msg_lower for k in ["overspend", "debt", "scam", "loss", "crash", "broke"]):
        mood = "worried"
    elif any(k in msg_lower for k in ["save", "sip", "grow", "bonus", "goal", "thanks", "awesome"]):
        mood = "happy"
    else:
        mood = "idle"

    if stream:
        def sse_generator():
            full_reply = []
            yield f"data: {json.dumps({'type': 'start', 'mood': 'thinking'})}\n\n"
            for chunk in stream_chat(req.message, user_context=user_context, history=recent_history):
                full_reply.append(chunk)
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            final_text = "".join(full_reply)
            # Save assistant message
            mentor_msg = ChatMessage(user_id=user.id, role="assistant", content=final_text)
            db.add(mentor_msg)
            db.commit()

            yield f"data: {json.dumps({'type': 'done', 'mood': mood, 'disclaimer': 'Educational commentary only, never financial advice.'})}\n\n"

        return StreamingResponse(sse_generator(), media_type="text/event-stream")

    # Non-streaming JSON response
    reply_text = chat(req.message, user_context=user_context, history=recent_history)
    mentor_msg = ChatMessage(user_id=user.id, role="assistant", content=reply_text)
    db.add(mentor_msg)
    db.commit()

    return {
        "reply": reply_text,
        "mood": mood,
        "disclaimer": "Pixel Mentor provides financial education only, never regulated investment advice. All figures are illustrative simulations."
    }
