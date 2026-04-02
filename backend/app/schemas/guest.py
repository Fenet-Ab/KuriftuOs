from typing import Optional

from pydantic import BaseModel

from app.db.models.guest import LoyaltyTier


class GuestCreate(BaseModel):
    phone_number: str
    name: Optional[str] = None
    language_pref: str = "en"


class GuestUpdate(BaseModel):
    name: Optional[str] = None
    language_pref: Optional[str] = None
    loyalty_tier: Optional[LoyaltyTier] = None


class GuestOut(BaseModel):
    id: int
    name: Optional[str] = None
    language_pref: str
    loyalty_tier: LoyaltyTier

    class Config:
        from_attributes = True
