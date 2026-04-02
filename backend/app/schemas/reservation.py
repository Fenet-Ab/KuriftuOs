from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.db.models.reservation import ReservationStatus


class ReservationCreate(BaseModel):
    guest_id: int
    room_id: int
    property_id: int
    check_in: datetime
    check_out: datetime
    special_requests: Optional[str] = None
    total_amount_etb: float = 0.0


class ReservationUpdate(BaseModel):
    status: Optional[ReservationStatus] = None
    special_requests: Optional[str] = None


class ReservationOut(BaseModel):
    id: int
    guest_id: int
    room_id: int
    property_id: int
    check_in: datetime
    check_out: datetime
    special_requests: Optional[str] = None
    total_amount_etb: float
    created_at: datetime

    class Config:
        from_attributes = True
