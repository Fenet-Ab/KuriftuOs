"""
Seed script: populates the occasions and price_rules tables with Ethiopian
holidays, international occasions, and sensible default pricing rules.

Run with:
    cd /home/betsinat/Documents/Kuriftu/KuriftuOs/KuriftuOs/backend
    python seed_pricing.py
"""
import asyncio
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings
from app.models.pricing import Occasion, PriceRule

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


OCCASIONS_2026 = [
    # ── Ethiopian Orthodox Holidays ──────────────────────────────────────────
    dict(name="Ethiopian Christmas (Gena)",       occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 1, 7),  end_date=date(2026, 1, 8),  multiplier=1.40,
         description="Ethiopian Orthodox Christmas – Gena"),

    dict(name="Ethiopian Epiphany (Timkat)",       occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 1, 19), end_date=date(2026, 1, 20), multiplier=1.35,
         description="Timkat – Ethiopian Epiphany celebration"),

    dict(name="Ethiopian Easter (Fasika)",         occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 4, 12), end_date=date(2026, 4, 13), multiplier=1.45,
         description="Fasika – Ethiopian Orthodox Easter"),

    dict(name="Ethiopian New Year (Enkutatash)",   occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 9, 11), end_date=date(2026, 9, 12), multiplier=1.50,
         description="Enkutatash – Ethiopian New Year, biggest peak"),

    dict(name="Meskel (Finding of the True Cross)", occasion_type="festival", country="Ethiopia",
         start_date=date(2026, 9, 27), end_date=date(2026, 9, 28), multiplier=1.30,
         description="Meskel – UNESCO-recognised Ethiopian festival"),

    dict(name="Ethiopian Patriots Victory Day",    occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 5, 5),  end_date=date(2026, 5, 5),  multiplier=1.15,
         description="Patriots' Victory Day – national holiday"),

    dict(name="Ethiopian Labour Day",              occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 5, 1),  end_date=date(2026, 5, 1),  multiplier=1.10,
         description="International Workers' Day"),

    dict(name="Adwa Victory Day",                  occasion_type="holiday",  country="Ethiopia",
         start_date=date(2026, 3, 2),  end_date=date(2026, 3, 2),  multiplier=1.20,
         description="Battle of Adwa – national holiday"),

    # ── Islamic Holidays (approximate 2026 dates) ────────────────────────────
    dict(name="Eid Al-Fitr 2026",                  occasion_type="holiday",  country="International",
         start_date=date(2026, 3, 20), end_date=date(2026, 3, 22), multiplier=1.30,
         description="End of Ramadan celebration"),

    dict(name="Eid Al-Adha 2026",                  occasion_type="holiday",  country="International",
         start_date=date(2026, 5, 27), end_date=date(2026, 5, 29), multiplier=1.30,
         description="Festival of Sacrifice"),

    dict(name="Mawlid Al-Nabi 2026",               occasion_type="holiday",  country="International",
         start_date=date(2026, 9, 15), end_date=date(2026, 9, 15), multiplier=1.15,
         description="Prophet Muhammad's Birthday"),

    # ── International Occasions ──────────────────────────────────────────────
    dict(name="International New Year",            occasion_type="holiday",  country="International",
         start_date=date(2026, 1, 1),  end_date=date(2026, 1, 2),  multiplier=1.30,
         description="January 1st New Year celebrations"),

    dict(name="Christmas (Dec 25)",                occasion_type="holiday",  country="International",
         start_date=date(2026, 12, 25), end_date=date(2026, 12, 26), multiplier=1.25,
         description="International Christmas"),

    dict(name="Africa Day",                        occasion_type="event",    country="International",
         start_date=date(2026, 5, 25), end_date=date(2026, 5, 25), multiplier=1.10,
         description="African Union Day"),

    # ── Kuriftu-specific Seasons ─────────────────────────────────────────────
    dict(name="Kuriftu Summer Peak",               occasion_type="season",   country="Ethiopia",
         start_date=date(2026, 7, 1),  end_date=date(2026, 7, 31), multiplier=1.20,
         description="Summer peak tourism period"),

    dict(name="Kuriftu Long Weekend (Cluster)",    occasion_type="event",    country="Ethiopia",
         start_date=date(2026, 11, 27), end_date=date(2026, 11, 29), multiplier=1.18,
         description="Late November long-weekend resort spike"),
]


PRICE_RULES = [
    dict(
        name="High Demand Surge",
        rule_type="demand",
        condition={"threshold": 0.80, "multiplier": 1.25},
        multiplier=1.25,
        priority=3,
        description="When >80% of rooms are booked, apply 25% surge pricing",
    ),
    dict(
        name="Moderate Demand",
        rule_type="demand",
        condition={"threshold": 0.60, "multiplier": 1.12},
        multiplier=1.12,
        priority=2,
        description="When 60-80% occupancy, apply 12% uplift",
    ),
    dict(
        name="Low Demand Discount",
        rule_type="demand",
        condition={"threshold": 0.30, "multiplier": 0.90},
        multiplier=0.90,
        priority=1,
        description="When <30% occupancy, apply 10% discount to stimulate bookings",
    ),
    dict(
        name="Last Minute (under 3 days)",
        rule_type="lead_time",
        condition={"max_days": 3, "multiplier": 1.30},
        multiplier=1.30,
        priority=4,
        description="Booking within 3 days of arrival: +30% last-minute premium",
    ),
    dict(
        name="Early Bird (60+ days)",
        rule_type="lead_time",
        condition={"min_days": 60, "multiplier": 0.90},
        multiplier=0.90,
        priority=2,
        description="Booking 60+ days out: 10% early bird discount",
    ),
    dict(
        name="Weekend Premium",
        rule_type="day_of_week",
        condition={"days": [4, 5], "multiplier": 1.15},
        multiplier=1.15,
        priority=2,
        description="Friday & Saturday check-ins: +15% weekend rate",
    ),
    dict(
        name="Midweek Discount",
        rule_type="day_of_week",
        condition={"days": [1, 2, 3], "multiplier": 0.95},
        multiplier=0.95,
        priority=1,
        description="Tue-Thu check-ins: 5% midweek discount",
    ),
    dict(
        name="Peak Season (Sep-Oct)",
        rule_type="season",
        condition={"months": [9, 10], "multiplier": 1.30},
        multiplier=1.30,
        priority=3,
        description="Ethiopian New Year + Meskel cluster → peak season pricing",
    ),
    dict(
        name="Low Season (Feb-Mar)",
        rule_type="season",
        condition={"months": [2, 3], "multiplier": 0.88},
        multiplier=0.88,
        priority=1,
        description="Low visitor months: 12% discount",
    ),
]


async def seed():
    async with AsyncSessionLocal() as db:
        # Seed Occasions
        print("🗓  Seeding occasions...")
        seeded_occasions = 0
        for occ_data in OCCASIONS_2026:
            existing = await db.execute(
                select(Occasion).where(Occasion.name == occ_data["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  ⏭  Skipped (already exists): {occ_data['name']}")
                continue
            db.add(Occasion(**occ_data))
            seeded_occasions += 1
            print(f"  ✅ Added: {occ_data['name']} (×{occ_data['multiplier']})")

        # Seed Price Rules
        print("\n📐 Seeding price rules...")
        seeded_rules = 0
        for rule_data in PRICE_RULES:
            existing = await db.execute(
                select(PriceRule).where(PriceRule.name == rule_data["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  ⏭  Skipped (already exists): {rule_data['name']}")
                continue
            db.add(PriceRule(**rule_data))
            seeded_rules += 1
            print(f"  ✅ Added: {rule_data['name']}")

        await db.commit()
        print(f"\n🎉 Done! {seeded_occasions} occasions and {seeded_rules} rules seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
