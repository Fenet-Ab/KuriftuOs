from datetime import datetime

from pydantic import BaseModel

from app.db.models.upsell import UpsellCategory


class UpsellPackageCreate(BaseModel):
    name: str
    description: str
    price_etb: float
    category: UpsellCategory
    best_for_times: str = "morning,afternoon,evening"
    property_id: int = 0


class UpsellPackageOut(BaseModel):
    id: int
    name: str
    description: str
    price_etb: float
    category: UpsellCategory
    is_active: bool
    best_for_times: str

    class Config:
        from_attributes = True


class UpsellConversionCreate(BaseModel):
    guest_id: int
    reservation_id: int
    package_id: int
    revenue_etb: float


class UpsellConversionOut(BaseModel):
    id: int
    guest_id: int
    reservation_id: int
    package_id: int
    revenue_etb: float
    converted_at: datetime

    class Config:
        from_attributes = True
