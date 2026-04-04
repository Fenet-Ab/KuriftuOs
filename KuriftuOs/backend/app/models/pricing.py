from sqlalchemy import Column, Integer, String, Float, Boolean, Date, JSON, Text
from app.db.base import Base


class Occasion(Base):
    """
    Represents a special occasion (holiday, event, festival) that can
    affect pricing. A multiplier > 1 increases price, < 1 decreases it.
    """
    __tablename__ = "occasions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)          # e.g. "Ethiopian New Year"
    occasion_type = Column(String)                           # holiday | festival | event | other
    country = Column(String, default="Ethiopia")             # Ethiopia | International | Any
    start_date = Column(Date, nullable=False)                # e.g. 2026-09-11
    end_date = Column(Date, nullable=False)                  # e.g. 2026-09-13
    multiplier = Column(Float, default=1.0)                  # e.g. 1.5 → 50% premium
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)


class PriceRule(Base):
    """
    Generic rule-based pricing modifier. Rules are evaluated at booking time
    and combined multiplicatively with occasion multipliers.
    """
    __tablename__ = "price_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    rule_type = Column(String)                               # demand | lead_time | day_of_week | season
    # JSON dict describing thresholds, e.g.:
    # demand:       {"threshold": 0.8, "multiplier": 1.2}
    # lead_time:    [{"max_days": 3, "multiplier": 1.25}, ...]
    # day_of_week:  {"days": [4, 5], "multiplier": 1.15}   # 4=Fri, 5=Sat
    # season:       {"months": [9, 10, 11], "multiplier": 1.3}
    condition = Column(JSON, nullable=False)
    multiplier = Column(Float, default=1.0)                  # fallback flat multiplier
    priority = Column(Integer, default=1)                    # higher = applied first
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
