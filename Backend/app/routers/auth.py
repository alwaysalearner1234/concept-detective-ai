"""
Authentication routers for Concept Detective.

Exposes endpoints for user registration, login, logout, profile checks, and password reset.
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional
from .. import user_store

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Full name of the user")
    email: str = Field(..., min_length=3, description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1)


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1)
    code: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    try:
        user = user_store.create_user(req.name, req.email, req.password)
        token = user_store.create_session(user["email"])
        return AuthResponse(
            user=UserResponse(id=user["id"], name=user["name"], email=user["email"]),
            token=token
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = user_store.get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not user_store.verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = user_store.create_session(user["email"])
    return AuthResponse(
        user=UserResponse(id=user["id"], name=user["name"], email=user["email"]),
        token=token
    )


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_store.delete_session(token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    user = user_store.get_session_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return UserResponse(id=user["id"], name=user["name"], email=user["email"])


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = user_store.get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Email address not found")
    
    # Generate a demo recovery code
    code = "CD-8844"
    user_store.RESET_CODES[user["email"]] = code
    return {
        "message": "Reset code generated",
        "demo_code": code
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    user = user_store.get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Email address not found")
    
    stored_code = user_store.RESET_CODES.get(user["email"])
    if not stored_code or stored_code != req.code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    # Hash and save the new password
    pwd_hash, salt_hex = user_store.hash_password(req.password)
    user["password_hash"] = pwd_hash
    user["salt"] = salt_hex
    
    # Invalidate reset code
    del user_store.RESET_CODES[user["email"]]
    
    return {"message": "Password reset successfully"}
