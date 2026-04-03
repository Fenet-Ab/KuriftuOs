import google.generativeai as genai
import os
from app.core.config import settings

# Configure using settings
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception:
    model = None # Handle cases where key is missing

async def analyze_sentiment(text: str):
    if not model:
        return "neutral" # Fallback if AI not configured
        
    prompt = f"""
    Classify the sentiment of this feedback as:
    positive, negative, or neutral.

    Feedback: "{text}"

    Only return one word.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip().lower()
    except Exception:
        return "neutral"