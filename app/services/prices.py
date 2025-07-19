import yfinance as yf
from typing import Optional, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor


class PriceService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=5)

    async def get_current_price(self, ticker: str) -> float:
        """Get current price for a ticker."""
        try:
            # Run yfinance in thread pool since it's not async
            loop = asyncio.get_event_loop()
            price = await loop.run_in_executor(self.executor, self._fetch_price, ticker)
            return price or 0.0
        except Exception:
            return 0.0

    def _fetch_price(self, ticker: str) -> Optional[float]:
        """Fetch price synchronously."""
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1d")
            if not hist.empty:
                return float(hist["Close"].iloc[-1])
            return None
        except Exception:
            return None

    async def get_asset_metadata(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get additional metadata for an asset."""
        try:
            loop = asyncio.get_event_loop()
            metadata = await loop.run_in_executor(
                self.executor, self._fetch_metadata, ticker
            )
            return metadata
        except Exception:
            return None

    def _fetch_metadata(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Fetch metadata synchronously."""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            return {
                "sector": info.get("sector"),
                "country": info.get("country"),
                "market_cap": info.get("marketCap"),
                "industry": info.get("industry"),
                "exchange": info.get("exchange"),
            }
        except Exception:
            return None
