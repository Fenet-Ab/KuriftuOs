from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import check_role
from app.models.staff import Staff
from app.models.room import RoomCategory, Room
from app.schemas.room import (
    RoomCategoryCreate,
    RoomCategoryUpdate,
    RoomCategoryResponse,
    RoomCreate,
    RoomResponse,
    RoomInventoryResponse,
)

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


@router.get("/stats", response_model=RoomInventoryResponse)
async def room_inventory_stats(db: AsyncSession = Depends(get_db)):
    """
    Get aggregated statistics by summing up all room categories.
    This ensures consistency with the room_categories table seen in the dashboard.
    """
    cat_result = await db.execute(select(RoomCategory))
    categories = cat_result.scalars().all()
    
    total_rooms = sum(c.total_rooms for c in categories) if categories else 0
    available_rooms = sum(c.available_rooms for c in categories) if categories else 0
    booked_rooms = total_rooms - available_rooms
    
    return RoomInventoryResponse(
        total_rooms=total_rooms,
        available_rooms=available_rooms,
        booked_rooms=booked_rooms,
    )


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
