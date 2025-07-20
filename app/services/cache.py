"""
Cache service implementation with Redis backend.
"""

import json
import logging
from typing import Optional, Any
import redis.asyncio as redis

from app.config import settings
from app.core.interfaces import ICacheRepository
from app.core.exceptions import CacheException

logger = logging.getLogger(__name__)


class RedisCacheService(ICacheRepository):
    """Redis-based cache service implementation."""

    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def _get_redis(self) -> Optional[redis.Redis]:
        """Get Redis connection."""
        if self._redis is None:
            try:
                self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await self._redis.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
                self._redis = None
        return self._redis

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                value = await redis_client.get(key)
                if value:
                    return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for {key}: {e}")
        return None

    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Set value in cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                serialized_value = json.dumps(value, default=str)
                await redis_client.setex(key, ttl, serialized_value)
                logger.debug(f"Cached {key} with TTL {ttl}")
        except Exception as e:
            logger.warning(f"Cache set error for {key}: {e}")
            raise CacheException(f"Failed to cache {key}: {e}")

    async def delete(self, key: str) -> None:
        """Delete value from cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                await redis_client.delete(key)
                logger.debug(f"Deleted cache key: {key}")
        except Exception as e:
            logger.warning(f"Cache delete error for {key}: {e}")

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                return bool(await redis_client.exists(key))
        except Exception as e:
            logger.warning(f"Cache exists check error for {key}: {e}")
        return False

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                keys = []
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)

                if keys:
                    deleted = await redis_client.delete(*keys)
                    logger.info(f"Cleared {deleted} keys matching {pattern}")
                    return deleted
        except Exception as e:
            logger.error(f"Error clearing cache pattern {pattern}: {e}")
        return 0


# Global cache service instance
cache_service = RedisCacheService()
