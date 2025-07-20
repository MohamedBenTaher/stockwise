"""
Test configuration and fixtures.
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.db import Base


# Test database URL - use in-memory SQLite for fast tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    redis_mock = AsyncMock()
    redis_mock.get.return_value = None
    redis_mock.setex.return_value = True
    redis_mock.ping.return_value = True
    return redis_mock


@pytest.fixture
def mock_price_service():
    """Mock PriceService."""
    service = MagicMock()
    service.get_current_price = AsyncMock(return_value=150.0)
    service.get_multiple_prices = AsyncMock(
        return_value={
            "AAPL": 150.0,
            "TSLA": 200.0,
            "MSFT": 300.0,
        }
    )
    return service


@pytest.fixture
def sample_holdings_data():
    """Sample holdings data for testing."""
    return [
        {
            "ticker": "AAPL",
            "asset_type": "stock",
            "quantity": 10.0,
            "buy_price": 150.0,
            "buy_date": "2024-01-01T00:00:00Z",
        },
        {
            "ticker": "TSLA",
            "asset_type": "stock",
            "quantity": 5.0,
            "buy_price": 200.0,
            "buy_date": "2024-01-02T00:00:00Z",
        },
    ]


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "hashed_password_123",
        "is_active": True,
        "is_verified": False,
    }
