"""
Unit tests for the cache service.
"""

import pytest
from unittest.mock import AsyncMock, patch
from app.services.cache import RedisCacheService
from app.core.exceptions import CacheException


class TestCacheService:
    """Test cases for RedisCacheService."""

    @pytest.fixture
    def cache_service(self):
        """Create a cache service instance for testing."""
        return RedisCacheService()

    @pytest.fixture
    def mock_redis(self):
        """Mock Redis client."""
        mock = AsyncMock()
        mock.ping = AsyncMock()
        mock.get = AsyncMock()
        mock.setex = AsyncMock()
        mock.delete = AsyncMock()
        mock.exists = AsyncMock()
        mock.scan_iter = AsyncMock()
        return mock

    @pytest.mark.asyncio
    async def test_get_redis_connection_success(self, cache_service, mock_redis):
        """Test successful Redis connection."""
        with patch("app.services.cache.redis.from_url", return_value=mock_redis):
            redis_client = await cache_service._get_redis()

            assert redis_client == mock_redis
            mock_redis.ping.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_redis_connection_failure(self, cache_service):
        """Test Redis connection failure."""
        with patch(
            "app.services.cache.redis.from_url",
            side_effect=Exception("Connection failed"),
        ):
            redis_client = await cache_service._get_redis()

            assert redis_client is None

    @pytest.mark.asyncio
    async def test_get_success(self, cache_service, mock_redis):
        """Test successful cache get."""
        mock_redis.get.return_value = '{"value": 150.0}'

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            result = await cache_service.get("test_key")

            assert result == {"value": 150.0}
            mock_redis.get.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_get_not_found(self, cache_service, mock_redis):
        """Test cache get when key not found."""
        mock_redis.get.return_value = None

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            result = await cache_service.get("test_key")

            assert result is None

    @pytest.mark.asyncio
    async def test_get_redis_unavailable(self, cache_service):
        """Test cache get when Redis is unavailable."""
        with patch.object(cache_service, "_get_redis", return_value=None):
            result = await cache_service.get("test_key")

            assert result is None

    @pytest.mark.asyncio
    async def test_set_success(self, cache_service, mock_redis):
        """Test successful cache set."""
        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            await cache_service.set("test_key", {"value": 150.0}, 3600)

            mock_redis.setex.assert_called_once_with(
                "test_key", 3600, '{"value": 150.0}'
            )

    @pytest.mark.asyncio
    async def test_set_redis_unavailable(self, cache_service):
        """Test cache set when Redis is unavailable."""
        with patch.object(cache_service, "_get_redis", return_value=None):
            # Should not raise exception when Redis is unavailable
            await cache_service.set("test_key", {"value": 150.0}, 3600)

    @pytest.mark.asyncio
    async def test_set_failure(self, cache_service, mock_redis):
        """Test cache set failure."""
        mock_redis.setex.side_effect = Exception("Redis error")

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            with pytest.raises(CacheException):
                await cache_service.set("test_key", {"value": 150.0}, 3600)

    @pytest.mark.asyncio
    async def test_delete_success(self, cache_service, mock_redis):
        """Test successful cache delete."""
        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            await cache_service.delete("test_key")

            mock_redis.delete.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_exists_true(self, cache_service, mock_redis):
        """Test cache exists returns True."""
        mock_redis.exists.return_value = 1

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            result = await cache_service.exists("test_key")

            assert result is True
            mock_redis.exists.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_exists_false(self, cache_service, mock_redis):
        """Test cache exists returns False."""
        mock_redis.exists.return_value = 0

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            result = await cache_service.exists("test_key")

            assert result is False

    @pytest.mark.asyncio
    async def test_clear_pattern_success(self, cache_service, mock_redis):
        """Test successful pattern clearing."""
        mock_redis.scan_iter.return_value.__aiter__ = lambda x: iter(
            ["price:AAPL", "price:TSLA"]
        )
        mock_redis.delete.return_value = 2

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            deleted_count = await cache_service.clear_pattern("price:*")

            assert deleted_count == 2
            mock_redis.delete.assert_called_once_with("price:AAPL", "price:TSLA")

    @pytest.mark.asyncio
    async def test_clear_pattern_no_keys(self, cache_service, mock_redis):
        """Test pattern clearing when no keys match."""
        mock_redis.scan_iter.return_value.__aiter__ = lambda x: iter([])

        with patch.object(cache_service, "_get_redis", return_value=mock_redis):
            deleted_count = await cache_service.clear_pattern("price:*")

            assert deleted_count == 0
            mock_redis.delete.assert_not_called()
