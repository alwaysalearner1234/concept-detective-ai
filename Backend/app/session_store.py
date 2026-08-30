"""
Minimal in-memory session store.

For a hackathon MVP we intentionally avoid a database: each game session
lives in a process-local dict keyed by a UUID. This is enough to demo the
full flow (generate case -> answer -> hint -> report) without the
complexity of persistence/auth. Swap this module out for Redis/Postgres
if you take this beyond the hackathon.
"""
import uuid
from typing import Any, Dict, Optional

SESSIONS: Dict[str, Dict[str, Any]] = {}


def new_session(data: Dict[str, Any]) -> str:
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = data
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    return SESSIONS.get(session_id)


def update_session(session_id: str, **kwargs) -> None:
    if session_id in SESSIONS:
        SESSIONS[session_id].update(kwargs)
