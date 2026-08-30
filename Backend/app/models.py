"""
Pydantic request/response schemas shared across routers.
Keeping these centralized makes the API contract easy to document and
easy for the frontend TypeScript types (lib/types.ts) to mirror.
"""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

Topic = Literal["electricity", "newtons_laws", "photosynthesis", "algebra", "fractions"]
Difficulty = Literal["easy", "medium", "hard"]


class Clue(BaseModel):
    id: str
    title: str
    content: str
    concept_link: str  # short note on *why* this clue matters conceptually


class QuestionOut(BaseModel):
    id: str
    prompt: str
    stage: int


# ---------- POST /api/mystery/generate ----------
class GenerateMysteryRequest(BaseModel):
    topic: Topic
    difficulty: Difficulty


class MysteryCase(BaseModel):
    session_id: str
    topic: Topic
    difficulty: Difficulty
    title: str
    setting: str
    briefing: str
    suspects: List[str] = []
    clues: List[Clue]
    current_question: QuestionOut
    stage: int
    total_stages: int
    score: int
    mode: Literal["live", "mock"]


# ---------- POST /api/answer/submit ----------
class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str = Field(..., min_length=1)
    reasoning: str = Field(default="", description="Student's explanation of their thought process")


class EvaluationResult(BaseModel):
    correct: bool
    misconception: Optional[str] = None
    feedback: str
    concept_reinforcement: str
    score_delta: int
    score: int
    stage: int
    total_stages: int
    case_solved: bool = False
    new_difficulty: Difficulty
    next_question: Optional[QuestionOut] = None
    culprit_reveal: Optional[str] = None


# ---------- POST /api/hint ----------
class HintRequest(BaseModel):
    session_id: str
    question_id: str


class HintResponse(BaseModel):
    hint: str
    hints_used: int
    score_penalty_applied: int


# ---------- POST /api/report/generate ----------
class ReportRequest(BaseModel):
    session_id: str


class ReportResponse(BaseModel):
    topic: Topic
    final_difficulty: Difficulty
    total_score: int
    accuracy: float
    questions_answered: int
    misconceptions_detected: List[str]
    strengths: List[str]
    areas_to_review: List[str]
    narrative_summary: str
    badge: str
