"""
Startup service for preloading data into Redis cache.
This service runs on application startup to populate the cache with popular stock data.
"""

import asyncio
import logging
from typing import List, Dict, Any
from app.services.bulk_price_service import bulk_price_service
import redis.asyncio as redis
from app.config import settings
import json

logger = logging.getLogger(__name__)


def on_startup_trigger_bulk_price_fetch():
    """Trigger the Celery task to fetch and cache prices on startup."""
    logger.info("🚀 Triggering Celery background price fetch task...")
    from app.celery import trigger_bulk_price_fetch

    trigger_bulk_price_fetch()


class StartupService:
    """Service to handle application startup tasks like cache preloading."""

    def __init__(self):
        self.bulk_service = bulk_price_service

    async def initialize_price_cache(self) -> bool:
        """Initialize the price cache on startup."""
        try:
            logger.info("🚀 Initializing price cache on startup...")

            # Check if cache already exists and is fresh
            cached_prices = await self.bulk_service.get_cached_prices()
            if cached_prices and len(cached_prices) > 100:
                logger.info("✅ Fresh cache already exists, skipping warm-up")
                return True

            # Warm the cache
            success = await self.bulk_service.warm_cache()
            if success:
                logger.info("✅ Price cache initialized successfully")
            else:
                logger.warning("⚠️ Price cache initialization failed, using fallbacks")

            return success

        except Exception as e:
            logger.error(f"❌ Cache initialization error: {e}")
            return False

    async def preload_all_startup_data(self) -> bool:
        """Main startup method to preload all necessary data."""
        logger.info("🚀 Starting application data preload...")

        # Initialize bulk price cache
        cache_success = await self.initialize_price_cache()

        # Trigger background Celery task for continuous updates
        try:
            on_startup_trigger_bulk_price_fetch()
            logger.info("✅ Background price updates scheduled")
        except Exception as e:
            logger.warning(f"⚠️ Failed to schedule background updates: {e}")

        if cache_success:
            logger.info("✅ Startup preload completed successfully")
        else:
            logger.warning("⚠️ Startup preload completed with warnings")

        return cache_success


# Global instance
startup_service = StartupService()
