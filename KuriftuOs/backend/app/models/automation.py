from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.base import Base

class SmartDevice(Base):
    __tablename__ = "smart_devices"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("room_categories.id")) # Linked to room stay
    
    device_name = Column(String) # AC, Light, TV, Safe, Curtain
    status = Column(String, default="off") # off, on, mode:romantic, temperature:22
    
    # Track the current value/mode
    current_value = Column(String, nullable=True) # e.g. "22" for AC, "warm" for lights

class RoomMood(Base):
    __tablename__ = "room_moods"

    id = Column(Integer, primary_key=True, index=True)
    mood_name = Column(String) # Relax, Romantic, Party, Morning
    
    # Presets for the mood lighting/AC
    ac_temp = Column(Integer, default=22)
    light_level = Column(String, default="low")
    music_genre = Column(String, default="Ethiopian Jazz")
