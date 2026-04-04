import google.generativeai as genai
import os
from app.core.config import settings

# Configure Gemini
api_key = settings.GEMINI_API_KEY
if api_key:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-1.5-flash")

async def suggest_room(preferences: dict):
    prompt = f"""
    Choose the best room type for Kuriftu Resort: standard, deluxe, or suite.
    Also, provide a 1-sentence poetic description of why it fits their preferences.

    Preferences:
    {preferences}

    Rules:
    - luxury → suite
    - view → deluxe or suite
    - quiet → deluxe or suite
    - budget → standard

    Return ONLY a JSON object like this:
    {{"room_type": "deluxe", "description": "A serene sanctuary where the morning sun greets the lake, perfect for your quiet escape."}}
    """

    try:
        res = model.generate_content(prompt)
        text = res.text.strip()
        # Simple extraction if Gemini adds markdown backticks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        import json
        data = json.loads(text)
        return data["room_type"].lower(), data["description"]
    except Exception as e:
        print(f"AI Suggestion Error: {e}")
        # 🔥 fallback (IMPORTANT)
        if preferences.get("wants_luxury"):
            return "suite", "Indulge in unparalleled luxury and spacious elegance."
        if preferences.get("wants_view") or preferences.get("wants_quiet"):
            return "deluxe", "A tranquil haven with breathtaking views for your comfort."
        return "standard", "Essential comfort with all the resort amenities at your reach."
