from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.automation import SmartDevice, RoomMood

DEFAULT_MOODS = {
    "relax": {"ac_temp": 23, "light_level": "warm", "music_genre": "Ethiopian Jazz"},
    "romantic": {"ac_temp": 22, "light_level": "dim", "music_genre": "Soft Instrumental"},
    "party": {"ac_temp": 20, "light_level": "dynamic", "music_genre": "Afrobeat"},
    "morning": {"ac_temp": 24, "light_level": "bright", "music_genre": "Acoustic"},
    "focus": {"ac_temp": 21, "light_level": "cool", "music_genre": "Ambient"},
}


async def set_room_mood(db: AsyncSession, room_id: int, mood_name: str):
    # Find the mood preset
    mood_key = (mood_name or "").strip().lower()
    result = await db.execute(select(RoomMood).where(RoomMood.mood_name == mood_key))
    mood = result.scalar_one_or_none()
    
    if not mood:
        preset = DEFAULT_MOODS.get(mood_key)
        if not preset:
            return None
        mood = RoomMood(
            mood_name=mood_key,
            ac_temp=preset["ac_temp"],
            light_level=preset["light_level"],
            music_genre=preset["music_genre"],
        )
        db.add(mood)
        await db.flush()
    
    # Apply to all devices in the room
    result = await db.execute(select(SmartDevice).where(SmartDevice.room_id == room_id))
    devices = result.scalars().all()

    if not devices:
        # Create basic demo devices if none exist.
        devices = [
            SmartDevice(room_id=room_id, device_name="AC"),
            SmartDevice(room_id=room_id, device_name="Light"),
        ]
        for device in devices:
            db.add(device)
    
    for device in devices:
        if device.device_name.lower() == "ac":
            device.status = "on"
            device.current_value = str(mood.ac_temp)
        elif device.device_name.lower() == "light":
            device.status = f"mode:{mood.mood_name}"
            device.current_value = mood.light_level
            
    await db.commit()
    return devices

async def control_device(db: AsyncSession, room_id: int, device_name: str, action: str, value: str = None):
    result = await db.execute(
        select(SmartDevice).where(
            SmartDevice.room_id == room_id, 
            SmartDevice.device_name == device_name
        )
    )
    device = result.scalar_one_or_none()
    
    if not device:
        # Create if not exists for demo purposes
        device = SmartDevice(room_id=room_id, device_name=device_name)
        db.add(device)
    
    device.status = action
    if value:
        device.current_value = value
        
    await db.commit()
    await db.refresh(device)
    return device
