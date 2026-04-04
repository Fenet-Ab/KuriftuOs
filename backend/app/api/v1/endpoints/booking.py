from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.booking import BookingCreate, BookingResponse, PaymentInitialize
from app.services.booking_service import process_booking, confirm_booking_payment, initialize_chapa_payment, smart_booking
from app.models.staff import Staff

router = APIRouter()

@router.get("/my-bookings", response_model=list[BookingResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Retrieve all bookings for the currently logged-in guest."""
    from sqlalchemy.future import select
    from app.models.booking import Booking
    
    # Use the linked guest_id for this user
    guest_id = current_user.guest_id
    if not guest_id:
        return [] # User has no guest record yet
        
    result = await db.execute(
        select(Booking).where(Booking.guest_id == guest_id)
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Create a pending booking (subtracts room capacity automatically). Only AI/Staff logic here."""
    new_booking, price = await process_booking(db, booking, current_user=current_user)
    # Automatically inform the user of the price and next steps
    return new_booking

# Payment initiation endpoint
@router.post("/pay", response_model=dict)
async def pay_for_booking(
    payment: PaymentInitialize,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    """Redirect user to Chapa for payment."""
    return await initialize_chapa_payment(
        payment.booking_id,
        payment.amount,
        payment.email,
        payment.first_name,
        payment.last_name
    )

# Callback URL for Chapa after payment (public because Chapa needs to call it)
@router.get("/payment-callback", response_model=BookingResponse)
async def payment_callback(
    booking_id: int,
    tx_ref: str,
    db: AsyncSession = Depends(get_db)
):
    """This route is for Chapa's webhook/callback after payment successful."""
    return await confirm_booking_payment(db, booking_id, tx_ref)

@router.post("/suggest")
async def suggest_booking(
    booking: BookingCreate,
    db: AsyncSession = Depends(get_db)
):
    """Suggest a room based on AI preferences and availability."""
    return await smart_booking(db, booking)
