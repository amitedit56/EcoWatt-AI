from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.user import RegisterRequest, LoginRequest, AuthResponse, ChangePasswordRequest, UpdateProfileRequest, UserOut

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
    if not user or not verify_password(data.password, user.hashed_password):
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
    if not verify_password(data.currentPassword, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = hash_password(data.newPassword)
    db.commit()

    return {"status": "success", "message": "Password updated successfully"}