"""
Concept Detective AI -- FastAPI backend entrypoint.

Run with:  uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.routers import mystery, answer, hint, report, auth

app = FastAPI(
    title="Concept Detective AI API",
    description="AI-powered educational mystery game backend. See /docs for interactive API docs.",
    version="1.0.0",
)

origins = (
    ["*"]
    if config.ALLOWED_ORIGINS.strip() == "*"
    else [origin.strip().rstrip("/") for origin in config.ALLOWED_ORIGINS.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=config.CORS_ORIGIN_REGEX,
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mystery.router)
app.include_router(answer.router)
app.include_router(hint.router)
app.include_router(report.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["health"])
def health():
    return {
        "status": "ok",
        "ai_mode": "live" if config.LIVE_MODE else "mock",
        "topics": ["electricity", "newtons_laws", "photosynthesis", "algebra", "fractions"],
    }


@app.get("/", tags=["health"])
def root():
    return {"message": "Concept Detective AI API is running. Visit /docs for API documentation."}
