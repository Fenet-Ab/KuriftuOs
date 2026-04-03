from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    language_pref = Column(String, default="en")