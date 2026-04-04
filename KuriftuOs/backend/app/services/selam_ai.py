import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.chat import ChatMessage

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


def _fallback_response(user_message: str, guest_name: str) -> str:
    msg = user_message.lower()
    if any(k in msg for k in ["best dish", "best food", "dish", "food", "menu", "eat", "restaurant"]):
        return (
            f"Selam {guest_name}! One of the most loved dishes at Kuriftu is our Ethiopian tasting platter with "
            "premium tibs, doro wot, and fresh injera. For a lighter option, guests also rate our grilled lake fish "
            "very highly. If you tell me your location (Bishoftu, Entoto, Tana, or Awash), I can recommend the exact "
            "signature dish there."
        )


    # Room mood and device action tags for automation flow.
    if "romantic" in msg:
        return (
            f"Selam {guest_name}! I set your room to Romantic mood now. "
            "Enjoy a warm ambiance and relaxing setup. [ACTION:mood:Romantic]"
        )
    if "relax" in msg:
        return (
            f"Selam {guest_name}! I switched your room to Relax mood. "
            "Lighting and comfort settings are now softened. [ACTION:mood:Relax]"
        )
    if "party" in msg:
        return (
            f"Selam {guest_name}! Party mood is activated for your room. "
            "Have a great celebration. [ACTION:mood:Party]"
        )
    if "morning" in msg:
        return (
            f"Selam {guest_name}! Morning mode is on. "
            "Your room is now set for a bright start. [ACTION:mood:Morning]"
        )
    if "focus" in msg:
        return (
            f"Selam {guest_name}! Focus mode is enabled. "
            "Your room now supports a quiet productivity setting. [ACTION:mood:Focus]"
        )
    if "turn on ac" in msg or "ac on" in msg:
        return (
            f"Selam {guest_name}! I turned on your AC. "
            "If you want, I can set a specific temperature too. [ACTION:device:ac:on]"
        )
    if "turn off ac" in msg or "ac off" in msg:
        return f"Selam {guest_name}! I turned off your AC. [ACTION:device:ac:off]"

    # Knowledge fallback for clear concierge-style responses.
    if "bishoftu" in msg:
        return (
            f"Selam {guest_name}! Kuriftu Bishoftu is our flagship lakeside resort. "
            "It is known for luxury spa treatments, family water activities, and scenic views. "
            "If you want, I can suggest the best activities for couples, families, or business stays."
        )
    if "entoto" in msg:
        return (
            f"Selam {guest_name}! Kuriftu Entoto Park focuses on adventure and nature. "
            "Top highlights include glamping, zip-lining, go-karting, and forest wellness experiences."
        )
    if "tana" in msg or "bahir dar" in msg:
        return (
            f"Selam {guest_name}! Kuriftu Lake Tana in Bahir Dar offers lake-view suites and cultural architecture. "
            "It is ideal for peaceful getaways and scenic relaxation."
        )
    if "awash" in msg:
        return (
            f"Selam {guest_name}! Kuriftu Awash blends luxury and wildlife adventure near the national park. "
            "It is a great option for nature-focused travel."
        )

    return (
        f"Selam {guest_name}! I can help with resort info, bookings, spa recommendations, and smart-room controls. "
        "Please tell me exactly what you need, and I will give a direct answer."
    )

async def get_chat_history(db: AsyncSession, guest_id: int, limit: int = 10):
    try:
        stmt = select(ChatMessage).where(ChatMessage.guest_id == guest_id).order_by(ChatMessage.timestamp.desc()).limit(limit)
        result = await db.execute(stmt)
        # Reverse to get chronological order
        return list(reversed(result.scalars().all()))
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

async def save_chat_message(db: AsyncSession, guest_id: int, role: str, message: str):
    try:
        new_msg = ChatMessage(guest_id=guest_id, role=role, message=message)
        db.add(new_msg)
        await db.commit()
    except Exception as e:
        print(f"Error saving message: {e}")
        await db.rollback()

async def generate_selam_response(db: AsyncSession, user_message: str, guest_name: str = "Guest", guest_id: int = None):
    """
    Selam AI: Personalized concierge with smart room control detection and memory.
    """
    # 1. Load history if guest_id exists
    history = []
    if guest_id:
        history = await get_chat_history(db, guest_id)
        # Save user message
        await save_chat_message(db, guest_id, "user", user_message)

    history_context = ""
    if history:
        history_entries = [f"{m.role.capitalize()}: {m.message}" for m in history]
        history_context = "\nRECENT CONVERSATION HISTORY:\n" + "\n".join(history_entries) + "\n"
    
    prompt = f"""
    You are 'Selam AI', the signature 5-star concierge for Kuriftu Resort & Spa. 
    Your personality is sophisticated, extremely warm, helpful, and deeply rooted in Ethiopian hospitality.
    The current guest's name is {guest_name}.
    {history_context}
    RESORT LOCATIONS & HIGHLIGHTS:
    - Kuriftu Bishoftu: Our flagship resort with a Luxury Spa, Water Park, and cinematic lake views.
    - Kuriftu Entoto Park: Glamping, Zip-lining, Go-karting, and forest spa.
    - Kuriftu Lake Tana (Bahir Dar): Lake-view suites and traditional architecture.
    - Kuriftu Awash: National park luxury and wildlife adventure.

    AMENITIES & SERVICES:
    - Signature Spas: Traditional Ethiopian treatments.
    - Membership: Gold, Platinum, Presidential.

    SMART ROOM CONTROLS: Relax, Romantic, Party, Morning, Focus.

    YOUR ROLE:
    1. Greeting: Welcome {guest_name} warmly.
    2. Deep Knowledge: Answer about specific resorts.
    3. Actionable Intent Detection: Detect room change needs and APPEND [ACTION:mood:...] or [ACTION:device:...].
    4. Task Requests: If the guest asks for services like cleaning, plumbing, fresh towels, or reports an issue, detect it and APPEND [ACTION:task:category:description].
       Categories: housekeeping, maintenance, room_service, concierge.
    5. Memory: Use the RECENT CONVERSATION HISTORY above to provide continuity.
    6. Language: Amharic or English.

    GUEST MESSAGE:
    "{user_message}"

    SELAM AI RESPONSE:
    """

    try:
        response = model.generate_content(prompt)
        ai_text = response.text.strip()
        
        # 2. Save AI response if guest_id exists
        if guest_id:
            await save_chat_message(db, guest_id, "assistant", ai_text)
            
        return ai_text
    except Exception as e:
        print(f"AI ERROR: {str(e)}")
        return _fallback_response(user_message, guest_name)

async def handle_guest_message(db: AsyncSession, message: str, guest_name: str = "Guest", guest_id: int = None):
    return await generate_selam_response(db, message, guest_name, guest_id)