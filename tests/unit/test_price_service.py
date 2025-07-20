"""
Unit tests for the price service.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.prices import PriceService
from app.core.exceptions import PriceServiceException


class TestPriceService:
    """Test cases for PriceService."""

    @pytest.fixture
    def price_service(self):
        """Create a PriceService instance for testing."""
        return PriceService()

    @pytest.fixture
    def mock_cache_service(self):
        """Mock cache service."""
        with patch("app.services.prices.cache_service") as mock:
            mock.get = AsyncMock(return_value=None)
            mock.set = AsyncMock()
            yield mock

    @pytest.mark.asyncio
    async def test_get_current_price_cache_hit(self, price_service, mock_cache_service):
        """Test get_current_price with cache hit."""
        # Arrange
        mock_cache_service.get.return_value = 150.0

        # Act
        price = await price_service.get_current_price("AAPL")

        # Assert
        assert price == 150.0
        mock_cache_service.get.assert_called_once_with("price:AAPL")
        mock_cache_service.set.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_current_price_cache_miss_api_success(
        self, price_service, mock_cache_service
    ):
        """Test get_current_price with cache miss and successful API call."""
        # Arrange
        mock_cache_service.get.return_value = None

        with patch.object(
            price_service, "_fetch_price_from_api", return_value=175.0
        ) as mock_fetch:
            # Act
            price = await price_service.get_current_price("AAPL")

            # Assert
            assert price == 175.0
            mock_cache_service.get.assert_called_once_with("price:AAPL")
            mock_fetch.assert_called_once_with("AAPL")
            mock_cache_service.set.assert_called_once_with("price:AAPL", 175.0, 1800)

    @pytest.mark.asyncio
    async def test_get_current_price_api_failure_fallback(
        self, price_service, mock_cache_service
    ):
        """Test get_current_price with API failure and fallback price."""
        # Arrange
        mock_cache_service.get.return_value = None

        with patch.object(
            price_service,
            "_fetch_price_from_api",
            side_effect=PriceServiceException("API Error"),
        ):
            # Act
            price = await price_service.get_current_price("AAPL")

            # Assert
            assert price == 150.0  # Default fallback price for AAPL
            mock_cache_service.get.assert_called_once_with("price:AAPL")

    @pytest.mark.asyncio
    async def test_get_multiple_prices_mixed_cache(
        self, price_service, mock_cache_service
    ):
        """Test get_multiple_prices with mixed cache hits and misses."""

        # Arrange
        def cache_side_effect(key):
            if key == "price:AAPL":
                return 150.0
            return None

        mock_cache_service.get.side_effect = cache_side_effect

        with patch.object(price_service, "_fetch_batch_prices") as mock_fetch_batch:
            # Act
            prices = await price_service.get_multiple_prices(["AAPL", "TSLA"])

            # Assert
            assert prices["AAPL"] == 150.0
            assert "TSLA" in prices
            mock_fetch_batch.assert_called_once()
            # Check that TSLA was in the uncached list
            args = mock_fetch_batch.call_args[0]
            assert "TSLA" in args[0]  # uncached_tickers
            assert "AAPL" not in args[0]

    @pytest.mark.asyncio
    async def test_rate_limiting(self, price_service):
        """Test rate limiting functionality."""
        # Arrange
        price_service.last_request_time = 0.0

        # Act
        start_time = asyncio.get_event_loop().time()
        await price_service._rate_limit()
        await price_service._rate_limit()
        end_time = asyncio.get_event_loop().time()

        # Assert
        # Should have waited at least the minimum interval
        assert end_time - start_time >= 1.0

    @pytest.mark.asyncio
    async def test_fetch_price_from_api_success(self, price_service):
        """Test successful API price fetch."""
        # Arrange
        with patch.object(
            price_service, "_get_yfinance_price", return_value=180.0
        ) as mock_yf:
            # Act
            price = await price_service._fetch_price_from_api("AAPL")

            # Assert
            assert price == 180.0
            mock_yf.assert_called_once_with("AAPL")

    @pytest.mark.asyncio
    async def test_fetch_price_from_api_failure(self, price_service):
        """Test API price fetch failure."""
        # Arrange
        with patch.object(price_service, "_get_yfinance_price", return_value=None):
            # Act & Assert
            with pytest.raises(PriceServiceException):
                await price_service._fetch_price_from_api("INVALID")

    def test_get_yfinance_price_success(self, price_service):
        """Test successful yfinance price fetch."""
        # Arrange
        mock_stock = MagicMock()
        mock_hist = MagicMock()
        mock_hist.empty = False
        mock_hist.__getitem__.return_value.iloc = MagicMock()
        mock_hist["Close"].iloc.__getitem__.return_value = 190.0
        mock_stock.history.return_value = mock_hist

        with patch("app.services.prices.yf.Ticker", return_value=mock_stock):
            # Act
            price = price_service._get_yfinance_price("AAPL")

            # Assert
            assert price == 190.0

    def test_get_yfinance_price_fallback_to_info(self, price_service):
        """Test yfinance price fetch fallback to info when history fails."""
        # Arrange
        mock_stock = MagicMock()
        mock_hist = MagicMock()
        mock_hist.empty = True
        mock_stock.history.return_value = mock_hist
        mock_stock.info = {"currentPrice": 195.0}

        with patch("app.services.prices.yf.Ticker", return_value=mock_stock):
            # Act
            price = price_service._get_yfinance_price("AAPL")

            # Assert
            assert price == 195.0

    def test_get_yfinance_price_failure(self, price_service):
        """Test yfinance price fetch complete failure."""
        # Arrange
        with patch(
            "app.services.prices.yf.Ticker", side_effect=Exception("Network error")
        ):
            # Act
            price = price_service._get_yfinance_price("AAPL")

            # Assert
            assert price is None

    @pytest.mark.asyncio
    async def test_get_asset_metadata_cache_hit(
        self, price_service, mock_cache_service
    ):
        """Test metadata fetch with cache hit."""
        # Arrange
        expected_metadata = {"sector": "Technology", "industry": "Consumer Electronics"}
        mock_cache_service.get.return_value = expected_metadata

        # Act
        metadata = await price_service.get_asset_metadata("AAPL")

        # Assert
        assert metadata == expected_metadata
        mock_cache_service.get.assert_called_once_with("metadata:AAPL")

    @pytest.mark.asyncio
    async def test_get_asset_metadata_cache_miss(
        self, price_service, mock_cache_service
    ):
        """Test metadata fetch with cache miss."""
        # Arrange
        mock_cache_service.get.return_value = None
        expected_metadata = {"sector": "Technology", "industry": "Consumer Electronics"}

        with patch.object(
            price_service, "_fetch_metadata_from_api", return_value=expected_metadata
        ) as mock_fetch:
            # Act
            metadata = await price_service.get_asset_metadata("AAPL")

            # Assert
            assert metadata == expected_metadata
            mock_fetch.assert_called_once_with("AAPL")
            mock_cache_service.set.assert_called_once_with(
                "metadata:AAPL", expected_metadata, 7200
            )

    def test_get_yfinance_metadata_success(self, price_service):
        """Test successful metadata fetch from yfinance."""
        # Arrange
        mock_stock = MagicMock()
        mock_stock.info = {
            "sector": "Technology",
            "industry": "Consumer Electronics",
            "country": "United States",
            "marketCap": 2500000000000,
            "exchange": "NASDAQ",
        }

        with patch("app.services.prices.yf.Ticker", return_value=mock_stock):
            # Act
            metadata = price_service._get_yfinance_metadata("AAPL")

            # Assert
            assert metadata["sector"] == "Technology"
            assert metadata["industry"] == "Consumer Electronics"
            assert metadata["country"] == "United States"
            assert metadata["market_cap"] == 2500000000000
            assert metadata["exchange"] == "NASDAQ"

    def test_get_yfinance_metadata_failure(self, price_service):
        """Test metadata fetch failure."""
        # Arrange
        with patch(
            "app.services.prices.yf.Ticker", side_effect=Exception("Network error")
        ):
            # Act
            metadata = price_service._get_yfinance_metadata("AAPL")

            # Assert
            assert metadata is None
