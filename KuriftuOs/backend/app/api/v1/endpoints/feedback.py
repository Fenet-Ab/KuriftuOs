from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackAnalytics
from app.services.feedback_service import create_feedback, get_feedback_analytics
from app.models.feedback import Feedback
from app.api.deps import check_role, get_current_user
from app.models.staff import Staff

router = APIRouter()

@router.post("", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    try:
        # Relies entirely on the internal service to bind `guest_id` securely from the booking
        return await create_feedback(db, feedback)
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        # Cleanly strip psycopg2 noise for client if it miraculously happens
        err_msg = str(e)
        if "Foreign key constraint" in err_msg or "violates foreign key" in err_msg:
            err_msg = "Invalid Reservation. Please refresh and try again."
            
        raise HTTPException(status_code=400, detail=err_msg)

@router.get("", response_model=list[FeedbackResponse])
async def get_feedbacks(
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(check_role(["manager", "admin"]))
):
    result = await db.execute(select(Feedback))
    return result.scalars().all()

@router.get("/analytics", response_model=FeedbackAnalytics)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(check_role(["manager", "admin"]))
):
    return await get_feedback_analytics(db)