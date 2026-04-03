from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.api.deps import get_current_active_user, check_role
from app.models.room import RoomCategory
from app.schemas.room import RoomCategoryCreate, RoomCategoryUpdate, RoomCategoryResponse
from app.models.staff import Staff

from app.models.room import RoomCategory, Room
from app.schemas.room import (
    RoomCategoryCreate, 
    RoomCategoryUpdate, 
    RoomCategoryResponse,
    RoomCreate,
    RoomResponse,
    RoomSearchRequest
)
from app.models.staff import Staff
from app.models.booking import Booking

router = APIRouter()

# --- Room Categories ---

@router.post("/", response_model=RoomCategoryResponse)
async def create_room_category(
    data: RoomCategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Staff = Depends(check_role(["admin"]))
):
    existing = await db.execute(select(RoomCategory).where(RoomCategory.name == data.name.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Room category already exists.")
        
    new_cat = RoomCategory(
        name=data.name.lower(),
        total_rooms=data.total_rooms,
        available_rooms=data.available_rooms,
        price_per_night=data.price_per_night,
        image_url=data.image_url
    )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat

@router.get("/", response_model=list[RoomCategoryResponse])
async def list_room_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RoomCategory))
    return result.scalars().all()

# --- Individual Rooms ---

@router.post("/rooms", response_model=RoomResponse)
async def create_room(
    data: RoomCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Staff = Depends(check_role(["admin"]))
):
    # Check if category exists
    cat_result = await db.execute(select(RoomCategory).where(RoomCategory.id == data.category_id))
    if not cat_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Room category not found")

    new_room = Room(
        number=data.number,
        description=data.description,
        category_id=data.category_id
    )
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    return new_room

@router.get("/rooms", response_model=list[RoomResponse])
async def list_rooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room))
    return result.scalars().all()

@router.get("/rooms/search", response_model=list[RoomCategoryResponse])
async def search_available_categories(
    check_in: str,
    check_out: str,
    db: AsyncSession = Depends(get_db)
):
    # Simulated search for now: returns all categories with available_rooms > 0
    # In a real app, this would check bookings table for overlaps
    result = await db.execute(select(RoomCategory).where(RoomCategory.available_rooms > 0))
    return result.scalars().all()
