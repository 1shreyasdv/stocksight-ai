# ============================================================
# AUTH.PY — Register and Login Routes
#
# This handles two things:
# 1. REGISTER — New user creates account (like signing up for Instagram)
# 2. LOGIN — Existing user logs in and gets a token (like a keycard)
#
# API Endpoints:
# POST /api/auth/register  → Create new account
# POST /api/auth/login     → Login and get token
# GET  /api/auth/me        → Get your own profile info
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.db.schemas import UserRegister, UserLogin, Token, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

# This tells FastAPI where to find the login token in requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Reads the token and returns the logged in user.
    Think of it like a bouncer checking your wristband!
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please login again."
        )

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    REGISTER — Creates a new user account

    Steps:
    1. Check if email already exists
    2. Hash the password (never save plain text!)
    3. Save new user to database
    4. Return user info
    """
    # Step 1: Check if email already used
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please login instead."
        )

    # Step 2: Hash the password
    hashed_pw = hash_password(user_data.password)

    # Step 3: Create new user object
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name
    )

    # Step 4: Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    LOGIN — Checks credentials and returns a JWT token

    Steps:
    1. Find user by email
    2. Verify password
    3. Create and return JWT token
    """
    # Step 1: Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email not found. Please register first.")

    # Step 2: Check password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong password. Please try again.")

    # Step 3: Create token
    token = create_access_token({"user_id": user.id, "email": user.email})

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    GET MY PROFILE — Returns the logged in user's info
    Protected route — must send token in header!
    """
    return current_user