from typing import Optional

from pydantic import BaseModel


class PropertyCreate(BaseModel):
    name: str
    location: str
    whatsapp_phone_number_id: Optional[str] = None


class PropertyOut(BaseModel):
    id: int
    name: str
    location: str
    is_active: bool

    class Cofig:
        from_attributes = True
