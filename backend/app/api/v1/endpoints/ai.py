from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import logging
import re
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.ai import AIRequest, AIResponse
from app.services.selam_ai import handle_guest_message
from app.services.automation_service import set_room_mood, control_device
from app.core.security import decode_access_token
from app.models.guest import Guest
from sqlalchemy import select

router = APIRouter()
bearer = HTTPBearer(auto_error=False)
logger = logging.getLogger("kuriftuos")

@router.post("/chat", response_model=AIResponse)
async def chat_with_concierge(
    request: AIRequest,
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
):
    guest_name = "Guest"
    guest_id = None
    
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and payload.get("sub"):
            identity = str(payload["sub"])
            # Fallback name
            guest_name = identity.split("@")[0].replace(".", " ").title()
            
            # Lookup guest_id by phone or email (sub)
            try:
                # Assuming 'sub' might be phone_number or email
                stmt = select(Guest).where(Guest.phone_number == identity)
                result = await db.execute(stmt)
                guest = result.scalar_one_or_none()
                if guest:
                    guest_id = guest.id
                    guest_name = guest.name
            except Exception:
                pass

    # 1. Get personalized response from AI with history support
    ai_raw_response = await handle_guest_message(db, request.message, guest_name, guest_id)
    
    # 2. Extract [ACTION:...] tags
    action_match = re.search(r"\[ACTION:(.*?)\]", ai_raw_response)
    
    if action_match:
        try:
            action_data = action_match.group(1).split(":")
            action_type = action_data[0]  # mood or device

            # We need a room_id. For now, we assume user is in their booked room.
            # Ideally, we look up their active booking. For demo, we use a default ID.
            room_id = 1

            if action_type == "mood" and len(action_data) >= 2:
                mood_name = action_data[1]
                await set_room_mood(db, room_id, mood_name)
            elif action_type == "device" and len(action_data) >= 3:
                device_name = action_data[1]
                action = action_data[2]
                value = action_data[3] if len(action_data) > 3 else None
                await control_device(db, room_id, device_name, action, value)
            elif action_type == "task" and len(action_data) >= 3:
                category = action_data[1]
                description = ":".join(action_data[2:])
                from app.models.task import Task, TaskStatus, TaskPriority, TaskCategory
                from app.api.v1.endpoints.task import manager as ws_manager
                
                new_task = Task(
                    category=category,
                    description=description,
                    priority=TaskPriority.HIGH if category == "maintenance" else TaskPriority.NORMAL,
                    status=TaskStatus.NEW,
                    property_id=1
                )
                db.add(new_task)
                await db.commit()
                await db.refresh(new_task)
                
                await ws_manager.broadcast({
                    "event": "task_created",
                    "task": {"id": new_task.id, "description": description, "category": category, "status": "new"}
                })
        except Exception as e:
            # Never fail user-facing chat because of automation side effects.
            logger.warning("AI automation action failed: %s", str(e))
            
    # 3. Clean tags from response for the user
    clean_response = re.sub(r"\[ACTION:.*?\]", "", ai_raw_response).strip()
    
    return {"response": clean_response}