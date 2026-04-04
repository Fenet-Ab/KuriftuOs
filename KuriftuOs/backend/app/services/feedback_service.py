from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.models.feedback import Feedback
from app.models.booking import Booking
from app.services.gemini_service import analyze_sentiment
from fastapi import HTTPException

async def create_feedback(db: AsyncSession, data):
    # Retrieve the booking to confidently determine the guest_id
    booking_q = await db.execute(select(Booking).where(Booking.id == data.booking_id))
    booking = booking_q.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found. Cannot submit feedback without a valid reservation.")

    # 馃敟 AI SENTIMENT ANALYSIS
    sentiment = await analyze_sentiment(data.comment)

    feedback = Feedback(
        guest_id=booking.guest_id, # Inherit perfectly matched guest_id from the booking itself!
        booking_id=data.booking_id,
        comment=data.comment,
        sentiment=sentiment
    )

    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    return feedback

async def get_feedback_analytics(db: AsyncSession):
    total_q = await db.execute(select(func.count()).select_from(Feedback))
    total_feedbacks = total_q.scalar_one()
    
    sent_q = await db.execute(select(Feedback.sentiment, func.count()).group_by(Feedback.sentiment))
    sentiment_distribution = {row[0]: row[1] for row in sent_q.all()}
    
    for key in ["positive", "negative", "neutral"]:
        if key not in sentiment_distribution:
            sentiment_distribution[key] = 0
            
    return {
        "total_feedbacks": total_feedbacks, 
        "sentiment_distribution": sentiment_distribution
    }