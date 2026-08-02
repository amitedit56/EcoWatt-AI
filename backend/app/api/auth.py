import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.email_util import send_password_reset_email
from app.models.user import User
from app.schemas.user import (
    RegisterRequest, LoginRequest, AuthResponse, ChangePasswordRequest,
    UpdateProfileRequest, UserOut, ForgotPasswordRequest, ResetPasswordRequest,
    GoogleAuthRequest,
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter(prefix="/api/auth", tags=["auth"])

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Reads the 'Authorization: Bearer <token>' header, verifies the JWT,
    and returns the matching User row. Use this on any route that should
    only work for a logged-in user."""
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=data.fullName,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})

    return {
        "token": token,
        "user": {"id": new_user.id, "fullName": new_user.full_name, "email": new_user.email, "avatarUrl": new_user.avatar_url},
    }


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.hashed_password:
        raise HTTPException(
            status_code=401,
            detail="This account was created with Google. Please use 'Continue with Google' to log in.",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": token,
        "user": {"id": user.id, "fullName": user.full_name, "email": user.email, "avatarUrl": user.avatar_url},
    }


@router.put("/profile", response_model=UserOut)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Agar email badla ja raha hai, check karo ki wo kisi doosre user ne already use nahi kiya
    if data.email != current_user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="This email is already in use by another account.")

    current_user.full_name = data.fullName
    current_user.email = data.email
    if data.avatarUrl is not None:
        current_user.avatar_url = data.avatarUrl
    db.commit()
    db.refresh(current_user)

    # Return a plain dict (not the raw ORM object) so field names always line
    # up with the response schema, regardless of the DB column naming.
    return {
        "id": current_user.id,
        "fullName": current_user.full_name,
        "email": current_user.email,
        "avatarUrl": current_user.avatar_url,
    }


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="This account uses Google Sign-In and has no password to change. "
                   "Use 'Forgot Password' to set one, if needed.",
        )

    if not verify_password(data.currentPassword, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = hash_password(data.newPassword)
    db.commit()

    return {"status": "success", "message": "Password updated successfully"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    # Always return the same generic response whether or not the email
    # exists — this prevents attackers from using this endpoint to check
    # which emails are registered.
    generic_response = {
        "status": "success",
        "message": "If an account exists for that email, a password reset link has been sent.",
    }

    if not user:
        return generic_response

    # Generate a random, hard-to-guess token valid for 30 minutes
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=30)
    db.commit()

    try:
        send_password_reset_email(user.email, token)
    except Exception as e:
        # Don't leak SMTP errors to the client, but surface them in the
        # server logs so it's clear the email failed to send.
        print(f"[forgot-password] Failed to send email to {user.email}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Could not send reset email right now. Please try again later.",
        )

    return generic_response


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user or not user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")

    expiry = user.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user.hashed_password = hash_password(data.newPassword)
    # Invalidate the token so it can't be reused
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"status": "success", "message": "Password has been reset. You can now log in."}


@router.post("/google", response_model=AuthResponse)
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google Sign-In isn't configured on the server (missing GOOGLE_CLIENT_ID).",
        )

    try:
        idinfo = google_id_token.verify_oauth2_token(
            data.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google sign-in token.")

    google_id = idinfo["sub"]
    email = idinfo.get("email")
    full_name = idinfo.get("name", email.split("@")[0] if email else "Google User")
    picture = idinfo.get("picture")

    # 1. Already linked to this Google account? Just log them in.
    user = db.query(User).filter(User.google_id == google_id).first()

    # 2. Not linked yet, but an account with this email already exists
    #    (e.g. they registered with a password earlier) — link Google to it.
    if not user and email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id

    # 3. Brand new user — create the account.
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=None,
            google_id=google_id,
            avatar_url=picture,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": token,
        "user": {"id": user.id, "fullName": user.full_name, "email": user.email, "avatarUrl": user.avatar_url},
    }