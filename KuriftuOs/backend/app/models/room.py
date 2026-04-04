from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RoomCategory(Base):
    __tablename__ = "room_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g. "standard", "deluxe", "suite"
    total_rooms = Column(Integer)
    available_rooms = Column(Integer)
    price_per_night = Column(Float)
    image_url = Column(String, nullable=True)

    # Individual rooms in this category
    rooms = relationship("Room", back_populates="category", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True) # e.g. "RM-101", "RM-102"
    description = Column(String, nullable=True)
    status = Column(String, default="available") # available | booked | maintenance
    is_active = Column(Boolean, default=True)

    category_id = Column(Integer, ForeignKey("room_categories.id"))
    category = relationship("RoomCategory", back_populates="rooms")
