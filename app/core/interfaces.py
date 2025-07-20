"""
Repository interfaces for clean architecture.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Any
from app.schemas.holding import HoldingCreate, HoldingUpdate, Holding


class IHoldingRepository(ABC):
    """Interface for holding repository operations."""

    @abstractmethod
    async def create(self, user_id: int, holding_data: HoldingCreate) -> Holding:
        """Create a new holding."""
        pass

    @abstractmethod
    async def get_by_user(self, user_id: int) -> List[Holding]:
        """Get all holdings for a user."""
        pass

    @abstractmethod
    async def get_by_id(self, holding_id: int, user_id: int) -> Optional[Holding]:
        """Get a specific holding by ID and user."""
        pass

    @abstractmethod
    async def update(self, holding_id: int, holding_update: HoldingUpdate) -> Holding:
        """Update a holding."""
        pass

    @abstractmethod
    async def delete(self, holding_id: int) -> None:
        """Delete a holding."""
        pass


class ICacheRepository(ABC):
    """Interface for cache operations."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Set value in cache."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete value from cache."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        pass
