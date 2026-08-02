from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    fullName: str
    email: EmailStr
    avatarUrl: str | None = None

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class UpdateProfileRequest(BaseModel):
    fullName: str
    email: EmailStr
    avatarUrl: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str


class GoogleAuthRequest(BaseModel):
    # The ID token returned by Google's "Sign in with Google" button on the frontend
    credential: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut