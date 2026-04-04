from pydantic import BaseModel, EmailStr

class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "guest"

class StaffLogin(BaseModel):
    email: EmailStr
    password: str

class StaffResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str | None = None
    avatar_url: str | None = None
    guest_id: int | None = None
    is_active: bool = True

    class Config:
        from_attributes = True


class StaffUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    avatar_url: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: StaffResponse