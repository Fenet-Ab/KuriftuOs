"""
Database seed script — run once after `alembic upgrade head`.
Creates:
  - Default Kuriftu Bishoftu property
  - 6 sample rooms (one per category)
  - 6 upsell packages
  - Default admin staff account (change password immediately)

Usage:
  cd backend && python -m app.db.seed
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.db.models.property import Property
from app.db.models.room import Room, RoomCategory
from app.db.models.staff import Staff, StaffRole
from app.db.models.upsell import UpsellCategory, UpsellPackage

PROPERTY = {
    "name": "Kuriftu Resort & Spa Bishoftu",
    "location": "Bishoftu (Debre Zeit), Oromia, Ethiopia",
    "whatsapp_phone_number_id": "",
}

ROOMS = [
    {
        "number": "101",
        "category": RoomCategory.STANDARD,
        "floor": 1,
        "base_rate_etb": 4500.0,
    },
    {
        "number": "201",
        "category": RoomCategory.DELUXE,
        "floor": 2,
        "base_rate_etb": 6500.0,
    },
    {
        "number": "301",
        "category": RoomCategory.LAKE_VIEW,
        "floor": 3,
        "base_rate_etb": 8500.0,
    },
    {
        "number": "302",
        "category": RoomCategory.GARDEN_VIEW,
        "floor": 3,
        "base_rate_etb": 7000.0,
    },
    {
        "number": "401",
        "category": RoomCategory.SUITE,
        "floor": 4,
        "base_rate_etb": 14000.0,
    },
    {
        "number": "501",
        "category": RoomCategory.PRESIDENTIAL,
        "floor": 5,
        "base_rate_etb": 28000.0,
    },
]

UPSELL_PACKAGES = [
    {
        "name": "Couples Spa Package",
        "description": "90-minute couples massage followed by a rose water bath ritual. Perfect for anniversaries.",
        "price_etb": 1200.0,
        "category": UpsellCategory.SPA,
        "best_for_times": "afternoon,evening",
    },
    {
        "name": "Ethiopian Dinner Experience",
        "description": "Private lakeside injera dinner for two with traditional mesob presentation and tej.",
        "price_etb": 850.0,
        "category": UpsellCategory.DINING,
        "best_for_times": "evening",
    },
    {
        "name": "Sunrise Lake Boat Tour",
        "description": "Private 90-minute sunrise boat tour on Lake Bishoftu with coffee and fresh fruit.",
        "price_etb": 650.0,
        "category": UpsellCategory.ACTIVITY,
        "best_for_times": "morning",
    },
    {
        "name": "Day Spa Wellness Journey",
        "description": "Full-day spa access including sauna, steam, pool, and two signature treatments.",
        "price_etb": 1800.0,
        "category": UpsellCategory.SPA,
        "best_for_times": "morning,afternoon",
    },
    {
        "name": "Poolside Breakfast",
        "description": "Exclusive poolside breakfast with traditional Ethiopian coffee ceremony and fresh juices.",
        "price_etb": 420.0,
        "category": UpsellCategory.DINING,
        "best_for_times": "morning",
    },
    {
        "name": "Cultural Heritage Tour",
        "description": "Private guided tour of Bishoftu crater lakes and Addis Ababa historical sites.",
        "price_etb": 950.0,
        "category": UpsellCategory.ACTIVITY,
        "best_for_times": "morning,afternoon",
    },
]

ADMIN_STAFF = {
    "name": "System Admin",
    "email": "admin@kuriftu.com",
    "password": "ChangeMe123!",  # CHANGE THIS IMMEDIATELY
    "role": StaffRole.ADMIN,
}


async def seed():
    async with AsyncSessionLocal() as db:
        # Property
        prop = Property(**PROPERTY)
        db.add(prop)
        await db.flush()

        # Rooms
        for r in ROOMS:
            db.add(Room(**r, property_id=prop.id))

        # Upsell packages
        for p in UPSELL_PACKAGES:
            db.add(UpsellPackage(**p))

        # Admin staff
        admin = Staff(
            name=ADMIN_STAFF["name"],
            email=ADMIN_STAFF["email"],
            hashed_password=hash_password(ADMIN_STAFF["password"]),
            role=ADMIN_STAFF["role"],
            property_id=prop.id,
        )
        db.add(admin)

        await db.commit()
        print(f"Seeded property '{prop.name}' (id={prop.id})")
        print(f"Created {len(ROOMS)} rooms and {len(UPSELL_PACKAGES)} upsell packages")
        print(f"Admin account: {ADMIN_STAFF['email']} / {ADMIN_STAFF['password']}")
        print("⚠️  Change the admin password immediately after first login!")


if __name__ == "__main__":
    asyncio.run(seed())
