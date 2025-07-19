from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.services.risk import RiskService
from app.services.auth import get_current_user
from app.schemas.user import User

router = APIRouter()


@router.get("/")
async def get_risk_analysis(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get comprehensive risk analysis for the user's portfolio."""
    risk_service = RiskService(db)
    return await risk_service.analyze_portfolio_risk(current_user.id)


@router.get("/heatmap")
async def get_risk_heatmap(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get risk heatmap data for visualization."""
    risk_service = RiskService(db)
    return await risk_service.generate_risk_heatmap(current_user.id)


@router.get("/metrics")
async def get_risk_metrics(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get detailed risk metrics and calculations."""
    risk_service = RiskService(db)
    return await risk_service.calculate_risk_metrics(current_user.id)
