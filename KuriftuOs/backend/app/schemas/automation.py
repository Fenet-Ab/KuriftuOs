from pydantic import BaseModel
from typing import Optional

class DeviceBase(BaseModel):
    device_name: str
    status: str
    current_value: Optional[str] = None

class DeviceCreate(DeviceBase):
    room_id: int

class DeviceResponse(DeviceBase):
    id: int
    room_id: int

    class Config:
        from_attributes = True

class MoodSet(BaseModel):
    mood_name: str
    room_id: int
