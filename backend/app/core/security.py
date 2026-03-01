# ============================================================
# SECURITY.PY — Handles Passwords and Login Tokens
#
# When user logs in → we create a TOKEN (like a wristband at a concert)
# Every request after that → user shows the token → we let them in
# ============================================================

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# bcrypt turns "mypassword123" into "$2b$12$randomgarbage..."
# So even if database is hacked, passwords are safe!
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Converts plain password to hashed password.
    Example: "hello123" → "$2b$12$abc...xyz"
    We NEVER store plain passwords in database!
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if the password user typed matches the hashed one in database.
    Returns True if correct, False if wrong.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    Creates a JWT token (the wristband) for logged in user.
    This token expires after 24 hours automatically.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def decode_token(token: str) -> dict:
    """
    Reads the token and returns the user data inside it.
    If token is fake or expired, returns None.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None