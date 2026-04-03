from pydantic import BaseModel
from typing import Optional

class RoomCategoryCreate(BaseModel):
    name: str
    total_rooms: int
    available_rooms: int
    price_per_night: float
    image_url: Optional[str] = None

class RoomCategoryUpdate(BaseModel):
    total_rooms: Optional[int] = None
    available_rooms: Optional[int] = None
    price_per_night: Optional[float] = None
    image_url: Optional[str] = None

class RoomCategoryResponse(BaseModel):
    id: int
    name: str
    total_rooms: int
    available_rooms: int
    price_per_night: float
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# Individual Room Schemas
class RoomCreate(BaseModel):
    number: str
    description: Optional[str] = None
    category_id: int

class RoomUpdate(BaseModel):
    number: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class RoomResponse(BaseModel):
    id: int
    number: str
    description: Optional[str] = None
    status: str
    is_active: bool
    category_id: int

    class Config:
        from_attributes = True

class RoomSearchRequest(BaseModel):
    category_name: Optional[str] = None
    check_in: str # "YYYY-MM-DD HH:MM:SS"
    check_out: str # "YYYY-MM-DD HH:MM:SS"
