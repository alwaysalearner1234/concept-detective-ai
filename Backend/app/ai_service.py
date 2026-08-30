"""
AI SERVICE -- the brain of Concept Detective AI.

This module is the ONLY place that talks to the LLM. Every function has a
"live" path (real Anthropic API call) and a "mock" path (canned demo logic
using app/game_data.py), so the exact same routers/session flow works
identically whether or not an API key is configured.

Design principle for every prompt below: we are NOT asking the model to
write a trivia quiz. We ask it to (a) require APPLICATION of a concept to
solve a mystery clue, (b) diagnose the *specific* misconception behind a
wrong answer (not just mark it wrong), and (c) adapt future questions to
the student's demonstrated understanding.
"""
import json
import re
import uuid
from typing import Any, Dict, List, Optional

import requests

from . import config
from .game_data import get_case_template

TOPIC_LABELS = {
    "electricity": "Electricity & Circuits",
    "newtons_laws": "Newton's Laws of Motion",
    "photosynthesis": "Photosynthesis",
    "algebra": "Basic Algebra",
    "fractions": "Fractions",
}


# ---------------------------------------------------------------------------
# Low-level LLM call helper
# ---------------------------------------------------------------------------
def _call_claude(system_prompt: str, user_prompt: str, max_tokens: int = 1200) -> str:
    """Single shared call point to the Anthropic Messages API.

    Kept isolated so retries/error handling/model swaps happen in one place.
    Raises on failure -- callers catch and fall back to mock logic so a
    transient API issue never breaks the demo.
    """
    headers = {
        "x-api-key": config.ANTHROPIC_API_KEY,
        "anthropic-version": config.ANTHROPIC_VERSION,
        "content-type": "application/json",
    }
    body = {
        "model": config.ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    resp = requests.post(config.ANTHROPIC_API_URL, headers=headers, json=body, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return "".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text")


def _extract_json(text: str) -> Dict[str, Any]:
    """Best-effort extraction of a JSON object from an LLM response,
    tolerating accidental markdown code fences."""
    cleaned = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model response")
    return json.loads(match.group(0))


# ---------------------------------------------------------------------------
# 1) GENERATE MYSTERY
# ---------------------------------------------------------------------------
def generate_mystery(topic: str, difficulty: str) -> Dict[str, Any]:
    """Returns a full case dict: title, setting, briefing, suspects, clues,
    and an ordered list of `stages` (each an application-style question with
    an internal answer key used later for evaluation)."""
    if config.LIVE_MODE:
        try:
            return _generate_mystery_live(topic, difficulty)
        except Exception:
            pass  # fall through to mock on any live failure
    return _generate_mystery_mock(topic, difficulty)


def _generate_mystery_live(topic: str, difficulty: str) -> Dict[str, Any]:
    n_stages = config.STAGES_BY_DIFFICULTY[difficulty]
    system_prompt = (
        "You are the game master for 'Concept Detective', an educational mystery game. "
        "You design short detective cases where solving each stage REQUIRES applying "
        f"the educational concept of {TOPIC_LABELS[topic]} correctly -- never a trivia recall "
        "question. Every clue must connect to the underlying concept, not just flavor text. "
        "Respond ONLY with a single JSON object, no prose, no markdown fences."
    )
    user_prompt = f"""
Generate a detective mystery case for topic "{TOPIC_LABELS[topic]}" at "{difficulty}" difficulty
with exactly {n_stages} stages (questions), increasing in conceptual depth.

Return JSON with this exact shape:
{{
  "title": "short catchy case title",
  "setting": "one line location/time",
  "briefing": "2-3 sentence mystery setup the detective (student) reads first",
  "suspects": ["suspect or hypothesis 1", "suspect or hypothesis 2", "suspect or hypothesis 3"],
  "clues": [
    {{"id": "c1", "title": "short clue title", "content": "the observable clue/evidence",
      "concept_link": "one sentence on why this clue matters for the concept"}}
    // 3 clues total
  ],
  "stages": [
    {{
      "id": "q1",
      "prompt": "a question that requires APPLYING the concept to the clues to answer",
      "accepted": ["keyword or short phrase that indicates correct reasoning", "..."],
      "misconceptions": {{"a likely wrong keyword/phrase": "the specific misconception it reveals"}},
      "hint": "a hint that nudges without giving the answer away",
      "concept_reinforcement": "1-2 sentence explanation of the correct concept, shown after the student answers"
    }}
    // exactly {n_stages} stages total, in increasing difficulty
  ],
  "culprit": "1-2 sentence resolution tying the correct reasoning across all stages together"
}}
Keep every field grounded in the actual concept -- a student who memorizes facts but can't
apply the concept should NOT be able to answer correctly by pattern matching alone.
"""
    raw = _call_claude(system_prompt, user_prompt, max_tokens=2000)
    case = _extract_json(raw)
    case["_source"] = "live"
    return case


def _generate_mystery_mock(topic: str, difficulty: str) -> Dict[str, Any]:
    template = json.loads(json.dumps(get_case_template(topic)))  # deep copy
    n_stages = config.STAGES_BY_DIFFICULTY[difficulty]
    # Mock templates ship with 3-4 stages; trim/repeat to match requested difficulty length.
    stages = template["stages"]
    if n_stages <= len(stages):
        template["stages"] = stages[:n_stages]
    template["_source"] = "mock"
    return template


# ---------------------------------------------------------------------------
# 2) EVALUATE ANSWER (+ misconception detection)
# ---------------------------------------------------------------------------
def evaluate_answer(session: Dict[str, Any], question_id: str, answer: str, reasoning: str) -> Dict[str, Any]:
    if config.LIVE_MODE and session.get("mode") == "live":
        try:
            return _evaluate_live(session, question_id, answer, reasoning)
        except Exception:
            pass
    return _evaluate_mock(session, question_id, answer, reasoning)


def _find_stage(session: Dict[str, Any], question_id: str) -> Optional[Dict[str, Any]]:
    for s in session["case"]["stages"]:
        if s["id"] == question_id:
            return s
    return None


def _evaluate_live(session: Dict[str, Any], question_id: str, answer: str, reasoning: str) -> Dict[str, Any]:
    stage = _find_stage(session, question_id)
    system_prompt = (
        "You are an expert tutor grading a student's REASONING inside an educational mystery game "
        f"about {TOPIC_LABELS[session['topic']]}. You must judge conceptual understanding, not exact "
        "wording. If the student is wrong, identify the SPECIFIC misconception behind their answer "
        "(not just 'incorrect'). Respond ONLY with a single JSON object."
    )
    user_prompt = f"""
Case context: {session['case']['briefing']}
Question: {stage['prompt']}
Student's answer: {answer}
Student's stated reasoning: {reasoning or '(no reasoning given)'}

Return JSON:
{{
  "correct": true or false,
  "misconception": "specific name/description of the misconception, or null if correct",
  "feedback": "1-2 sentences directly addressing what the student said",
  "concept_reinforcement": "1-2 sentence explanation of the correct concept"
}}
"""
    raw = _call_claude(system_prompt, user_prompt, max_tokens=500)
    result = _extract_json(raw)
    result.setdefault("misconception", None)
    return result


def _evaluate_mock(session: Dict[str, Any], question_id: str, answer: str, reasoning: str) -> Dict[str, Any]:
    stage = _find_stage(session, question_id)
    if stage is None:
        return {"correct": False, "misconception": "Question not found in this session.",
                "feedback": "That question isn't part of the active case.", "concept_reinforcement": ""}

    text = f"{answer} {reasoning}".lower()

    # Simple keyword-based reasoning check (stand-in for the LLM grader in demo mode)
    correct = any(kw.lower() in text for kw in stage["accepted"])

    if correct:
        return {
            "correct": True,
            "misconception": None,
            "feedback": "Solid reasoning -- that's exactly the conceptual link this clue was pointing to.",
            "concept_reinforcement": stage["concept_reinforcement"],
        }

    # Try to match a known misconception keyword for specific feedback
    misconception = None
    for bad_kw, explanation in stage.get("misconceptions", {}).items():
        if bad_kw.lower() in text:
            misconception = explanation
            break
    if misconception is None:
        misconception = "The reasoning doesn't yet connect the clue to the underlying concept -- worth re-reading the clue's concept link."

    return {
        "correct": False,
        "misconception": misconception,
        "feedback": "Not quite -- that answer doesn't match what the evidence actually implies here.",
        "concept_reinforcement": stage["concept_reinforcement"],
    }


# ---------------------------------------------------------------------------
# 3) GENERATE HINT
# ---------------------------------------------------------------------------
def generate_hint(session: Dict[str, Any], question_id: str) -> str:
    if config.LIVE_MODE and session.get("mode") == "live":
        try:
            return _hint_live(session, question_id)
        except Exception:
            pass
    return _hint_mock(session, question_id)


def _hint_live(session: Dict[str, Any], question_id: str) -> str:
    stage = _find_stage(session, question_id)
    system_prompt = (
        "You are a Socratic tutor inside a detective game. Give ONE short hint (max 2 sentences) "
        "that nudges the student toward the correct reasoning WITHOUT revealing the final answer. "
        "Respond with plain text only, no JSON."
    )
    user_prompt = f"Question: {stage['prompt']}\nGive a hint that guides without answering directly."
    return _call_claude(system_prompt, user_prompt, max_tokens=150).strip()


def _hint_mock(session: Dict[str, Any], question_id: str) -> str:
    stage = _find_stage(session, question_id)
    return stage["hint"] if stage else "Re-read the clues -- the answer connects directly to one of them."


# ---------------------------------------------------------------------------
# 4) GENERATE FINAL REPORT
# ---------------------------------------------------------------------------
def generate_report(session: Dict[str, Any]) -> Dict[str, Any]:
    if config.LIVE_MODE and session.get("mode") == "live":
        try:
            return _report_live(session)
        except Exception:
            pass
    return _report_mock(session)


def _report_live(session: Dict[str, Any]) -> Dict[str, Any]:
    history = session["history"]
    system_prompt = (
        "You are an educational analyst writing a short, encouraging but honest learning report "
        "for a student after a detective-style concept game. Respond ONLY with a single JSON object."
    )
    user_prompt = f"""
Topic: {TOPIC_LABELS[session['topic']]}
Answer history (in order): {json.dumps(history)}

Return JSON:
{{
  "strengths": ["1-3 short strengths based on what they got right/how they reasoned"],
  "areas_to_review": ["1-3 short areas based on misconceptions shown"],
  "narrative_summary": "3-4 sentence personalized summary of their performance and growth",
  "badge": "a short fun detective-rank title reflecting their performance, e.g. 'Junior Detective' or 'Master Investigator'"
}}
"""
    raw = _call_claude(system_prompt, user_prompt, max_tokens=500)
    return _extract_json(raw)


def _report_mock(session: Dict[str, Any]) -> Dict[str, Any]:
    history = session["history"]
    correct_count = sum(1 for h in history if h["correct"])
    total = len(history) or 1
    accuracy = correct_count / total

    strengths = []
    areas = []
    if accuracy >= 0.66:
        strengths.append("Consistently applied the core concept correctly across multiple clues")
    if any(h["correct"] for h in history):
        strengths.append("Connected physical/observable evidence back to the underlying concept")
    if not strengths:
        strengths.append("Engaged with every clue and attempted reasoning rather than guessing blindly")

    misconceptions = [h["misconception"] for h in history if h.get("misconception")]
    if misconceptions:
        areas.append("Review: " + misconceptions[0][:90])
    if len(misconceptions) > 1:
        areas.append("Review: " + misconceptions[1][:90])
    if not areas:
        areas.append("Try a harder difficulty next time to keep building depth")

    if accuracy >= 0.85:
        badge = "Master Investigator"
    elif accuracy >= 0.5:
        badge = "Field Detective"
    else:
        badge = "Junior Detective"

    narrative = (
        f"You solved this case with {correct_count} out of {total} correct deductions "
        f"({round(accuracy * 100)}% accuracy). "
        + ("Your reasoning consistently linked evidence back to the core concept -- that's exactly "
           "the kind of applied thinking this case was designed to test. "
           if accuracy >= 0.66 else
           "A few answers relied on surface-level guesses rather than the underlying concept -- "
           "revisiting the flagged misconceptions below will sharpen that. ")
        + "Keep applying this concept to new scenarios to lock it in."
    )

    return {
        "strengths": strengths,
        "areas_to_review": areas,
        "narrative_summary": narrative,
        "badge": badge,
    }
