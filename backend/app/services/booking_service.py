import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.booking import Booking
from app.models.room import RoomCategory
from app.core.config import settings
from fastapi import HTTPException
import uuid

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
async def process_booking(db: AsyncSession, booking_data):
    is_available, price_per_night = await check_availability(db, booking_data.room_type)
    
    if not is_available:
        raise HTTPException(status_code=400, detail="No rooms available for this type.")
        
    # Subtract one room immediately (pending status)
    result = await db.execute(
        select(RoomCategory).where(RoomCategory.name == booking_data.room_type.lower())
    )
    category = result.scalar_one()
    category.available_rooms -= 1
    
    new_booking = Booking(
        guest_id=booking_data.guest_id,
        room_type=booking_data.room_type,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        status="pending",
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
        "callback_url": "https://your-domain.com/api/v1/bookings/payment-callback",
        "return_url": "https://your-domain.com/payment-success",
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
