from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db import get_db
from app.schemas.holding import (
    Holding,
    HoldingCreate,
    HoldingUpdate,
    PortfolioSummary,
    AllocationData,
)
from app.services.holdings import HoldingService
from app.services.auth import get_current_user
from app.schemas.user import User

router = APIRouter()


@router.post("/", response_model=Holding)
async def create_holding(
    holding: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new holding for the current user."""
    holding_service = HoldingService(db)
    return await holding_service.create_holding(
        user_id=current_user.id, holding_data=holding
    )


@router.get("/", response_model=List[Holding])
async def get_holdings(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get all holdings for the current user."""
    holding_service = HoldingService(db)
    return await holding_service.get_user_holdings(current_user.id)


@router.get("/portfolio", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get portfolio summary with total value, P/L, etc."""
    holding_service = HoldingService(db)
    return await holding_service.get_portfolio_summary(current_user.id)


@router.get("/allocation", response_model=AllocationData)
async def get_allocation_data(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get portfolio allocation breakdown by sector, country, etc."""
    holding_service = HoldingService(db)
    return await holding_service.get_allocation_data(current_user.id)


@router.put("/{holding_id}", response_model=Holding)
async def update_holding(
    holding_id: int,
    holding_update: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a specific holding."""
    holding_service = HoldingService(db)
    holding = await holding_service.get_holding(holding_id, current_user.id)
    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found"
        )
    return await holding_service.update_holding(holding_id, holding_update)


@router.delete("/{holding_id}")
async def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a specific holding."""
    holding_service = HoldingService(db)
    holding = await holding_service.get_holding(holding_id, current_user.id)
    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found"
        )
    await holding_service.delete_holding(holding_id)
    return {"message": "Holding deleted successfully"}
