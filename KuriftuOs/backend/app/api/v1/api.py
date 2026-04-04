from fastapi import APIRouter
from app.api.v1.endpoints import auth, guest, booking, room
from app.api.v1.endpoints import feedback, ai



api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(guest.router, prefix="/guests", tags=["Guests"])
api_router.include_router(booking.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(room.router, prefix="/rooms", tags=["Rooms (Admin)"])
api_router.include_router(feedback.router, prefix="/feedbacks", tags=["Feedback"])
api_router.include_router(ai.router, prefix="/ai", tags=["Selam AI Concierge"])