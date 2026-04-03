from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feedback import Feedback
from app.services.gemini_service import analyze_sentiment

async def create_feedback(db: AsyncSession, data):
    # 🔥 AI SENTIMENT ANALYSIS
    sentiment = await analyze_sentiment(data.comment)

    feedback = Feedback(
        guest_id=data.guest_id,
        booking_id=data.booking_id,
        comment=data.comment,
        sentiment=sentiment
    )

    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    return feedback