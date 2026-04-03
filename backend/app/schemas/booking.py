from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    guest_id: int
    room_type: str
    check_in: datetime
    check_out: datetime

class BookingResponse(BaseModel):
    id: int
    guest_id: int
    room_type: str
    check_in: datetime
    check_out: datetime
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentInitialize(BaseModel):
    booking_id: int
    amount: float
    email: str
    first_name: str
    last_name: str
