# 🕵️ Concept Detective AI

An AI-powered educational mystery game. Students don't memorize answers --
they **apply concepts** to solve a case. The AI generates the mystery,
grades reasoning (not just answer-matching), diagnoses the *specific*
misconception behind wrong answers, hands out contextual hints, adapts
difficulty on the fly, and writes a personalized learning report at the end.

Built for a hackathon demo: **full-stack, works in under 2 minutes, and
runs with zero setup even without an API key** (mock/demo mode).

MVP topics: **Electricity**, **Newton's Laws**, **Photosynthesis**,
**Basic Algebra**, **Fractions**.

---

## Project structure

```
concept-detective-ai/
├── backend/                 FastAPI REST API
│   ├── main.py               app entrypoint
│   ├── app/
│   │   ├── config.py         env-based config (API keys, tuning constants)
│   │   ├── models.py         pydantic request/response schemas
│   │   ├── ai_service.py     <-- all LLM logic + mock fallback lives here
│   │   ├── game_data.py      canned demo case content (mock mode)
│   │   ├── session_store.py  in-memory session store
│   │   └── routers/          mystery / answer / hint / report endpoints
│   ├── requirements.txt
│   └── .env.example
└── frontend/                 Next.js + TypeScript + Tailwind
    ├── app/
    │   ├── page.tsx           landing page
    │   ├── play/page.tsx      the full game flow (state machine)
    │   └── layout.tsx / globals.css
    ├── components/            TopicDifficultySelect, CaseBriefing,
    │                           QuestionPanel, FeedbackPanel, ReportDashboard,
    │                           ProgressBar, LoadingDetective, ErrorBanner
    ├── lib/
    │   ├── api.ts              typed fetch client for the backend
    │   └── types.ts            TS types mirroring the backend schemas
    └── .env.example
```

---

## Quick start (2 minutes)

### 1. Backend part

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env      # leave ANTHROPIC_API_KEY blank for instant demo mode
uvicorn main:app --reload --port 8000
```

Backend is now live at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`).

### 2. Frontend part

```bash
cd frontend
npm install
cp .env.example .env.local     # defaults to http://localhost:8000, usually no edit needed
npm run dev
```

Open `http://localhost:3000`, click **Start an Investigation**, and play.

> ⚠️ `NEXT_PUBLIC_API_URL` is inlined at build time. If you change it,
> restart `npm run dev` (or rebuild for production) for it to take effect.

### 3. (Optional) Enable live AI mode

Add a real key to `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022   # or any model your key supports
```

Restart the backend. The app automatically switches to **live mode** --
you'll see "LIVE AI" in the top-right of the game screen instead of "DEMO
MODE". No frontend changes needed; the same UI/flow works either way.

If the Anthropic API is unreachable or a call fails mid-game for any
reason, each AI function silently falls back to the mock logic for that
single call, so a flaky network never crashes the demo.

---

## Why this isn't a generic quiz app

This is the part that matters for the "concept detective" premise, all
implemented in `backend/app/ai_service.py`:

1. **Mystery generation** is prompted to require *applying* the concept to
   solve each stage -- clues are evidence, not trivia, and each one carries
   a `concept_link` explaining why it matters.
2. **Answer evaluation** grades the student's free-text *reasoning*, not
   just their final answer -- a right answer with backwards reasoning
   should not be rewarded the same as a right answer with sound reasoning
   (the live-mode prompt explicitly asks the model to judge this).
3. **Misconception detection**: on a wrong answer, the AI names the
   *specific* misunderstanding (e.g. "adds numerators and denominators
   straight across" rather than just "incorrect").
4. **Hints** are Socratic -- they nudge toward the reasoning path without
   ever stating the answer.
5. **Adaptive difficulty**: two correct answers in a row bump the
   student up a level; two wrong in a row ease off (`answer.py:_adapt_difficulty`).
6. **The final report** is generated from the full answer/misconception
   history of the session, not templated boilerplate.

---

## API documentation

Base URL: `http://localhost:8000`. All responses are structured JSON
(see `backend/app/models.py` for exact schemas). Interactive Swagger UI
is available at `/docs`.

### `GET /api/health`
Returns `{ status, ai_mode: "live"|"mock", topics: [...] }`.

### `POST /api/mystery/generate`
Start a new case.
```json
// request
{ "topic": "electricity", "difficulty": "easy" }
```
```json
// response (trimmed)
{
  "session_id": "uuid",
  "title": "The Case of the Flickering Lab",
  "briefing": "...",
  "clues": [{ "id": "c1", "title": "...", "content": "...", "concept_link": "..." }],
  "current_question": { "id": "q1", "prompt": "...", "stage": 1 },
  "stage": 1, "total_stages": 3, "score": 0, "mode": "mock"
}
```

### `POST /api/answer/submit`
Submit an answer + free-text reasoning for the current question.
```json
// request
{ "session_id": "uuid", "question_id": "q1", "answer": "series circuit", "reasoning": "..." }
```
```json
// response (trimmed)
{
  "correct": false,
  "misconception": "assumes the battery is broken instead of reasoning about circuit topology",
  "feedback": "...",
  "concept_reinforcement": "...",
  "score_delta": -5, "score": 0,
  "stage": 2, "total_stages": 3, "case_solved": false,
  "new_difficulty": "easy",
  "next_question": { "id": "q2", "prompt": "...", "stage": 2 },
  "culprit_reveal": null
}
```

### `POST /api/hint`
```json
{ "session_id": "uuid", "question_id": "q1" }
```
Returns `{ "hint": "...", "hints_used": 1, "score_penalty_applied": 5 }`.

### `POST /api/report/generate`
```json
{ "session_id": "uuid" }
```
Returns the full `ReportResponse`: `total_score`, `accuracy`,
`misconceptions_detected`, `strengths`, `areas_to_review`,
`narrative_summary`, `badge`.

All endpoints validate input via Pydantic and return `4xx` with a
`{"detail": "..."}` body on bad/missing sessions, and `502` if the AI
call itself fails unrecoverably.

---

## Demo script (for the 2-minute pitch)

1. Land on `/` -- show the noir landing page and topic grid (5s).
2. Click **Start an Investigation** -> pick **Fractions**, **Rookie** (5s).
3. Open a clue, read the briefing, answer the first question **wrong on
   purpose** -- point out the AI names the *exact* misconception, not just
   "wrong" (20s).
4. Request a hint -- show it nudges without giving the answer (10s).
5. Answer correctly -- watch the score/difficulty badge update live (10s).
6. Finish the case -> show the **Learning Report**: strengths, areas to
   review, and the detective-rank badge (20s).
7. Mention: same exact UI works in **mock mode** (free, offline) or
   **live mode** (real Claude reasoning) by just adding an API key.

---

## Notes / things to harden beyond hackathon scope

- Sessions are in-memory (`session_store.py`) -- fine for a demo, swap for
  Redis/Postgres for multi-instance deployments.
- No auth/user accounts by design, per MVP scope.
- CORS is wide open (`*`) for demo convenience -- lock down
  `ALLOWED_ORIGINS` in `.env` for any real deployment.
