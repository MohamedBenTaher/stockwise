"""
Development price service with mock data for when yfinance fails.
"""

from typing import Dict, Optional
import random
import logging

logger = logging.getLogger(__name__)


class MockPriceService:
    """Mock price service for development when external APIs fail."""

    def __init__(self):
        # Mock prices for common stocks
        self.mock_prices = {
            "AAPL": 175.50,
            "MSFT": 420.25,
            "GOOGL": 142.80,
            "AMZN": 155.30,
            "NVDA": 875.40,
            "TSLA": 245.60,
            "META": 485.20,
            "BRK.B": 445.75,
            "V": 285.90,
            "JNJ": 162.45,
            "WMT": 165.80,
            "JPM": 175.25,
            "PG": 145.60,
            "UNH": 520.30,
            "HD": 385.75,
            "MA": 475.40,
            "DIS": 112.85,
            "ADBE": 565.20,
            "BAC": 42.75,
            "CRM": 285.90,
            "NFLX": 485.60,
            "XOM": 115.40,
            "CVX": 165.30,
            "AMD": 185.75,
            "PFE": 28.90,
            "SPY": 485.20,
            "QQQ": 415.60,
            "VTI": 245.80,
            "IWM": 215.40,
            "EEM": 42.35,
            "GLD": 185.75,
            "SLV": 22.85,
            "BTC-USD": 65420.50,
            "ETH-USD": 3845.75,
        }

    def get_price(self, ticker: str) -> float:
        """Get mock price for a ticker."""
        base_price = self.mock_prices.get(ticker.upper(), 100.0)
        # Add some random variation (+/- 5%)
        variation = random.uniform(-0.05, 0.05)
        return round(base_price * (1 + variation), 2)

    def get_multiple_prices(self, tickers: list[str]) -> Dict[str, float]:
        """Get mock prices for multiple tickers."""
        return {ticker: self.get_price(ticker) for ticker in tickers}


# Global mock service instance
mock_price_service = MockPriceService()
