"""
Central configuration for Concept Detective AI backend.
Reads secrets/config from environment variables ONLY - never hardcode keys.
"""
import os

# --- AI provider config -----------------------------------------------------
# If ANTHROPIC_API_KEY is missing/empty, the whole app automatically falls
# back to MOCK/DEMO mode using canned case data in app/game_data.py.
# This lets the frontend be fully demoed with zero setup and no API cost.
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

LIVE_MODE = bool(ANTHROPIC_API_KEY)

# --- CORS --------------------------------------------------------------------
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://concept-detective.netlify.app",
)
CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"^https://[a-z0-9-]+--concept-detective\.netlify\.app$",
).strip() or None

# --- Game tuning ---------------------------------------------------------------
STAGES_BY_DIFFICULTY = {
    "easy": 3,
    "medium": 3,
    "hard": 4,
}
HINT_SCORE_PENALTY = 5
CORRECT_SCORE = 20
INCORRECT_SCORE = -5
