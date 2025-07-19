from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AssetType(str, Enum):
    STOCK = "stock"
    CRYPTO = "crypto"
    ETF = "etf"
    BOND = "bond"
    COMMODITY = "commodity"


class HoldingBase(BaseModel):
    ticker: str = Field(..., description="Stock/asset ticker symbol")
    asset_type: AssetType = AssetType.STOCK
    quantity: float = Field(..., gt=0, description="Number of shares/units")
    buy_price: float = Field(..., gt=0, description="Purchase price per unit")
    buy_date: datetime = Field(..., description="Purchase date")


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    ticker: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    buy_price: Optional[float] = Field(None, gt=0)
    buy_date: Optional[datetime] = None


class HoldingInDB(HoldingBase):
    id: int
    user_id: int
    current_price: float
    sector: Optional[str] = None
    country: Optional[str] = None
    market_cap: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Holding(HoldingInDB):
    total_value: float
    total_cost: float
    profit_loss: float
    profit_loss_percentage: float


class PortfolioSummary(BaseModel):
    total_value: float
    total_cost: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    holdings_count: int
    holdings: List[Holding]


class AllocationData(BaseModel):
    by_asset_type: dict
    by_sector: dict
    by_country: dict
    top_performers: List[Holding]
    worst_performers: List[Holding]
