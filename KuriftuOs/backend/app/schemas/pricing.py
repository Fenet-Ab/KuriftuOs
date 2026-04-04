from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Any, Dict


# ── Occasion Schemas ──────────────────────────────────────────────────────────

class OccasionCreate(BaseModel):
    name: str
    occasion_type: str = "holiday"   # holiday | festival | event | other
    country: str = "Ethiopia"
    start_date: date
    end_date: date
    multiplier: float = Field(default=1.0, ge=0.5, le=5.0,
                              description="Price multiplier: 1.5 = 50% increase")
    description: Optional[str] = None
    is_active: bool = True


class OccasionUpdate(BaseModel):
    name: Optional[str] = None
    occasion_type: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    multiplier: Optional[float] = Field(default=None, ge=0.5, le=5.0)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class OccasionResponse(BaseModel):
    id: int
    name: str
    occasion_type: str
    country: str
    start_date: date
    end_date: date
    multiplier: float
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# ── Price Rule Schemas ────────────────────────────────────────────────────────

class PriceRuleCreate(BaseModel):
    name: str
    rule_type: str                       # demand | lead_time | day_of_week | season
    condition: Dict[str, Any]
    multiplier: float = 1.0
    priority: int = 1
    is_active: bool = True
    description: Optional[str] = None


class PriceRuleResponse(BaseModel):
    id: int
    name: str
    rule_type: str
    condition: Dict[str, Any]
    multiplier: float
    priority: int
    is_active: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Price Quote Schemas ───────────────────────────────────────────────────────

class MultiplierBreakdown(BaseModel):
    factor: str            # e.g. "Occasion: Ethiopian New Year"
    multiplier: float      # e.g. 1.5
    impact: str            # e.g. "+50% (Holiday premium)"


class PriceQuoteRequest(BaseModel):
    room_type: str
    check_in: datetime
    check_out: datetime


class PriceQuoteResponse(BaseModel):
    room_type: str
    check_in: datetime
    check_out: datetime
    nights: int
    base_price_per_night: float
    dynamic_price_per_night: float
    total_base_price: float
    total_dynamic_price: float
    total_multiplier: float
    price_change_pct: float            # +35 means 35% more expensive
    breakdown: List[MultiplierBreakdown]
    active_occasions: List[str]        # names of overlapping occasions
    pricing_note: str                  # human-readable explanation
