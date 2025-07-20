"""
Integration tests for the holdings system.
"""

import pytest
from datetime import datetime

from app.services.holdings import HoldingService
from app.schemas.holding import HoldingCreate
from app.models.user import User
from app.models.holding import Holding as HoldingModel


class TestHoldingsIntegration:
    """Integration tests for holdings with database."""

    @pytest.mark.integration
    @pytest.mark.requires_db
    @pytest.mark.asyncio
    async def test_holdings_crud_flow(self, test_session):
        """Test complete CRUD flow for holdings."""
        # Create test user first
        test_user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed_password",
            is_active=True,
            is_verified=False,
        )
        test_session.add(test_user)
        await test_session.commit()
        await test_session.refresh(test_user)

        # Initialize holdings service
        holdings_service = HoldingService(test_session)

        # Test holding creation
        holding_data = HoldingCreate(
            ticker="AAPL",
            asset_type="stock",
            quantity=10.0,
            buy_price=150.0,
            buy_date=datetime(2024, 1, 1),
        )

        created_holding = await holdings_service.create_holding(
            test_user.id, holding_data
        )

        # Verify holding was created
        assert created_holding.id is not None
        assert created_holding.ticker == "AAPL"
        assert created_holding.quantity == 10.0
        assert created_holding.user_id == test_user.id

        # Test retrieving user holdings
        user_holdings = await holdings_service.get_user_holdings(test_user.id)
        assert len(user_holdings) == 1
        assert user_holdings[0].ticker == "AAPL"

        # Test portfolio summary
        portfolio = await holdings_service.get_portfolio_summary(test_user.id)
        assert portfolio.holdings_count == 1
        assert portfolio.total_cost == 1500.0  # 10 * 150
        assert len(portfolio.holdings) == 1

        # Clean up
        await holdings_service.delete_holding(created_holding.id)

        # Verify deletion
        remaining_holdings = await holdings_service.get_user_holdings(test_user.id)
        assert len(remaining_holdings) == 0

    @pytest.mark.integration
    @pytest.mark.requires_db
    @pytest.mark.asyncio
    async def test_holdings_price_calculations(self, test_session):
        """Test holdings with real price calculations."""
        # Create test user
        test_user = User(
            email="calc_test@example.com",
            full_name="Calc Test User",
            hashed_password="hashed_password",
            is_active=True,
            is_verified=False,
        )
        test_session.add(test_user)
        await test_session.commit()
        await test_session.refresh(test_user)

        holdings_service = HoldingService(test_session)

        # Create multiple holdings
        holdings_data = [
            HoldingCreate(
                ticker="AAPL",
                asset_type="stock",
                quantity=10.0,
                buy_price=150.0,
                buy_date=datetime(2024, 1, 1),
            ),
            HoldingCreate(
                ticker="TSLA",
                asset_type="stock",
                quantity=5.0,
                buy_price=200.0,
                buy_date=datetime(2024, 1, 2),
            ),
        ]

        created_holdings = []
        for holding_data in holdings_data:
            holding = await holdings_service.create_holding(test_user.id, holding_data)
            created_holdings.append(holding)

        # Test allocation data
        allocation = await holdings_service.get_allocation_data(test_user.id)

        assert "stock" in allocation.by_asset_type
        assert allocation.by_asset_type["stock"] == 100.0  # All stocks

        # Test that we have top/worst performers
        assert len(allocation.top_performers) <= 2
        assert len(allocation.worst_performers) <= 2

        # Clean up
        for holding in created_holdings:
            await holdings_service.delete_holding(holding.id)
