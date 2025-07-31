# app/services/prices.py - Updated to use bulk service
from app.services.bulk_price_service import bulk_price_service
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class PriceService:
    """Price service that uses bulk caching for efficiency."""

    def __init__(self):
        self.bulk_service = bulk_price_service

    async def get_current_price(self, ticker: str) -> float:
        """Get current price using bulk cached data."""
        return await self.bulk_service.get_single_price(ticker)

    async def get_multiple_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Get multiple prices using bulk cached data."""
        return await self.bulk_service.get_prices(tickers)

    async def get_asset_metadata(self, ticker: str) -> Dict[str, Any]:
        """Get asset metadata."""
        # Static metadata (could be cached similarly)
        metadata_map = {
            "AAPL": {
                "sector": "Technology",
                "country": "US",
                "market_cap": 3000000000000,
            },
            "MSFT": {
                "sector": "Technology",
                "country": "US",
                "market_cap": 2800000000000,
            },
            "GOOGL": {
                "sector": "Technology",
                "country": "US",
                "market_cap": 1800000000000,
            },
            "AMZN": {
                "sector": "Consumer Discretionary",
                "country": "US",
                "market_cap": 1600000000000,
            },
            "NVDA": {
                "sector": "Technology",
                "country": "US",
                "market_cap": 2200000000000,
            },
            "TSLA": {
                "sector": "Automotive",
                "country": "US",
                "market_cap": 800000000000,
            },
            "META": {
                "sector": "Technology",
                "country": "US",
                "market_cap": 1200000000000,
            },
            "DIS": {
                "sector": "Entertainment",
                "country": "US",
                "market_cap": 200000000000,
            },
            "SPY": {"sector": "ETF", "country": "US", "market_cap": 450000000000},
            "QQQ": {"sector": "ETF", "country": "US", "market_cap": 200000000000},
        }

        return metadata_map.get(
            ticker.upper(),
            {"sector": "Unknown", "country": "US", "market_cap": 1000000000},
        )


# Create singleton instance
price_service = PriceService()
