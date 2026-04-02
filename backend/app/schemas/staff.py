from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.db.models.staff import StaffRole


class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: StaffRole
    property_id: int = 1


class StaffOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: StaffRole
    is_active: bool
    property_id: int
    created_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attribute = True


class StaffLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
