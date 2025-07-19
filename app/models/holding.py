from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from app.db import Base


class AssetType(str, Enum):
    STOCK = "stock"
    CRYPTO = "crypto"
    ETF = "etf"
    BOND = "bond"
    COMMODITY = "commodity"


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticker = Column(String, nullable=False, index=True)
    asset_type = Column(SQLEnum(AssetType), default=AssetType.STOCK)
    quantity = Column(Float, nullable=False)
    buy_price = Column(Float, nullable=False)
    current_price = Column(Float, default=0.0)
    buy_date = Column(DateTime(timezone=True), nullable=False)
    sector = Column(String, nullable=True)
    country = Column(String, nullable=True)
    market_cap = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship
    user = relationship("User", back_populates="holdings")
