"""
POST /api/hint

Generates a contextual hint for the current question -- guides reasoning
without revealing the answer -- and applies a small score penalty so
hints are a meaningful trade-off rather than free.
"""
from fastapi import APIRouter, HTTPException

from .. import ai_service, config
from ..models import HintRequest, HintResponse
from ..session_store import get_session, update_session

router = APIRouter(prefix="/api/hint", tags=["hint"])


@router.post("", response_model=HintResponse)
def get_hint(req: HintRequest) -> HintResponse:
    session = get_session(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired. Start a new case.")

    hint_text = ai_service.generate_hint(session, req.question_id)

    penalty = config.HINT_SCORE_PENALTY
    new_score = max(0, session["score"] - penalty)
    hints_used = session["hints_used"] + 1
    update_session(req.session_id, score=new_score, hints_used=hints_used)

    return HintResponse(hint=hint_text, hints_used=hints_used, score_penalty_applied=penalty)
