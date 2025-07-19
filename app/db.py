from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional, Any, List
from abc import ABC, abstractmethod
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Async database setup
DATABASE_URL_ASYNC = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)
async_engine = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=settings.DEBUG,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
)
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)

# Sync database setup (for Alembic migrations)
DATABASE_URL_SYNC = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg2://"
)
sync_engine = create_engine(DATABASE_URL_SYNC, echo=settings.DEBUG)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()


# Abstract base class for transaction management
class TransactionManager(ABC):
    """
    Abstract base class for transaction management following clean
    architecture principles.
    """

    @abstractmethod
    async def commit(self) -> None:
        """Commit the current transaction."""
        pass

    @abstractmethod
    async def rollback(self) -> None:
        """Rollback the current transaction."""
        pass

    @abstractmethod
    async def flush(self) -> None:
        """Flush pending changes to the database."""
        pass

    @abstractmethod
    def add(self, instance: Any) -> None:
        """Add an instance to the session."""
        pass

    @abstractmethod
    async def delete(self, instance: Any) -> None:
        """Delete an instance from the database."""
        pass

    @abstractmethod
    async def refresh(self, instance: Any) -> None:
        """Refresh an instance from the database."""
        pass


class DatabaseTransactionManager(TransactionManager):
    """
    Concrete implementation of transaction manager for SQLAlchemy.
    Follows clean code principles with single responsibility and
    clear interface.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self._is_committed = False
        self._is_rolled_back = False

    async def commit(self) -> None:
        """Commit the current transaction."""
        if self._is_rolled_back:
            raise RuntimeError("Cannot commit after rollback")

        try:
            await self.session.commit()
            self._is_committed = True
            logger.debug("Transaction committed successfully")
        except Exception as e:
            logger.error(f"Error committing transaction: {e}")
            await self.rollback()
            raise

    async def rollback(self) -> None:
        """Rollback the current transaction."""
        if self._is_committed:
            logger.warning("Attempting to rollback already committed transaction")
            return

        try:
            await self.session.rollback()
            self._is_rolled_back = True
            logger.debug("Transaction rolled back successfully")
        except Exception as e:
            logger.error(f"Error rolling back transaction: {e}")
            raise

    async def flush(self) -> None:
        """Flush pending changes to the database without committing."""
        try:
            await self.session.flush()
            logger.debug("Session flushed successfully")
        except Exception as e:
            logger.error(f"Error flushing session: {e}")
            raise

    def add(self, instance: Any) -> None:
        """Add an instance to the session."""
        self.session.add(instance)
        logger.debug(f"Added instance {type(instance).__name__} to session")

    def add_all(self, instances: List[Any]) -> None:
        """Add multiple instances to the session."""
        self.session.add_all(instances)
        logger.debug(f"Added {len(instances)} instances to session")

    async def delete(self, instance: Any) -> None:
        """Delete an instance from the database."""
        await self.session.delete(instance)
        logger.debug(f"Marked {type(instance).__name__} for deletion")

    async def refresh(self, instance: Any) -> None:
        """Refresh an instance from the database."""
        await self.session.refresh(instance)
        logger.debug(f"Refreshed {type(instance).__name__} instance")

    async def execute(self, query: Any) -> Any:
        """Execute a query."""
        try:
            result = await self.session.execute(query)
            logger.debug(f"Executed query: {query}")
            return result
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise

    async def scalar(self, query: Any) -> Any:
        """Execute a query and return a scalar result."""
        try:
            result = await self.session.scalar(query)
            logger.debug(f"Executed scalar query: {query}")
            return result
        except Exception as e:
            logger.error(f"Error executing scalar query: {e}")
            raise

    @property
    def is_active(self) -> bool:
        """Check if the transaction is still active."""
        return not (self._is_committed or self._is_rolled_back)


class UnitOfWork:
    """
    Unit of Work pattern implementation for managing database transactions.
    Provides a clean interface for handling database operations with
    automatic cleanup.
    """

    def __init__(self, session: Optional[AsyncSession] = None):
        self._session = session
        self._transaction_manager: Optional[DatabaseTransactionManager] = None

    async def __aenter__(self) -> DatabaseTransactionManager:
        """Async context manager entry."""
        if self._session is None:
            self._session = AsyncSessionLocal()

        self._transaction_manager = DatabaseTransactionManager(self._session)
        return self._transaction_manager

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit with automatic rollback on exceptions."""
        if self._transaction_manager is None:
            return

        try:
            if exc_type is not None:
                # Exception occurred, rollback
                await self._transaction_manager.rollback()
                logger.info(
                    f"Transaction rolled back due to exception: " f"{exc_type.__name__}"
                )
            elif self._transaction_manager.is_active:
                # No exception but transaction not committed, rollback
                await self._transaction_manager.rollback()
                logger.info("Transaction rolled back (not explicitly committed)")
        except Exception as e:
            logger.error(f"Error during transaction cleanup: {e}")
        finally:
            if self._session:
                await self._session.close()


# Async database dependency for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Sync database session (for migrations)
def get_sync_db():
    """Sync database session for migrations and sync operations."""
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Convenience function for getting a unit of work
def get_unit_of_work() -> UnitOfWork:
    """Get a new unit of work instance."""
    return UnitOfWork()


@asynccontextmanager
async def get_transaction() -> AsyncGenerator[DatabaseTransactionManager, None]:
    """
    Legacy async context manager for database transactions.
    Consider using UnitOfWork for new code.

    Usage:
        async with get_transaction() as tx:
            user = User(email="test@example.com")
            tx.add(user)
            await tx.commit()
    """
    async with UnitOfWork() as tx:
        yield tx


async def init_db():
    """Initialize database tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized")
