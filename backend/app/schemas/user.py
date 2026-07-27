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

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut