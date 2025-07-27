from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class PortfolioHistoryPoint(BaseModel):
    """A single point in portfolio history."""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    value: float = Field(..., description="Portfolio value on this date")
    gain: float = Field(default=0.0, description="Gain/loss from previous day")


class PerformanceComparisonPoint(BaseModel):
    """A single point in performance comparison data."""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    portfolio: float = Field(..., description="Portfolio percentage change")
    sp500: Optional[float] = Field(None, description="S&P 500 percentage change")
    nasdaq: Optional[float] = Field(None, description="NASDAQ percentage change")


class AllocationDataPoint(BaseModel):
    """A single allocation data point for pie charts."""

    name: str = Field(..., description="Asset/sector/country name")
    value: float = Field(..., description="Percentage allocation")
    fill: Optional[str] = Field(None, description="Chart color")


class HoldingAllocationPoint(BaseModel):
    """A single holding allocation point."""

    symbol: str = Field(..., description="Stock ticker symbol")
    name: str = Field(..., description="Asset name")
    value: float = Field(..., description="Total value in dollars")
    percentage: float = Field(..., description="Percentage of portfolio")
    fill: Optional[str] = Field(None, description="Chart color")


class AllocationChartData(BaseModel):
    """Complete allocation data for all chart types."""

    by_holdings: List[HoldingAllocationPoint] = Field(
        ..., description="Allocation by individual holdings"
    )
    by_asset_type: List[AllocationDataPoint] = Field(
        ..., description="Allocation by asset type"
    )
    by_sector: List[AllocationDataPoint] = Field(
        ..., description="Allocation by sector"
    )
    by_country: List[AllocationDataPoint] = Field(
        ..., description="Allocation by country"
    )


class PerformerData(BaseModel):
    """Best/worst performer data."""

    ticker: str = Field(..., description="Stock ticker symbol")
    percentage: float = Field(..., description="Performance percentage")


class TotalReturnData(BaseModel):
    """Total return metrics."""

    amount: float = Field(..., description="Total return amount in dollars")
    percentage: float = Field(..., description="Total return percentage")


class PortfolioMetrics(BaseModel):
    """Additional portfolio metrics for dashboard cards."""

    total_return: TotalReturnData = Field(..., description="Total return data")
    best_performer: Optional[PerformerData] = Field(
        None, description="Best performing holding"
    )
    worst_performer: Optional[PerformerData] = Field(
        None, description="Worst performing holding"
    )
    volatility: str = Field(..., description="Portfolio volatility assessment")
    holdings_count: int = Field(..., description="Number of holdings in portfolio")


# Response models
class PortfolioHistoryResponse(BaseModel):
    """Portfolio history response."""

    data: List[PortfolioHistoryPoint] = Field(
        ..., description="Portfolio history data points"
    )


class PerformanceComparisonResponse(BaseModel):
    """Performance comparison response."""

    data: List[PerformanceComparisonPoint] = Field(
        ..., description="Performance comparison data points"
    )
