"""
In-memory user and session database.

Includes secure PBKDF2 password hashing utilizing Python's built-in hashlib,
active session token lookups, and simulated password recovery codes.
"""
import uuid
import hashlib
import os
from typing import Dict, Optional, Any

# In-memory user database
# Key: email (lowercased), Value: user record dict
USERS: Dict[str, Dict[str, Any]] = {}

# In-memory session store
# Key: session_token (UUID), Value: email
ACTIVE_SESSIONS: Dict[str, str] = {}

# In-memory store for password reset recovery codes
# Key: email, Value: recovery_code
RESET_CODES: Dict[str, str] = {}


def hash_password(password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
    """Salts and hashes a password using PBKDF2-SHA256."""
    if salt is None:
        salt = os.urandom(16)
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return pwdhash.hex(), salt.hex()


def verify_password(password: str, password_hash: str, salt_hex: str) -> bool:
    """Verifies a password against its stored hash and salt."""
    try:
        salt = bytes.fromhex(salt_hex)
        pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return pwdhash.hex() == password_hash
    except Exception:
        return False


def create_user(name: str, email: str, password: str) -> dict:
    """Creates a new user and hashes their password."""
    email_clean = email.strip().lower()
    if email_clean in USERS:
        raise ValueError("User with this email already exists")
    
    pwd_hash, salt_hex = hash_password(password)
    user = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "email": email_clean,
        "password_hash": pwd_hash,
        "salt": salt_hex
    }
    USERS[email_clean] = user
    return user


def get_user_by_email(email: str) -> Optional[dict]:
    """Retrieves a user by email."""
    return USERS.get(email.strip().lower())


def create_session(email: str) -> str:
    """Creates a session for the user and returns the token."""
    token = str(uuid.uuid4())
    ACTIVE_SESSIONS[token] = email.strip().lower()
    return token


def get_session_user(token: str) -> Optional[dict]:
    """Resolves a session token to a user record."""
    email = ACTIVE_SESSIONS.get(token)
    if not email:
        return None
    return get_user_by_email(email)


def delete_session(token: str) -> None:
    """Deletes an active session."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]


# Seed a default demo investigator account
create_user("Sherlock Holmes", "detective@concept.ai", "Password123!")
