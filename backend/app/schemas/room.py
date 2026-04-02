from typing import Optional

from pydantic import BaseModel

from app.db.models.room import RoomCategory, RoomStatus


class RoomCreate(BaseModel):
    number: str
    category: RoomCategory
    floor: int = 1
    base_rate_etb: float
    property_id: int


class RoomUpdate(BaseModel):
    status: Optional[RoomStatus] = None
    base_rate_etb: Optional[float] = None


class RoomOut(BaseModel):
    id: int
    number: str
    category: RoomCategory
    floor: int
    status: RoomStatus
    base_rate_etb: float
    property_id: int

    class Config:
        from_attributes = True
