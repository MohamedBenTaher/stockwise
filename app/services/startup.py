"""
Startup service for preloading data into Redis cache.
This service runs on application startup to populate the cache with popular stock data.
"""

import asyncio
import logging
from typing import List, Dict, Any
from app.services.prices import PriceService
from app.services.mock_prices import mock_price_service
import redis.asyncio as redis
from app.config import settings
import json

logger = logging.getLogger(__name__)


class StartupService:
    """Service to handle application startup tasks like cache preloading."""

    def __init__(self):
        self.price_service = PriceService()
        self.redis = None

        # Popular stocks to preload - these are commonly held stocks
        self.popular_tickers = [
            # Tech giants
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "NVDA",
            "TSLA",
            "META",
            "NFLX",
            "ADBE",
            "CRM",
            "ORCL",
            "AMD",
            "INTC",
            "PYPL",
            "UBER",
            "SPOT",
            "ZOOM",
            "SNOW",
            "PLTR",
            "ROKU",
            # Financial
            "BRK.B",
            "JPM",
            "BAC",
            "WFC",
            "GS",
            "MS",
            "C",
            "V",
            "MA",
            "AXP",
            # Healthcare
            "JNJ",
            "UNH",
            "PFE",
            "ABBV",
            "TMO",
            "ABT",
            "BMY",
            "LLY",
            "MRK",
            "AMGN",
            # Consumer
            "WMT",
            "HD",
            "KO",
            "PEP",
            "PG",
            "MCD",
            "NKE",
            "SBUX",
            "DIS",
            "LOW",
            # Energy
            "XOM",
            "CVX",
            "COP",
            "EOG",
            "SLB",
            # Popular ETFs
            "SPY",
            "QQQ",
            "VTI",
            "IWM",
            "VOO",
            "VEA",
            "VWO",
            "BND",
            "GLD",
            "SLV",
            # Crypto (if supported)
            "BTC-USD",
            "ETH-USD",
        ]

    async def _get_redis(self):
        """Get Redis connection."""
        if self.redis is None:
            try:
                self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await self.redis.ping()
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
                self.redis = None
        return self.redis

    async def preload_popular_stocks(self) -> bool:
        """
        Preload popular stock prices into Redis cache.
        This reduces API calls during normal operation.
        """
        try:
            logger.info("🚀 Starting popular stocks preload...")

            redis_client = await self._get_redis()
            if not redis_client:
                logger.warning("❌ Redis not available, skipping preload")
                return False

            # Check if we already have recent cache
            cache_marker_key = "preload:popular_stocks:timestamp"
            last_preload = await redis_client.get(cache_marker_key)

            if last_preload:
                import time

                cache_age = time.time() - float(last_preload)
                # Skip if cache is less than 1 hour old
                if cache_age < 3600:
                    logger.info(
                        f"✅ Popular stocks cache is recent ({cache_age/60:.1f} minutes old), skipping preload"
                    )
                    return True

            logger.info(
                f"📈 Preloading {len(self.popular_tickers)} popular stock prices..."
            )

            # Use mock prices for faster startup and to avoid API rate limits
            successful_loads = 0
            failed_loads = 0

            # Process in smaller batches to avoid overwhelming Redis
            batch_size = 20
            for i in range(0, len(self.popular_tickers), batch_size):
                batch = self.popular_tickers[i : i + batch_size]

                # Prepare batch data for Redis pipeline
                pipeline = redis_client.pipeline()

                for ticker in batch:
                    try:
                        # Use mock price for faster startup
                        mock_price = mock_price_service.get_price(ticker)
                        cache_key = f"price:{ticker}"

                        # Cache for 30 minutes initially
                        pipeline.setex(cache_key, 1800, json.dumps(mock_price))

                        # Also cache stock metadata if available
                        metadata = self._get_static_metadata(ticker)
                        if metadata:
                            metadata_key = f"metadata:{ticker}"
                            pipeline.setex(metadata_key, 7200, json.dumps(metadata))

                        successful_loads += 1

                    except Exception as e:
                        logger.warning(f"Failed to prepare cache for {ticker}: {e}")
                        failed_loads += 1

                # Execute batch
                await pipeline.execute()

                # Small delay between batches
                if i + batch_size < len(self.popular_tickers):
                    await asyncio.sleep(0.1)

            # Set cache marker
            import time

            await redis_client.setex(cache_marker_key, 7200, str(time.time()))

            logger.info(
                f"✅ Preload completed: {successful_loads} successful, {failed_loads} failed"
            )

            # Schedule background refresh of actual prices
            asyncio.create_task(self._refresh_real_prices_background())

            return True

        except Exception as e:
            logger.error(f"❌ Error during popular stocks preload: {e}")
            return False

    def _get_static_metadata(self, ticker: str) -> Dict[str, Any]:
        """Get static metadata for popular stocks to avoid API calls."""
        # Static metadata for popular stocks
        static_metadata = {
            # Tech
            "AAPL": {"sector": "Technology", "country": "US", "exchange": "NASDAQ"},
            "MSFT": {"sector": "Technology", "country": "US", "exchange": "NASDAQ"},
            "GOOGL": {"sector": "Technology", "country": "US", "exchange": "NASDAQ"},
            "AMZN": {
                "sector": "Consumer Cyclical",
                "country": "US",
                "exchange": "NASDAQ",
            },
            "NVDA": {"sector": "Technology", "country": "US", "exchange": "NASDAQ"},
            "TSLA": {
                "sector": "Consumer Cyclical",
                "country": "US",
                "exchange": "NASDAQ",
            },
            "META": {"sector": "Technology", "country": "US", "exchange": "NASDAQ"},
            "NFLX": {
                "sector": "Communication Services",
                "country": "US",
                "exchange": "NASDAQ",
            },
            # Financial
            "BRK.B": {
                "sector": "Financial Services",
                "country": "US",
                "exchange": "NYSE",
            },
            "JPM": {
                "sector": "Financial Services",
                "country": "US",
                "exchange": "NYSE",
            },
            "BAC": {
                "sector": "Financial Services",
                "country": "US",
                "exchange": "NYSE",
            },
            "V": {"sector": "Financial Services", "country": "US", "exchange": "NYSE"},
            "MA": {"sector": "Financial Services", "country": "US", "exchange": "NYSE"},
            # Healthcare
            "JNJ": {"sector": "Healthcare", "country": "US", "exchange": "NYSE"},
            "UNH": {"sector": "Healthcare", "country": "US", "exchange": "NYSE"},
            "PFE": {"sector": "Healthcare", "country": "US", "exchange": "NYSE"},
            # Consumer
            "WMT": {
                "sector": "Consumer Defensive",
                "country": "US",
                "exchange": "NYSE",
            },
            "HD": {"sector": "Consumer Cyclical", "country": "US", "exchange": "NYSE"},
            "KO": {"sector": "Consumer Defensive", "country": "US", "exchange": "NYSE"},
            "PG": {"sector": "Consumer Defensive", "country": "US", "exchange": "NYSE"},
            "DIS": {
                "sector": "Communication Services",
                "country": "US",
                "exchange": "NYSE",
            },
            # Energy
            "XOM": {"sector": "Energy", "country": "US", "exchange": "NYSE"},
            "CVX": {"sector": "Energy", "country": "US", "exchange": "NYSE"},
            # ETFs
            "SPY": {"sector": "ETF", "country": "US", "exchange": "NYSE"},
            "QQQ": {"sector": "ETF", "country": "US", "exchange": "NASDAQ"},
            "VTI": {"sector": "ETF", "country": "US", "exchange": "NYSE"},
            "GLD": {"sector": "Commodities", "country": "US", "exchange": "NYSE"},
            "SLV": {"sector": "Commodities", "country": "US", "exchange": "NYSE"},
            # Crypto
            "BTC-USD": {
                "sector": "Cryptocurrency",
                "country": "Global",
                "exchange": "Crypto",
            },
            "ETH-USD": {
                "sector": "Cryptocurrency",
                "country": "Global",
                "exchange": "Crypto",
            },
        }

        return static_metadata.get(
            ticker, {"sector": "Unknown", "country": "Unknown", "exchange": "Unknown"}
        )

    async def _refresh_real_prices_background(self):
        """
        Background task to refresh cache with real prices from APIs.
        This runs after startup to gradually replace mock prices with real ones.
        """
        try:
            await asyncio.sleep(60)  # Wait 1 minute after startup

            logger.info("🔄 Starting background refresh of real prices...")

            # Refresh in smaller batches over time to avoid rate limits
            batch_size = 5
            for i in range(0, len(self.popular_tickers), batch_size):
                batch = self.popular_tickers[i : i + batch_size]

                try:
                    # This will fetch real prices and cache them
                    await self.price_service.get_multiple_prices(batch)
                    logger.info(
                        f"✅ Refreshed real prices for batch {i//batch_size + 1}"
                    )

                    # Wait between batches to respect rate limits
                    await asyncio.sleep(30)  # 30 seconds between batches

                except Exception as e:
                    logger.warning(
                        f"⚠️ Failed to refresh batch {i//batch_size + 1}: {e}"
                    )
                    await asyncio.sleep(60)  # Wait longer on error

            logger.info("✅ Background price refresh completed")

        except Exception as e:
            logger.error(f"❌ Error in background price refresh: {e}")

    async def preload_all_startup_data(self) -> bool:
        """
        Main startup method to preload all necessary data.
        """
        logger.info("🚀 Starting application data preload...")

        tasks = [
            self.preload_popular_stocks(),
            # Add other preload tasks here as needed
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        success_count = sum(1 for result in results if result is True)
        total_tasks = len(tasks)

        logger.info(
            f"✅ Startup preload completed: {success_count}/{total_tasks} tasks successful"
        )

        return success_count > 0


# Global instance
startup_service = StartupService()
