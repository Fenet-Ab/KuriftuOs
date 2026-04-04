"""
Dynamic Pricing Engine for Kuriftu Resort.

Two-layer approach:
  Layer 1 (always active): Rule-based multipliers – occasions, demand, lead time,
                           day-of-week, and season.
  Layer 2 (optional):      Gradient Boosting calibration using historical bookings.
                           Auto-enabled when ≥100 confirmed bookings exist.
"""
import logging
from datetime import datetime, date, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.pricing import Occasion, PriceRule
from app.models.room import RoomCategory

logger = logging.getLogger("kuriftuos.pricing")


# ─── Multiplier constants (defaults match pre-seeded PriceRules) ──────────────

LEAD_TIME_TIERS = [
    # (max_days_ahead, multiplier)
    (3,   1.30),   # last-minute surge
    (7,   1.15),   # short notice
    (14,  1.05),   # moderate notice
    (30,  1.00),   # standard
    (60,  0.95),   # early bird
    (999, 0.90),   # very early bird
]

# Python weekday(): Mon=0 … Sun=6
WEEKEND_DAYS = {4, 5}          # Friday, Saturday
WEEKDAY_MULTIPLIER = 0.95
WEEKEND_MULTIPLIER = 1.15

# Peak months for Kuriftu (by Ethiopian calendar holidays clustering)
PEAK_MONTHS = {1, 7, 9, 10, 12}      # Jan, Jul, Sep, Oct, Dec
SHOULDER_MONTHS = {4, 5, 6, 11}
LOW_SEASON_MONTHS = {2, 3, 8}


# ─── Individual multiplier functions ─────────────────────────────────────────

async def _get_active_occasions(
    db: AsyncSession,
    check_in: datetime,
    check_out: datetime,
) -> list[Occasion]:
    """Return all active occasions that overlap with the stay window."""
    stay_start = check_in.date() if isinstance(check_in, datetime) else check_in
    stay_end = check_out.date() if isinstance(check_out, datetime) else check_out

    result = await db.execute(
        select(Occasion).where(
            Occasion.is_active == True,
            Occasion.start_date <= stay_end,
            Occasion.end_date >= stay_start,
        )
    )
    return result.scalars().all()


def _calculate_occasion_multiplier(occasions: list[Occasion]) -> float:
    """
    Combine occasion multipliers.  When multiple occasions overlap, we take
    the MAXIMUM (not accumulate) to avoid absurd compounding.
    """
    if not occasions:
        return 1.0
    return max(o.multiplier for o in occasions)


def _calculate_lead_time_multiplier(check_in: datetime) -> float:
    """Higher urgency (shorter lead time) → higher price."""
    days_ahead = (check_in.date() - datetime.utcnow().date()).days
    days_ahead = max(days_ahead, 0)
    for max_days, multiplier in LEAD_TIME_TIERS:
        if days_ahead <= max_days:
            return multiplier
    return LEAD_TIME_TIERS[-1][1]


def _calculate_day_of_week_multiplier(check_in: datetime) -> float:
    """Weekends command a premium at resort destinations."""
    weekday = check_in.weekday()
    return WEEKEND_MULTIPLIER if weekday in WEEKEND_DAYS else WEEKDAY_MULTIPLIER


def _calculate_season_multiplier(check_in: datetime) -> float:
    """Monthly season tiers aligned with Ethiopian holiday calendar."""
    month = check_in.month
    if month in PEAK_MONTHS:
        return 1.20
    if month in SHOULDER_MONTHS:
        return 1.05
    if month in LOW_SEASON_MONTHS:
        return 0.88
    return 1.00  # baseline


async def _calculate_demand_multiplier(db: AsyncSession, room_type: str) -> float:
    """
    Occupancy-based pricing: higher occupancy → higher multiplier.
    Uses live RoomCategory data already tracked in the DB.
    """
    result = await db.execute(
        select(RoomCategory).where(RoomCategory.name == room_type.lower())
    )
    category = result.scalar_one_or_none()
    if not category or category.total_rooms == 0:
        return 1.0

    occupancy = 1.0 - (category.available_rooms / category.total_rooms)

    if occupancy >= 0.90:
        return 1.40   # near-full → strong surge
    elif occupancy >= 0.75:
        return 1.25
    elif occupancy >= 0.60:
        return 1.12
    elif occupancy >= 0.40:
        return 1.00
    elif occupancy >= 0.20:
        return 0.95   # low demand → slight discount
    else:
        return 0.90   # very low demand → bigger discount


# ─── ML calibration (Layer 2 – optional) ─────────────────────────────────────

def _ml_calibration_available() -> bool:
    """Check if a trained model artifact exists on disk."""
    import os
    return os.path.exists("/tmp/kuriftu_pricing_model.joblib")


def _ml_predict_multiplier(features: dict) -> Optional[float]:
    """
    Gradient Boosting prediction. Returns a calibrated final multiplier or
    None if the model is unavailable / prediction fails.
    """
    try:
        import joblib
        import numpy as np
        model = joblib.load("/tmp/kuriftu_pricing_model.joblib")
        X = np.array([[
            features["occasion_multiplier"],
            features["demand_multiplier"],
            features["lead_time_multiplier"],
            features["day_of_week_multiplier"],
            features["season_multiplier"],
            features["days_ahead"],
            features["occupancy"],
            features["month"],
            features["is_weekend"],
        ]])
        prediction = model.predict(X)[0]
        return float(prediction)
    except Exception as exc:
        logger.debug("ML calibration skipped: %s", exc)
        return None


async def _train_or_update_ml_model(db: AsyncSession) -> None:
    """
    Train/retrain the GB model from historical confirmed bookings.
    Called asynchronously; only runs when ≥100 confirmed bookings exist.
    """
    try:
        from app.models.booking import Booking
        from app.models.room import RoomCategory as RC
        import numpy as np
        from sklearn.ensemble import GradientBoostingRegressor
        import joblib

        result = await db.execute(
            select(Booking).where(Booking.status == "confirmed")
        )
        bookings = result.scalars().all()

        if len(bookings) < 100:
            logger.info("ML pricing: only %d bookings, skipping training.", len(bookings))
            return

        X, y = [], []
        for b in bookings:
            if not b.total_price or not b.check_in or not b.check_out:
                continue
            nights = max((b.check_out - b.check_in).days, 1)
            # Retrieve base price
            cat_res = await db.execute(select(RC).where(RC.name == b.room_type))
            cat = cat_res.scalar_one_or_none()
            if not cat or cat.price_per_night == 0:
                continue
            actual_multiplier = (b.total_price / nights) / cat.price_per_night
            days_ahead = max((b.check_in.date() - b.created_at.date()).days, 0)
            occupancy = 0.5   # historical occupancy not stored; use neutral
            X.append([
                1.0, 1.0, 1.0, 1.0, 1.0,  # baseline multipliers
                days_ahead,
                occupancy,
                b.check_in.month,
                1 if b.check_in.weekday() in WEEKEND_DAYS else 0,
            ])
            y.append(actual_multiplier)

        if len(X) < 100:
            return

        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
        model.fit(X, y)
        joblib.dump(model, "/tmp/kuriftu_pricing_model.joblib")
        logger.info("ML pricing model trained on %d bookings.", len(X))
    except Exception as exc:
        logger.warning("ML training failed: %s", exc)


# ─── Main public API ──────────────────────────────────────────────────────────

async def calculate_dynamic_price(
    db: AsyncSession,
    room_type: str,
    check_in: datetime,
    check_out: datetime,
) -> dict:
    """
    Orchestrates all pricing factors and returns a full breakdown dict.

    Returns:
        {
            "base_price_per_night": float,
            "dynamic_price_per_night": float,
            "total_multiplier": float,
            "breakdown": [{"factor": str, "multiplier": float, "impact": str}],
            "active_occasions": [str],
            "nights": int,
        }
    """
    # 1. Base price ─────────────────────────────────────────────────────────
    result = await db.execute(
        select(RoomCategory).where(RoomCategory.name == room_type.lower())
    )
    category = result.scalar_one_or_none()
    base_price = category.price_per_night if category else 0.0
    nights = max((check_out.date() - check_in.date()).days, 1)

    # 2. Calculate individual multipliers ───────────────────────────────────
    occasions = await _get_active_occasions(db, check_in, check_out)
    occ_mult = _calculate_occasion_multiplier(occasions)
    demand_mult = await _calculate_demand_multiplier(db, room_type)
    lead_mult = _calculate_lead_time_multiplier(check_in)
    dow_mult = _calculate_day_of_week_multiplier(check_in)
    season_mult = _calculate_season_multiplier(check_in)

    days_ahead = max((check_in.date() - datetime.utcnow().date()).days, 0)
    occupancy = (
        1.0 - (category.available_rooms / category.total_rooms)
        if category and category.total_rooms > 0
        else 0.5
    )

    # 3. Optional ML calibration ────────────────────────────────────────────
    features = {
        "occasion_multiplier": occ_mult,
        "demand_multiplier": demand_mult,
        "lead_time_multiplier": lead_mult,
        "day_of_week_multiplier": dow_mult,
        "season_multiplier": season_mult,
        "days_ahead": days_ahead,
        "occupancy": occupancy,
        "month": check_in.month,
        "is_weekend": 1 if check_in.weekday() in WEEKEND_DAYS else 0,
    }

    ml_multiplier = _ml_predict_multiplier(features) if _ml_calibration_available() else None

    # 4. Combine multipliers ─────────────────────────────────────────────────
    if ml_multiplier is not None:
        # ML gives us the TOTAL multiplier directly
        total_multiplier = ml_multiplier
        used_ml = True
    else:
        total_multiplier = occ_mult * demand_mult * lead_mult * dow_mult * season_mult
        used_ml = False

    # Round to reasonable precision
    total_multiplier = round(total_multiplier, 4)
    dynamic_price_per_night = round(base_price * total_multiplier, 2)

    # 5. Build human-readable breakdown ─────────────────────────────────────
    def _impact_str(m: float, label: str) -> str:
        pct = round((m - 1) * 100, 1)
        sign = "+" if pct >= 0 else ""
        return f"{sign}{pct}% ({label})"

    breakdown = []

    if occ_mult != 1.0:
        occasion_names = ", ".join(o.name for o in occasions)
        breakdown.append({
            "factor": f"Occasion: {occasion_names}",
            "multiplier": occ_mult,
            "impact": _impact_str(occ_mult, "Holiday / Event premium"),
        })

    if demand_mult != 1.0:
        tier = f"{round(occupancy * 100)}% occupancy"
        breakdown.append({
            "factor": f"Demand ({tier})",
            "multiplier": demand_mult,
            "impact": _impact_str(demand_mult, "Occupancy-based"),
        })

    if lead_mult != 1.0:
        breakdown.append({
            "factor": f"Lead Time ({days_ahead} days ahead)",
            "multiplier": lead_mult,
            "impact": _impact_str(lead_mult, "Advance booking"),
        })

    if dow_mult != 1.0:
        day_label = "Weekend" if check_in.weekday() in WEEKEND_DAYS else "Weekday"
        breakdown.append({
            "factor": f"Day of Week ({day_label})",
            "multiplier": dow_mult,
            "impact": _impact_str(dow_mult, f"{day_label} rate"),
        })

    if season_mult != 1.0:
        season_label = (
            "Peak season" if check_in.month in PEAK_MONTHS
            else ("Shoulder season" if check_in.month in SHOULDER_MONTHS else "Low season")
        )
        breakdown.append({
            "factor": f"Season ({season_label})",
            "multiplier": season_mult,
            "impact": _impact_str(season_mult, season_label),
        })

    if used_ml:
        breakdown.append({
            "factor": "ML Calibration (Gradient Boosting)",
            "multiplier": ml_multiplier,
            "impact": "AI-calibrated from historical bookings",
        })

    if not breakdown:
        breakdown.append({
            "factor": "Standard Rate",
            "multiplier": 1.0,
            "impact": "No adjustments applied",
        })

    price_change_pct = round((total_multiplier - 1) * 100, 1)

    # 6. Pricing note ────────────────────────────────────────────────────────
    if price_change_pct > 20:
        note = f"High-demand period – prices are {price_change_pct:.0f}% above base rate."
    elif price_change_pct > 0:
        note = f"Moderate premium of {price_change_pct:.0f}% applies to this stay."
    elif price_change_pct < -5:
        note = f"Great deal! {abs(price_change_pct):.0f}% below base rate — book now."
    else:
        note = "Standard pricing applies to this stay."

    return {
        "room_type": room_type,
        "nights": nights,
        "base_price_per_night": base_price,
        "dynamic_price_per_night": dynamic_price_per_night,
        "total_base_price": round(base_price * nights, 2),
        "total_dynamic_price": round(dynamic_price_per_night * nights, 2),
        "total_multiplier": total_multiplier,
        "price_change_pct": price_change_pct,
        "breakdown": breakdown,
        "active_occasions": [o.name for o in occasions],
        "pricing_note": note,
        "ml_used": used_ml,
    }
