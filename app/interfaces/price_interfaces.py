"""
Abstract interfaces for the price service following clean architecture principles.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any


class PriceRepository(ABC):
    """Abstract repository for price data."""

    @abstractmethod
    async def get_price(self, ticker: str) -> Optional[float]:
        """Get current price for a ticker."""
        pass

    @abstractmethod
    async def get_multiple_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Get current prices for multiple tickers."""
        pass

    @abstractmethod
    async def get_metadata(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a ticker (sector, country, etc.)."""
        pass


class CacheRepository(ABC):
    """Abstract repository for caching."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Set value in cache with TTL."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete value from cache."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        pass


class PriceServiceInterface(ABC):
    """Abstract interface for price service."""

    @abstractmethod
    async def get_current_price(self, ticker: str) -> float:
        """Get current price for a ticker."""
        pass

    @abstractmethod
    async def get_multiple_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Get current prices for multiple tickers."""
        pass

    @abstractmethod
    async def get_asset_metadata(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get asset metadata."""
        pass
