import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.booking import Booking
from app.models.room import RoomCategory
from app.core.config import settings
from fastapi import HTTPException
import uuid
from app.services.ai_booking import suggest_room
from app.services.pricing_engine import calculate_dynamic_price

# Check if rooms are available
async def check_availability(db: AsyncSession, room_type: str):
    result = await db.execute(
        select(RoomCategory).where(RoomCategory.name == room_type.lower())
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail=f"Room type {room_type} not found")
        
    return category.available_rooms > 0, category.price_per_night

# Create booking service
async def process_booking(db: AsyncSession, booking_data, current_user=None):
    # Ensure we use the correct guest_id for the logged-in user
    guest_id = booking_data.guest_id
    
    if current_user and current_user.guest_id:
        guest_id = current_user.guest_id
    elif current_user:
        # If user is a guest but has no guest record yet, create one
        from app.models.guest import Guest
        from sqlalchemy.future import select as sa_select
        
        # Check if guest with this name already exists or just create
        new_guest = Guest(name=current_user.name, phone_number=f"temp-{current_user.id}")
        db.add(new_guest)
        await db.commit()
        await db.refresh(new_guest)
        
        # Link to staff/user
        current_user.guest_id = new_guest.id
        await db.commit()
        guest_id = new_guest.id

    is_available, price_per_night = await check_availability(db, booking_data.room_type)
    
    if not is_available:
        raise HTTPException(status_code=400, detail="No rooms available for this type.")
        
    # Subtract one room immediately (pending status)
    result = await db.execute(
        select(RoomCategory).where(RoomCategory.name == booking_data.room_type.lower())
    )
    category = result.scalar_one()
    category.available_rooms -= 1
    
    # Calculate total price using the dynamic pricing engine
    from datetime import datetime
    delta = (booking_data.check_out - booking_data.check_in).days
    nights = delta if delta > 0 else 1
    pricing = await calculate_dynamic_price(
        db, booking_data.room_type, booking_data.check_in, booking_data.check_out
    )
    total_price = pricing["total_dynamic_price"]
    
    new_booking = Booking(
        guest_id=guest_id,
        room_type=booking_data.room_type,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        status="pending",
        total_price=total_price,
        transaction_id=str(uuid.uuid4()) # Temporary ID for payment
    )
    
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    return new_booking, price_per_night

# Chapa Integration to Initialize Payment
async def initialize_chapa_payment(booking_id: int, amount: float, email: str, first_name: str, last_name: str):
    url = "https://api.chapa.co/v1/transaction/initialize"
    headers = {
        "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    # In production, use your actual webhook/callback URLs
    payload = {
        "amount": str(amount),
        "currency": "ETB",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "tx_ref": f"booking-{booking_id}-{uuid.uuid4().hex[:6]}",
        "callback_url": "http://localhost:8000/api/v1/bookings/payment-callback",
        "return_url": "http://localhost:3000/dashboard/bookings",
        "customization[title]": "Kuriftu Room Booking",
        "customization[description]": "Payment for stay"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        
    if response.status_code != 200:
        logger_error = response.json().get("message", "Payment initialization failed")
        raise HTTPException(status_code=400, detail=logger_error)
        
    return response.json()

# Confirm payment status and finalize booking
async def confirm_booking_payment(db: AsyncSession, booking_id: int, tx_ref: str):
    # In a real app, verify tx_ref with Chapa API here
    # For now, we update the booking status to confirmed manually or via callback
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "confirmed"
    booking.transaction_id = tx_ref
    
    await db.commit()
    await db.refresh(booking)
    return booking

async def smart_booking(db: AsyncSession, data):
    preferences = {
        "wants_view": data.wants_view,
        "wants_quiet": data.wants_quiet,
        "wants_luxury": data.wants_luxury
    }

    # 🔥 AI selects room
    room_type, ai_description = await suggest_room(preferences)

    # 🔥 Check availability
    try:
        is_available, price = await check_availability(db, room_type)
    except HTTPException:
        is_available, price = False, 0

    if not is_available:
        # fallback to lower tier
        fallback = ["suite", "deluxe", "standard"]
        
        # remove the one AI already suggested if needed, but easier to just loop all
        for r_type in fallback:
            try:
                available, fallback_price = await check_availability(db, r_type)
                if available:
                    room_type = r_type
                    price = fallback_price
                    break
            except HTTPException:
                continue
        else:
            return {"error": "No rooms available"}

    return {
        "room_type": room_type,
        "price_per_night": price,
        "message": ai_description
    }
