"""
Repository base classes following clean architecture principles.
"""

from abc import ABC
from typing import List, Optional, TypeVar, Generic, Type
from sqlalchemy import select, and_
from app.db import Base, TransactionManager

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T], ABC):
    """
    Abstract base repository class following clean architecture principles.
    Provides common CRUD operations with proper transaction management.
    """

    def __init__(self, transaction_manager: TransactionManager, model: Type[T]):
        """
        Initialize repository with transaction manager and model class.

        Args:
            transaction_manager: Transaction manager for database operations
            model: SQLAlchemy model class
        """
        self.db_manager = transaction_manager
        self.model = model

    async def create(self, **kwargs) -> T:
        """Create a new entity."""
        entity = self.model(**kwargs)
        self.db_manager.add(entity)
        await self.db_manager.flush()
        await self.db_manager.refresh(entity)
        return entity

    async def get_by_id(self, entity_id: int) -> Optional[T]:
        """Get entity by ID."""
        result = await self.db_manager.execute(
            select(self.model).where(self.model.id == entity_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, limit: Optional[int] = None, offset: Optional[int] = None
    ) -> List[T]:
        """Get all entities with optional pagination."""
        query = select(self.model)
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)

        result = await self.db_manager.execute(query)
        return list(result.scalars().all())

    async def update(self, entity: T, **kwargs) -> T:
        """Update an entity."""
        for key, value in kwargs.items():
            if hasattr(entity, key):
                setattr(entity, key, value)

        await self.db_manager.flush()
        await self.db_manager.refresh(entity)
        return entity

    async def delete(self, entity: T) -> None:
        """Delete an entity."""
        await self.db_manager.delete(entity)
        await self.db_manager.flush()

    async def exists(self, **filters) -> bool:
        """Check if entity exists with given filters."""
        query = select(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        result = await self.db_manager.execute(query)
        return result.scalar_one_or_none() is not None

    async def count(self, **filters) -> int:
        """Count entities with optional filters."""
        from sqlalchemy import func

        query = select(func.count(self.model.id))
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        result = await self.db_manager.execute(query)
        return result.scalar()


class UserRepository(BaseRepository):
    """User-specific repository operations."""

    def __init__(self, transaction_manager: TransactionManager):
        from app.models.user import User

        super().__init__(transaction_manager, User)

    async def get_by_email(self, email: str) -> Optional[T]:
        """Get user by email."""
        result = await self.db_manager.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalar_one_or_none()

    async def get_active_users(self) -> List[T]:
        """Get all active users."""
        result = await self.db_manager.execute(
            select(self.model).where(self.model.is_active == True)  # noqa: E712
        )
        return list(result.scalars().all())


class HoldingRepository(BaseRepository):
    """Holding-specific repository operations."""

    def __init__(self, transaction_manager: TransactionManager):
        from app.models.holding import Holding

        super().__init__(transaction_manager, Holding)

    async def get_by_user_id(self, user_id: int) -> List[T]:
        """Get all holdings for a specific user."""
        result = await self.db_manager.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_by_ticker(self, ticker: str, user_id: int) -> List[T]:
        """Get holdings by ticker for a specific user."""
        result = await self.db_manager.execute(
            select(self.model).where(
                and_(self.model.ticker == ticker.upper(), self.model.user_id == user_id)
            )
        )
        return list(result.scalars().all())

    async def get_by_user_and_id(self, holding_id: int, user_id: int) -> Optional[T]:
        """Get a specific holding by ID and user."""
        result = await self.db_manager.execute(
            select(self.model).where(
                and_(self.model.id == holding_id, self.model.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()
