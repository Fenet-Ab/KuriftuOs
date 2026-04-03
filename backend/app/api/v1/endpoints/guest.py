from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.guest import GuestCreate, GuestResponse
from app.services.guest_service import create_guest, get_guest

from app.api.deps import get_current_user
from app.models.staff import Staff

router = APIRouter()

@router.post("/", response_model=GuestResponse)
async def create_new_guest(
    guest: GuestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    return await create_guest(db, guest)

@router.get("/{guest_id}", response_model=GuestResponse)
async def read_guest(
    guest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    guest = await get_guest(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest