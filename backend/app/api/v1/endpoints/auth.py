from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.staff import StaffCreate, StaffLogin, StaffResponse, LoginResponse, StaffUpdate
from app.services.auth_service import register_staff, login_staff, update_staff
from app.api.deps import get_current_user
from app.models.staff import Staff

router = APIRouter()

@router.post("/register", response_model=StaffResponse)
async def register(
    request: Request,
    staff: StaffCreate,
    db: AsyncSession = Depends(get_db)
):
    # Get role from middleware state (if token was provided)
    user_payload = getattr(request.state, "user", None)
    creator_role = user_payload.get("role") if user_payload else None
    
    try:
        return await register_staff(db, staff, creator_role=creator_role)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=LoginResponse)
async def login(data: StaffLogin, db: AsyncSession = Depends(get_db)):
    try:
        result = await login_staff(db, data.email, data.password)
        token, staff = result

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": staff
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.put("/me", response_model=StaffResponse)
async def update_profile(
    data: StaffUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    try:
        return await update_staff(db, current_user, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
