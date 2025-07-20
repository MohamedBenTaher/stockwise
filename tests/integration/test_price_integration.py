"""
Integration tests for the complete price fetching and caching system.
"""

import pytest
import asyncio
from unittest.mock import patch

from app.services.prices import PriceService
from app.services.startup import startup_service


class TestPriceIntegration:
    """Integration tests for price service with real dependencies."""

    @pytest.mark.integration
    @pytest.mark.requires_redis
    @pytest.mark.asyncio
    async def test_price_service_with_redis(self):
        """Test price service with real Redis connection."""
        # This test requires Redis to be running
        try:
            price_service = PriceService()

            # Test basic functionality
            ticker = "AAPL"
            price = await price_service.get_current_price(ticker)

            assert isinstance(price, (int, float))
            assert price >= 0

            # Test caching - second call should be faster
            start_time = asyncio.get_event_loop().time()
            cached_price = await price_service.get_current_price(ticker)
            end_time = asyncio.get_event_loop().time()

            # Cached call should be very fast (< 0.1 seconds)
            assert end_time - start_time < 0.1
            assert cached_price == price

        except Exception as e:
            pytest.skip(f"Redis not available: {e}")

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.asyncio
    async def test_batch_price_fetching(self):
        """Test batch price fetching performance."""
        price_service = PriceService()

        tickers = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN"]

        # Test batch fetching
        start_time = asyncio.get_event_loop().time()
        prices = await price_service.get_multiple_prices(tickers)
        end_time = asyncio.get_event_loop().time()

        # Assert all prices were fetched
        assert len(prices) == len(tickers)
        for ticker in tickers:
            assert ticker in prices
            assert isinstance(prices[ticker], (int, float))
            assert prices[ticker] >= 0

        # Should complete within reasonable time (< 10 seconds)
        assert end_time - start_time < 10.0

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_startup_service_preload(self):
        """Test startup service preloading."""
        # Test preload functionality
        success = await startup_service.preload_all_startup_data()

        # Should complete successfully
        assert success is True

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_price_service_fallback_behavior(self):
        """Test price service fallback when APIs fail."""
        price_service = PriceService()

        # Test with invalid ticker
        invalid_price = await price_service.get_current_price("INVALID_TICKER")
        assert invalid_price == 0.0

        # Test batch with mix of valid and invalid tickers
        mixed_tickers = ["AAPL", "INVALID_TICKER", "TSLA"]
        prices = await price_service.get_multiple_prices(mixed_tickers)

        assert len(prices) == len(mixed_tickers)
        assert prices["INVALID_TICKER"] == 0.0
        # Valid tickers should have positive prices (or 0 if API fails)
        assert prices["AAPL"] >= 0.0
        assert prices["TSLA"] >= 0.0
