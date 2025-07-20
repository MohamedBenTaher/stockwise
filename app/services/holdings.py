from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.holding import Holding as HoldingModel
from app.schemas.holding import (
    HoldingCreate,
    HoldingUpdate,
    Holding,
    PortfolioSummary,
    AllocationData,
)
from app.services.prices import PriceService


class HoldingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.price_service = PriceService()

    async def create_holding(
        self, user_id: int, holding_data: HoldingCreate
    ) -> Holding:
        """Create a new holding."""
        try:
            # Get current price
            current_price = await self.price_service.get_current_price(
                holding_data.ticker
            )

            # Ensure current_price is not None or 0
            if current_price is None or current_price <= 0:
                current_price = holding_data.buy_price  # Fallback to buy price

            db_holding = HoldingModel(
                user_id=user_id,
                ticker=holding_data.ticker.upper(),
                asset_type=holding_data.asset_type,
                quantity=holding_data.quantity,
                buy_price=holding_data.buy_price,
                current_price=current_price,
                buy_date=holding_data.buy_date,
            )

            # Get additional data (sector, country, etc.)
            try:
                metadata = await self.price_service.get_asset_metadata(
                    holding_data.ticker
                )
                if metadata:
                    db_holding.sector = metadata.get("sector")
                    db_holding.country = metadata.get("country")
                    db_holding.market_cap = metadata.get("market_cap")
            except Exception as e:
                print(
                    f"Warning: Failed to get metadata for "
                    f"{holding_data.ticker}: {e}"
                )

            self.db.add(db_holding)
            await self.db.commit()
            await self.db.refresh(db_holding)

            # Calculate derived fields and return Holding schema
            total_value = float(db_holding.quantity * current_price)
            total_cost = float(db_holding.quantity * db_holding.buy_price)
            profit_loss = total_value - total_cost
            profit_loss_percentage = (
                (profit_loss / total_cost) * 100 if total_cost > 0 else 0.0
            )

            # Create response with all required fields
            return Holding(
                id=db_holding.id,
                user_id=db_holding.user_id,
                ticker=db_holding.ticker,
                asset_type=db_holding.asset_type,
                quantity=float(db_holding.quantity),
                buy_price=float(db_holding.buy_price),
                current_price=float(current_price),
                buy_date=db_holding.buy_date,
                sector=db_holding.sector,
                country=db_holding.country,
                market_cap=(
                    float(db_holding.market_cap) if db_holding.market_cap else None
                ),
                created_at=db_holding.created_at,
                updated_at=db_holding.updated_at,
                total_value=total_value,
                total_cost=total_cost,
                profit_loss=profit_loss,
                profit_loss_percentage=profit_loss_percentage,
            )
        except Exception as e:
            print(f"Error creating holding: {e}")
            await self.db.rollback()
            raise

    async def get_user_holdings(self, user_id: int) -> List[Holding]:
        """Get all holdings for a user with calculated fields."""
        result = await self.db.execute(
            select(HoldingModel).where(HoldingModel.user_id == user_id)
        )
        holdings = result.scalars().all()

        # Add calculated fields
        enriched_holdings = []
        for holding in holdings:
            # Update current price
            current_price = await self.price_service.get_current_price(holding.ticker)
            holding.current_price = current_price

            # Calculate derived fields
            total_value = holding.quantity * current_price
            total_cost = holding.quantity * holding.buy_price
            profit_loss = total_value - total_cost
            profit_loss_percentage = (
                (profit_loss / total_cost) * 100 if total_cost > 0 else 0
            )

            enriched_holdings.append(
                Holding(
                    id=holding.id,
                    user_id=holding.user_id,
                    ticker=holding.ticker,
                    asset_type=holding.asset_type,
                    quantity=holding.quantity,
                    buy_price=holding.buy_price,
                    current_price=current_price,
                    buy_date=holding.buy_date,
                    sector=holding.sector,
                    country=holding.country,
                    market_cap=holding.market_cap,
                    created_at=holding.created_at,
                    updated_at=holding.updated_at,
                    total_value=total_value,
                    total_cost=total_cost,
                    profit_loss=profit_loss,
                    profit_loss_percentage=profit_loss_percentage,
                )
            )

        return enriched_holdings

    async def get_holding(
        self, holding_id: int, user_id: int
    ) -> Optional[HoldingModel]:
        """Get a specific holding by ID and user."""
        result = await self.db.execute(
            select(HoldingModel).where(
                and_(HoldingModel.id == holding_id, HoldingModel.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def update_holding(
        self, holding_id: int, holding_update: HoldingUpdate
    ) -> Holding:
        """Update a holding."""
        result = await self.db.execute(
            select(HoldingModel).where(HoldingModel.id == holding_id)
        )
        holding = result.scalar_one()

        update_data = holding_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(holding, field, value)

        # Update current price if ticker changed
        if "ticker" in update_data:
            current_price = await self.price_service.get_current_price(holding.ticker)
            holding.current_price = current_price

        await self.db.commit()
        await self.db.refresh(holding)

        # Calculate derived fields and return Holding schema
        current_price = holding.current_price or holding.buy_price
        total_value = holding.quantity * current_price
        total_cost = holding.quantity * holding.buy_price
        profit_loss = total_value - total_cost
        profit_loss_percentage = (
            (profit_loss / total_cost) * 100 if total_cost > 0 else 0
        )

        holding_dict = {
            **holding.__dict__,
            "total_value": total_value,
            "total_cost": total_cost,
            "profit_loss": profit_loss,
            "profit_loss_percentage": profit_loss_percentage,
        }
        return Holding(**holding_dict)

    async def delete_holding(self, holding_id: int):
        """Delete a holding."""
        result = await self.db.execute(
            select(HoldingModel).where(HoldingModel.id == holding_id)
        )
        holding = result.scalar_one()
        await self.db.delete(holding)
        await self.db.commit()

    async def get_portfolio_summary(self, user_id: int) -> PortfolioSummary:
        """Get portfolio summary with totals and P/L."""
        holdings = await self.get_user_holdings(user_id)

        total_value = sum(h.total_value for h in holdings)
        total_cost = sum(h.total_cost for h in holdings)
        total_profit_loss = total_value - total_cost
        total_profit_loss_percentage = (
            (total_profit_loss / total_cost) * 100 if total_cost > 0 else 0
        )

        return PortfolioSummary(
            total_value=total_value,
            total_cost=total_cost,
            total_profit_loss=total_profit_loss,
            total_profit_loss_percentage=total_profit_loss_percentage,
            holdings_count=len(holdings),
            holdings=holdings,
        )

    async def get_allocation_data(self, user_id: int) -> AllocationData:
        """Get allocation breakdown by various dimensions."""
        holdings = await self.get_user_holdings(user_id)

        if not holdings:
            return AllocationData(
                by_asset_type={},
                by_sector={},
                by_country={},
                top_performers=[],
                worst_performers=[],
            )

        total_value = sum(h.total_value for h in holdings)

        # By asset type
        by_asset_type = {}
        for holding in holdings:
            asset_type = holding.asset_type
            by_asset_type[asset_type] = by_asset_type.get(asset_type, 0) + (
                holding.total_value / total_value * 100
            )

        # By sector
        by_sector = {}
        for holding in holdings:
            if holding.sector:
                sector = holding.sector
                by_sector[sector] = by_sector.get(sector, 0) + (
                    holding.total_value / total_value * 100
                )

        # By country
        by_country = {}
        for holding in holdings:
            if holding.country:
                country = holding.country
                by_country[country] = by_country.get(country, 0) + (
                    holding.total_value / total_value * 100
                )

        # Top and worst performers
        sorted_holdings = sorted(
            holdings, key=lambda x: x.profit_loss_percentage, reverse=True
        )

        return AllocationData(
            by_asset_type=by_asset_type,
            by_sector=by_sector,
            by_country=by_country,
            top_performers=sorted_holdings[:5],
            worst_performers=sorted_holdings[-5:][::-1],
        )
