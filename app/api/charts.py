# app/api/charts.py - Add timeouts to prevent hanging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.auth import get_current_user
from app.schemas.user import User
from app.schemas.chart import (
    PortfolioHistoryPoint,
    PerformanceComparisonPoint,
    AllocationChartData,
    PortfolioMetrics,
    PerformerData,
    TotalReturnData,
)
from app.services.chart_data import ChartDataService
from typing import List
import logging
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/portfolio-history", response_model=List[PortfolioHistoryPoint])
async def get_portfolio_history(
    days: int = Query(30, ge=7, le=365, description="Number of days of history"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get portfolio value history over time using real holdings data."""
    try:
        # Add timeout to prevent hanging
        chart_service = ChartDataService(db)
        history_data = await asyncio.wait_for(
            chart_service.get_portfolio_history(current_user.id, days),
            timeout=10.0,  # 10 second timeout
        )

        if not history_data:
            logger.warning(f"No portfolio history data for user {current_user.id}")
            return []

        # Convert to Pydantic models
        return [
            PortfolioHistoryPoint(
                date=point["date"], value=point["value"], gain=point.get("gain", 0.0)
            )
            for point in history_data
        ]
    except asyncio.TimeoutError:
        logger.error(f"Timeout getting portfolio history for user {current_user.id}")
        return []
    except Exception as e:
        logger.error(f"Error getting portfolio history for user {current_user.id}: {e}")
        return []


@router.get("/allocation-data", response_model=AllocationChartData)
async def get_allocation_chart_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get real allocation data for pie charts."""
    try:
        chart_service = ChartDataService(db)
        allocation_data = await asyncio.wait_for(
            chart_service.get_allocation_chart_data(current_user.id),
            timeout=10.0,  # 10 second timeout
        )

        # Convert to Pydantic model
        return AllocationChartData(**allocation_data)
    except asyncio.TimeoutError:
        logger.error(f"Timeout getting allocation data for user {current_user.id}")
        return AllocationChartData(
            by_holdings=[], by_asset_type=[], by_sector=[], by_country=[]
        )
    except Exception as e:
        logger.error(f"Error getting allocation data for user {current_user.id}: {e}")
        return AllocationChartData(
            by_holdings=[], by_asset_type=[], by_sector=[], by_country=[]
        )


@router.get("/performance-comparison", response_model=List[PerformanceComparisonPoint])
async def get_performance_comparison(
    days: int = Query(30, ge=7, le=365, description="Number of days of history"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get portfolio performance vs market indices using real data."""
    try:
        chart_service = ChartDataService(db)
        comparison_data = await asyncio.wait_for(
            chart_service.get_performance_comparison(current_user.id, days),
            timeout=10.0,
        )

        if not comparison_data:
            return []

        return [
            PerformanceComparisonPoint(
                date=point["date"],
                portfolio=point["portfolio"],
                sp500=point.get("sp500"),
                nasdaq=point.get("nasdaq"),
            )
            for point in comparison_data
        ]
    except asyncio.TimeoutError:
        logger.error(
            f"Timeout getting performance comparison for user {current_user.id}"
        )
        return []
    except Exception as e:
        logger.error(
            f"Error getting performance comparison for user {current_user.id}: {e}"
        )
        return []


@router.get("/portfolio-metrics", response_model=PortfolioMetrics)
async def get_portfolio_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get additional portfolio metrics for dashboard cards."""
    try:
        # Get portfolio summary with timeout
        from app.services.holdings import HoldingService

        holding_service = HoldingService(db)

        try:
            portfolio_summary, holdings = await asyncio.gather(
                asyncio.wait_for(
                    holding_service.get_portfolio_summary(current_user.id), timeout=5.0
                ),
                asyncio.wait_for(
                    holding_service.get_user_holdings(current_user.id), timeout=5.0
                ),
            )
        except asyncio.TimeoutError:
            logger.warning(
                f"Timeout fetching portfolio data for user {current_user.id}"
            )
            return PortfolioMetrics(
                total_return=TotalReturnData(amount=0.0, percentage=0.0),
                best_performer=None,
                worst_performer=None,
                volatility="Unknown",
                holdings_count=0,
            )

        # Calculate additional metrics
        best_performer = None
        worst_performer = None

        if holdings and len(holdings) > 0:
            try:
                sorted_holdings = sorted(
                    holdings,
                    key=lambda x: getattr(x, "profit_loss_percentage", 0) or 0,
                    reverse=True,
                )
                if sorted_holdings:
                    best_performer = PerformerData(
                        ticker=sorted_holdings[0].ticker,
                        percentage=getattr(
                            sorted_holdings[0], "profit_loss_percentage", 0
                        )
                        or 0,
                    )
                    worst_performer = PerformerData(
                        ticker=sorted_holdings[-1].ticker,
                        percentage=getattr(
                            sorted_holdings[-1], "profit_loss_percentage", 0
                        )
                        or 0,
                    )
            except Exception as e:
                logger.warning(f"Error calculating performers: {e}")

        return PortfolioMetrics(
            total_return=TotalReturnData(
                amount=getattr(portfolio_summary, "total_profit_loss", 0) or 0,
                percentage=getattr(portfolio_summary, "total_profit_loss_percentage", 0)
                or 0,
            ),
            best_performer=best_performer,
            worst_performer=worst_performer,
            volatility="Medium",
            holdings_count=len(holdings) if holdings else 0,
        )
    except Exception as e:
        logger.error(f"Error in get_portfolio_metrics for user {current_user.id}: {e}")
        # Return default metrics on any error
        return PortfolioMetrics(
            total_return=TotalReturnData(amount=0.0, percentage=0.0),
            best_performer=None,
            worst_performer=None,
            volatility="Unknown",
            holdings_count=0,
        )
