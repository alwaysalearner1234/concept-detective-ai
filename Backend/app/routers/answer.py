"""
POST /api/answer/submit

Evaluates the student's answer + reasoning for the CURRENT stage, detects
the specific misconception when wrong, updates score, adapts difficulty
for future questions based on recent performance, and returns either the
next question or a case-solved signal.
"""
from fastapi import APIRouter, HTTPException

from .. import ai_service, config
from ..models import SubmitAnswerRequest, EvaluationResult, QuestionOut
from ..session_store import get_session, update_session

router = APIRouter(prefix="/api/answer", tags=["answer"])

DIFFICULTY_ORDER = ["easy", "medium", "hard"]


def _adapt_difficulty(session: dict) -> str:
    """AI-adaptive difficulty logic: two correct answers in a row bumps the
    student up a level for framing/future sessions; two wrong in a row eases
    off. This is intentionally simple and transparent for a hackathon demo --
    swap in a richer model-driven policy for production."""
    current = session["difficulty"]
    idx = DIFFICULTY_ORDER.index(current)
    if session["consecutive_correct"] >= 2 and idx < len(DIFFICULTY_ORDER) - 1:
        return DIFFICULTY_ORDER[idx + 1]
    if session["consecutive_incorrect"] >= 2 and idx > 0:
        return DIFFICULTY_ORDER[idx - 1]
    return current


@router.post("/submit", response_model=EvaluationResult)
def submit_answer(req: SubmitAnswerRequest) -> EvaluationResult:
    session = get_session(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found or expired. Start a new case.")

    result = ai_service.evaluate_answer(session, req.question_id, req.answer, req.reasoning)

    score_delta = config.CORRECT_SCORE if result["correct"] else config.INCORRECT_SCORE
    new_score = max(0, session["score"] + score_delta)

    session["history"].append({
        "question_id": req.question_id,
        "answer": req.answer,
        "reasoning": req.reasoning,
        "correct": result["correct"],
        "misconception": result.get("misconception"),
    })

    if result["correct"]:
        session["consecutive_correct"] += 1
        session["consecutive_incorrect"] = 0
    else:
        session["consecutive_incorrect"] += 1
        session["consecutive_correct"] = 0

    new_difficulty = _adapt_difficulty(session)

    next_stage_num = session["stage"] + 1
    case_solved = next_stage_num > session["total_stages"]

    next_question = None
    culprit_reveal = None
    if case_solved:
        culprit_reveal = session["case"].get("culprit")
    else:
        stage_data = session["case"]["stages"][next_stage_num - 1]
        next_question = QuestionOut(id=stage_data["id"], prompt=stage_data["prompt"], stage=next_stage_num)

    update_session(
        req.session_id,
        score=new_score,
        stage=next_stage_num if not case_solved else session["stage"],
        difficulty=new_difficulty,
        consecutive_correct=session["consecutive_correct"],
        consecutive_incorrect=session["consecutive_incorrect"],
    )

    return EvaluationResult(
        correct=result["correct"],
        misconception=result.get("misconception"),
        feedback=result["feedback"],
        concept_reinforcement=result["concept_reinforcement"],
        score_delta=score_delta,
        score=new_score,
        stage=session["stage"],
        total_stages=session["total_stages"],
        case_solved=case_solved,
        new_difficulty=new_difficulty,
        next_question=next_question,
        culprit_reveal=culprit_reveal,
    )
