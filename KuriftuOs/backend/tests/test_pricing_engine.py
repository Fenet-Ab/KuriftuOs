"""
Unit tests for the dynamic pricing engine.
Run: cd backend && python -m pytest tests/test_pricing_engine.py -v
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

# ── Import the functions under test ──────────────────────────────────────────
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.pricing_engine import (
    _calculate_lead_time_multiplier,
    _calculate_day_of_week_multiplier,
    _calculate_season_multiplier,
    _calculate_occasion_multiplier,
    LEAD_TIME_TIERS,
    WEEKEND_DAYS,
    PEAK_MONTHS,
    LOW_SEASON_MONTHS,
)


# ── Helper ────────────────────────────────────────────────────────────────────
def dt(days_ahead: int, hour: int = 12, weekday_override=None) -> datetime:
    """Return a datetime `days_ahead` days from now, optionally adjusting to a specific weekday."""
    base = datetime.utcnow() + timedelta(days=days_ahead)
    if weekday_override is not None:
        # shift to the desired weekday
        diff = (weekday_override - base.weekday()) % 7
        base = base + timedelta(days=diff)
    return base.replace(hour=hour, minute=0, second=0, microsecond=0)


# ── Lead Time Tests ───────────────────────────────────────────────────────────
class TestLeadTimeMultiplier:
    def test_last_minute_under_3_days(self):
        m = _calculate_lead_time_multiplier(dt(1))
        assert m == 1.30, f"Expected 1.30 for 1 day ahead, got {m}"

    def test_short_notice_5_days(self):
        m = _calculate_lead_time_multiplier(dt(5))
        assert m == 1.15

    def test_standard_14_days(self):
        m = _calculate_lead_time_multiplier(dt(14))
        assert m == 1.05

    def test_standard_30_days(self):
        m = _calculate_lead_time_multiplier(dt(30))
        assert m == 1.00

    def test_early_bird_45_days(self):
        m = _calculate_lead_time_multiplier(dt(45))
        assert m == 0.95

    def test_very_early_bird_90_days(self):
        m = _calculate_lead_time_multiplier(dt(90))
        assert m == 0.90

    def test_past_date_treated_as_0(self):
        # Past / same-day bookings treated as 0 days → last-minute tier
        yesterday = dt(-1)
        m = _calculate_lead_time_multiplier(yesterday)
        assert m == 1.30


# ── Day of Week Tests ─────────────────────────────────────────────────────────
class TestDayOfWeekMultiplier:
    def test_friday_is_weekend(self):
        friday = dt(7, weekday_override=4)  # Friday
        assert _calculate_day_of_week_multiplier(friday) == 1.15

    def test_saturday_is_weekend(self):
        saturday = dt(7, weekday_override=5)  # Saturday
        assert _calculate_day_of_week_multiplier(saturday) == 1.15

    def test_monday_is_weekday(self):
        monday = dt(7, weekday_override=0)
        assert _calculate_day_of_week_multiplier(monday) == 0.95

    def test_wednesday_is_weekday(self):
        wednesday = dt(7, weekday_override=2)
        assert _calculate_day_of_week_multiplier(wednesday) == 0.95

    def test_sunday_is_weekday(self):
        # Sunday (6) is NOT in WEEKEND_DAYS {4, 5}
        sunday = dt(7, weekday_override=6)
        assert _calculate_day_of_week_multiplier(sunday) == 0.95


# ── Season Tests ──────────────────────────────────────────────────────────────
class TestSeasonMultiplier:
    def test_peak_month_september(self):
        sept = datetime(2026, 9, 11)
        assert _calculate_season_multiplier(sept) == 1.20

    def test_peak_month_january(self):
        jan = datetime(2026, 1, 7)
        assert _calculate_season_multiplier(jan) == 1.20

    def test_low_season_february(self):
        feb = datetime(2026, 2, 15)
        assert _calculate_season_multiplier(feb) == 0.88

    def test_shoulder_month_april(self):
        apr = datetime(2026, 4, 10)
        assert _calculate_season_multiplier(apr) == 1.05

    def test_neutral_month_june(self):
        # June IS in SHOULDER_MONTHS {4,5,6} → multiplier is 1.05, not neutral 1.00
        june = datetime(2026, 6, 15)
        assert _calculate_season_multiplier(june) == 1.05

    def test_low_season_august(self):
        # August IS in LOW_SEASON_MONTHS {2,3,8} → 0.88
        aug = datetime(2026, 8, 15)
        assert _calculate_season_multiplier(aug) == 0.88



# ── Occasion Multiplier Tests ─────────────────────────────────────────────────
class TestOccasionMultiplier:
    def _make_occasion(self, multiplier: float):
        occ = MagicMock()
        occ.multiplier = multiplier
        return occ

    def test_no_occasions_returns_1(self):
        assert _calculate_occasion_multiplier([]) == 1.0

    def test_single_occasion(self):
        occ = self._make_occasion(1.40)
        assert _calculate_occasion_multiplier([occ]) == 1.40

    def test_multiple_occasions_max_taken(self):
        # Two overlapping occasions – we take the MAX, not compound
        occasions = [self._make_occasion(1.30), self._make_occasion(1.50)]
        assert _calculate_occasion_multiplier(occasions) == 1.50

    def test_sub_one_multiplier_discount(self):
        occ = self._make_occasion(0.85)
        assert _calculate_occasion_multiplier([occ]) == 0.85


# ── Combined Multiplier Sanity Check ─────────────────────────────────────────
class TestCombinedMultiplier:
    def test_enkutatash_premium(self):
        """Ethiopian New Year (Sep 11) + weekend + peak season should yield a big multiplier."""
        occ = MagicMock()
        occ.multiplier = 1.50  # Enkutatash
        occ_mult = _calculate_occasion_multiplier([occ])

        sept11_friday = datetime(2026, 9, 11)  # happens to be a Friday in 2026
        dow_mult = _calculate_day_of_week_multiplier(sept11_friday)
        season_mult = _calculate_season_multiplier(sept11_friday)

        combined = occ_mult * dow_mult * season_mult
        assert combined > 1.5, f"Expected > 1.5 total multiplier, got {combined}"

    def test_low_season_mid_week_early_bird_discount(self):
        """February + Tuesday + 90 days ahead should yield < 1.0 combined."""
        lead_mult = _calculate_lead_time_multiplier(dt(90))
        feb_tuesday = datetime(2026, 2, 10)  # Tuesday
        dow_mult = _calculate_day_of_week_multiplier(feb_tuesday)
        season_mult = _calculate_season_multiplier(feb_tuesday)

        combined = lead_mult * dow_mult * season_mult
        assert combined < 1.0, f"Expected < 1.0 total multiplier, got {combined}"
