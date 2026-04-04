"""
Pricing API endpoints.

Public:
  GET  /pricing/quote             – Get a dynamic price quote for a stay
  GET  /pricing/occasions         – List all active occasions
  GET  /pricing/occasions/upcoming – Occasions in the next 30 days

Admin-only:
  POST   /pricing/occasions
  PUT    /pricing/occasions/{id}
  DELETE /pricing/occasions/{id}
  POST   /pricing/rules
  GET    /pricing/rules
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import check_role
from app.models.pricing import Occasion, PriceRule
from app.models.staff import Staff
from app.schemas.pricing import (
    OccasionCreate,
    OccasionResponse,
    OccasionUpdate,
    PriceRuleCreate,
    PriceRuleResponse,
    PriceQuoteRequest,
    PriceQuoteResponse,
    MultiplierBreakdown,
)
from app.services.pricing_engine import calculate_dynamic_price

router = APIRouter()


# ─── Price Quote ──────────────────────────────────────────────────────────────

@router.get("/quote", response_model=PriceQuoteResponse)
async def get_price_quote(
    room_type: str,
    check_in: datetime,
    check_out: datetime,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a dynamic price quote for a stay, including a full breakdown
    of every multiplier applied (occasions, demand, lead time, etc.).
    """
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    result = await calculate_dynamic_price(db, room_type, check_in, check_out)

    return PriceQuoteResponse(
        room_type=result["room_type"],
        check_in=check_in,
        check_out=check_out,
        nights=result["nights"],
        base_price_per_night=result["base_price_per_night"],
        dynamic_price_per_night=result["dynamic_price_per_night"],
        total_base_price=result["total_base_price"],
        total_dynamic_price=result["total_dynamic_price"],
        total_multiplier=result["total_multiplier"],
        price_change_pct=result["price_change_pct"],
        breakdown=[MultiplierBreakdown(**b) for b in result["breakdown"]],
        active_occasions=result["active_occasions"],
        pricing_note=result["pricing_note"],
    )


# ─── Occasions (public read) ──────────────────────────────────────────────────

@router.get("/occasions", response_model=list[OccasionResponse])
async def list_occasions(db: AsyncSession = Depends(get_db)):
    """List all active occasions."""
    result = await db.execute(
        select(Occasion).where(Occasion.is_active == True).order_by(Occasion.start_date)
    )
    return result.scalars().all()


@router.get("/occasions/upcoming", response_model=list[OccasionResponse])
async def list_upcoming_occasions(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
):
    """List occasions occurring within the next N days (default 30)."""
    today = datetime.utcnow().date()
    cutoff = today + timedelta(days=days)
    result = await db.execute(
        select(Occasion).where(
            Occasion.is_active == True,
            Occasion.start_date <= cutoff,
            Occasion.end_date >= today,
        ).order_by(Occasion.start_date)
    )
    return result.scalars().all()


# ─── Occasions (admin write) ──────────────────────────────────────────────────

@router.post("/occasions", response_model=OccasionResponse)
async def create_occasion(
    data: OccasionCreate,
    db: AsyncSession = Depends(get_db),
    _: Staff = Depends(check_role(["admin"])),
):
    """Create a new pricing occasion (admin only)."""
    existing = await db.execute(select(Occasion).where(Occasion.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An occasion with this name already exists.")

    occasion = Occasion(**data.model_dump())
    db.add(occasion)
    await db.commit()
    await db.refresh(occasion)
    return occasion


@router.put("/occasions/{occasion_id}", response_model=OccasionResponse)
async def update_occasion(
    occasion_id: int,
    data: OccasionUpdate,
    db: AsyncSession = Depends(get_db),
    _: Staff = Depends(check_role(["admin"])),
):
    """Update an existing occasion (admin only)."""
    result = await db.execute(select(Occasion).where(Occasion.id == occasion_id))
    occasion = result.scalar_one_or_none()
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found.")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(occasion, field, value)

    await db.commit()
    await db.refresh(occasion)
    return occasion


@router.delete("/occasions/{occasion_id}")
async def delete_occasion(
    occasion_id: int,
    db: AsyncSession = Depends(get_db),
    _: Staff = Depends(check_role(["admin"])),
):
    """Delete an occasion (admin only)."""
    result = await db.execute(select(Occasion).where(Occasion.id == occasion_id))
    occasion = result.scalar_one_or_none()
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found.")
    await db.delete(occasion)
    await db.commit()
    return {"message": f"Occasion '{occasion.name}' deleted."}


# ─── Price Rules (admin) ──────────────────────────────────────────────────────

@router.post("/rules", response_model=PriceRuleResponse)
async def create_price_rule(
    data: PriceRuleCreate,
    db: AsyncSession = Depends(get_db),
    _: Staff = Depends(check_role(["admin"])),
):
    """Create a generic price rule (admin only)."""
    rule = PriceRule(**data.model_dump())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.get("/rules", response_model=list[PriceRuleResponse])
async def list_price_rules(
    db: AsyncSession = Depends(get_db),
    _: Staff = Depends(check_role(["admin"])),
):
    """List all price rules (admin only)."""
    result = await db.execute(select(PriceRule).order_by(PriceRule.priority.desc()))
    return result.scalars().all()
