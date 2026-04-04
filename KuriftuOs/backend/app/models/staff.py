from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.base import Base

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    role = Column(String, default="staff")  # staff | manager | admin | guest
    department = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=True) # Linked guest record

    is_active = Column(Boolean, default=True)