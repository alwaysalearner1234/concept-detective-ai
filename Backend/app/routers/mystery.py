"""
POST /api/mystery/generate

Kicks off a new game session: generates a full case (live LLM or mock),
stores server-side session state, and returns the briefing + first clues +
first question to the frontend.
"""
from fastapi import APIRouter, HTTPException

from .. import ai_service, config
from ..models import GenerateMysteryRequest, MysteryCase, QuestionOut, Clue
from ..session_store import new_session

router = APIRouter(prefix="/api/mystery", tags=["mystery"])


@router.post("/generate", response_model=MysteryCase)
def generate_mystery(req: GenerateMysteryRequest) -> MysteryCase:
    try:
        case = ai_service.generate_mystery(req.topic, req.difficulty)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=502, detail=f"Failed to generate mystery: {exc}")

    if not case.get("stages"):
        raise HTTPException(status_code=502, detail="Generated case had no questions -- try again.")

    mode = "live" if case.get("_source") == "live" else "mock"
    total_stages = len(case["stages"])

    session_data = {
        "topic": req.topic,
        "difficulty": req.difficulty,
        "case": case,
        "stage": 1,
        "total_stages": total_stages,
        "score": 0,
        "hints_used": 0,
        "history": [],
        "consecutive_correct": 0,
        "consecutive_incorrect": 0,
        "mode": mode,
    }
    session_id = new_session(session_data)

    first_stage = case["stages"][0]
    return MysteryCase(
        session_id=session_id,
        topic=req.topic,
        difficulty=req.difficulty,
        title=case["title"],
        setting=case["setting"],
        briefing=case["briefing"],
        suspects=case.get("suspects", []),
        clues=[Clue(**c) for c in case["clues"]],
        current_question=QuestionOut(id=first_stage["id"], prompt=first_stage["prompt"], stage=1),
        stage=1,
        total_stages=total_stages,
        score=0,
        mode=mode,
    )
