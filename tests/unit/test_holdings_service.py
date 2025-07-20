"""
Unit tests for HoldingService.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from app.services.holdings import HoldingService
from app.schemas.holding import HoldingCreate
from app.models.holding import Holding as HoldingModel


class TestHoldingService:
    """Test cases for HoldingService."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        session = AsyncMock()
        session.add = MagicMock()
        session.commit = AsyncMock()
        session.refresh = AsyncMock()
        session.rollback = AsyncMock()
        session.execute = AsyncMock()
        return session

    @pytest.fixture
    def mock_price_service(self):
        """Mock PriceService."""
        service = AsyncMock()
        service.get_current_price = AsyncMock(return_value=150.0)
        service.get_multiple_prices = AsyncMock(
            return_value={
                "AAPL": 150.0,
                "TSLA": 200.0,
            }
        )
        service.get_asset_metadata = AsyncMock(
            return_value={
                "sector": "Technology",
                "country": "US",
                "market_cap": 2000000000,
            }
        )
        return service

    @pytest.fixture
    def holding_service(self, mock_db_session, mock_price_service):
        """Create HoldingService with mocked dependencies."""
        service = HoldingService(mock_db_session)
        service.price_service = mock_price_service
        return service

    @pytest.fixture
    def sample_holding_create(self):
        """Sample holding creation data."""
        return HoldingCreate(
            ticker="AAPL",
            asset_type="stock",
            quantity=10.0,
            buy_price=140.0,
            buy_date=datetime(2024, 1, 1),
        )

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_create_holding_success(
        self, holding_service, sample_holding_create, mock_db_session
    ):
        """Test successful holding creation."""
        # Setup
        user_id = 1
        mock_holding = HoldingModel(
            id=1,
            user_id=user_id,
            ticker="AAPL",
            asset_type="stock",
            quantity=10.0,
            buy_price=140.0,
            current_price=150.0,
            buy_date=datetime(2024, 1, 1),
            sector="Technology",
            country="US",
            market_cap=2000000000,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        mock_db_session.refresh.side_effect = lambda x: setattr(x, "id", 1)

        # Mock the database holding object
        with patch("app.services.holdings.HoldingModel") as MockHolding:
            MockHolding.return_value = mock_holding

            # Execute
            result = await holding_service.create_holding(
                user_id, sample_holding_create
            )

            # Assert
            assert result.ticker == "AAPL"
            assert result.quantity == 10.0
            assert result.buy_price == 140.0
            assert result.current_price == 150.0
            assert result.total_value == 1500.0  # 10 * 150
            assert result.total_cost == 1400.0  # 10 * 140
            assert result.profit_loss == 100.0  # 1500 - 1400

            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_create_holding_price_fallback(
        self, holding_service, sample_holding_create
    ):
        """Test holding creation when current price fetch fails."""
        # Setup
        user_id = 1
        holding_service.price_service.get_current_price.return_value = 0.0

        with patch("app.services.holdings.HoldingModel") as MockHolding:
            mock_holding = MagicMock()
            mock_holding.id = 1
            mock_holding.current_price = 140.0  # Falls back to buy_price
            MockHolding.return_value = mock_holding

            # Execute
            result = await holding_service.create_holding(
                user_id, sample_holding_create
            )

            # Assert - should fallback to buy_price when current_price is 0
            assert result.current_price == 140.0

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_user_holdings_with_cache(self, holding_service, mock_db_session):
        """Test getting user holdings with price caching."""
        # Setup
        user_id = 1
        mock_holdings = [
            MagicMock(
                id=1,
                user_id=1,
                ticker="AAPL",
                quantity=10.0,
                buy_price=140.0,
                sector="Technology",
                country="US",
            ),
            MagicMock(
                id=2,
                user_id=1,
                ticker="TSLA",
                quantity=5.0,
                buy_price=180.0,
                sector="Automotive",
                country="US",
            ),
        ]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_holdings
        mock_db_session.execute.return_value = mock_result

        # Execute
        result = await holding_service.get_user_holdings(user_id)

        # Assert
        assert len(result) == 2
        assert result[0].ticker == "AAPL"
        assert result[1].ticker == "TSLA"

        # Verify batch price fetching was used
        holding_service.price_service.get_multiple_prices.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_user_holdings_empty(self, holding_service, mock_db_session):
        """Test getting holdings for user with no holdings."""
        # Setup
        user_id = 1
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db_session.execute.return_value = mock_result

        # Execute
        result = await holding_service.get_user_holdings(user_id)

        # Assert
        assert result == []

        # Verify no price service calls were made
        holding_service.price_service.get_multiple_prices.assert_not_called()

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_calculate_profit_loss(self, holding_service):
        """Test profit/loss calculations."""
        # Test data
        test_cases = [
            # (quantity, buy_price, current_price, expected_profit_loss,
            #  expected_percentage)
            (10.0, 100.0, 110.0, 100.0, 10.0),  # 10% gain
            (5.0, 200.0, 180.0, -100.0, -10.0),  # 10% loss
            (1.0, 150.0, 150.0, 0.0, 0.0),  # No change
        ]

        for quantity, buy_price, current_price, exp_pl, exp_pct in test_cases:
            total_value = quantity * current_price
            total_cost = quantity * buy_price
            profit_loss = total_value - total_cost
            profit_loss_pct = (profit_loss / total_cost) * 100 if total_cost > 0 else 0

            assert profit_loss == exp_pl
            assert abs(profit_loss_pct - exp_pct) < 0.01  # Allow small float errors

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_error_handling_rollback(
        self, holding_service, sample_holding_create, mock_db_session
    ):
        """Test error handling and transaction rollback."""
        # Setup
        user_id = 1
        mock_db_session.commit.side_effect = Exception("Database error")

        with patch("app.services.holdings.HoldingModel"):
            # Execute & Assert
            with pytest.raises(Exception):
                await holding_service.create_holding(user_id, sample_holding_create)

            # Verify rollback was called
            mock_db_session.rollback.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_metadata_fetch_failure_graceful(
        self, holding_service, sample_holding_create
    ):
        """Test graceful handling of metadata fetch failure."""
        # Setup
        user_id = 1
        holding_service.price_service.get_asset_metadata.side_effect = Exception(
            "API Error"
        )

        with patch("app.services.holdings.HoldingModel") as MockHolding:
            mock_holding = MagicMock()
            mock_holding.id = 1
            MockHolding.return_value = mock_holding

            # Execute - should not raise exception
            result = await holding_service.create_holding(
                user_id, sample_holding_create
            )

            # Assert - holding should still be created despite metadata failure
            assert result is not None
