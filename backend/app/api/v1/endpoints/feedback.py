from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.feedback_service import create_feedback
from app.models.feedback import Feedback
from app.api.deps import check_role, get_current_user
from app.models.staff import Staff

router = APIRouter()

@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Staff = Depends(get_current_user)
):
    # Automatically find guest_id if not provided
    if not feedback.guest_id:
        if current_user.role == "guest" and current_user.guest_id:
            feedback.guest_id = current_user.guest_id
        else:
            raise HTTPException(
                status_code=400, 
                detail="Guest ID missing and could not be linked to user account."
            )
            
    return await create_feedback(db, feedback)

@router.get("/", response_model=list[FeedbackResponse])
async def get_feedbacks(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(check_role(["manager", "admin"]))
):
    result = await db.execute(select(Feedback))
    return result.scalars().all()