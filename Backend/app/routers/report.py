"""
POST /api/report/generate

Produces the final personalized learning report: score, accuracy,
detected misconceptions, strengths, areas to review, a narrative summary,
and a fun "detective rank" badge for the results dashboard.
"""
from fastapi import APIRouter, HTTPException

from .. import ai_service
from ..models import ReportRequest, ReportResponse
from ..session_store import get_session

router = APIRouter(prefix="/api/report", tags=["report"])


@router.post("/generate", response_model=ReportResponse)
def generate_report(req: ReportRequest) -> ReportResponse:
    session = get_session(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired. Start a new case.")

    history = session["history"]
    total = len(history)
    correct = sum(1 for h in history if h["correct"])
    accuracy = round((correct / total) * 100, 1) if total else 0.0
    misconceptions = [h["misconception"] for h in history if h.get("misconception")]

    ai_report = ai_service.generate_report(session)

    return ReportResponse(
        topic=session["topic"],
        final_difficulty=session["difficulty"],
        total_score=session["score"],
        accuracy=accuracy,
        questions_answered=total,
        misconceptions_detected=misconceptions,
        strengths=ai_report.get("strengths", []),
        areas_to_review=ai_report.get("areas_to_review", []),
        narrative_summary=ai_report.get("narrative_summary", ""),
        badge=ai_report.get("badge", "Detective"),
    )
