from celery import Celery
from app.config import settings

celery = Celery(
    "stockwise",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# --- Celery Beat Schedule for Periodic Tasks ---
celery.conf.beat_schedule = {
    # Price fetching - every 2 hours during market hours
    "fetch-and-cache-bulk-prices": {
        "task": "fetch_and_cache_bulk_prices",
        "schedule": 60 * 60 * 2,  # every 2 hours
    },
    # News fetching - every 30 minutes
    "fetch-and-cache-news": {
        "task": "fetch_and_cache_news",
        "schedule": 60 * 30,  # every 30 minutes
    },
}

# --- Celery Task for Bulk Price Fetching ---


@celery.task(name="fetch_and_cache_bulk_prices", bind=True)
def fetch_and_cache_bulk_prices_task(self):
    """Celery task to fetch and cache all prices in Redis - NON-BLOCKING."""
    import asyncio
    import logging
    import time
    from concurrent.futures import ThreadPoolExecutor

    logger = logging.getLogger("celery")

    def run_async_task():
        """Run the async task in a separate thread to avoid blocking."""
        try:
            # Import here to avoid circular imports
            from app.services.bulk_price_service import bulk_price_service

            # Create new event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                # Run with timeout to prevent hanging
                start_time = time.time()

                # Fetch prices with rate limiting and error handling
                prices = loop.run_until_complete(
                    asyncio.wait_for(
                        bulk_price_service.fetch_bulk_prices_safe(),
                        timeout=300,  # 5 minutes max
                    )
                )

                # Cache the results
                cache_success = loop.run_until_complete(
                    asyncio.wait_for(
                        bulk_price_service.cache_bulk_prices(prices),
                        timeout=30,  # 30 seconds max for caching
                    )
                )

                elapsed = time.time() - start_time
                count = len(prices)
                logger.info(
                    f"[Celery] Task completed in {elapsed:.1f}s: "
                    f"{count} prices, cache_success={cache_success}"
                )

                return {
                    "status": "success",
                    "count": count,
                    "cache_success": cache_success,
                    "elapsed_seconds": elapsed,
                }

            finally:
                loop.close()

        except asyncio.TimeoutError:
            logger.error("[Celery] Task timed out")
            return {"status": "error", "error": "Task timed out"}
        except Exception as e:
            logger.error(f"[Celery] Task failed: {e}")
            return {"status": "error", "error": str(e)}

    try:
        # Run in thread pool to prevent blocking the worker
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_async_task)
            result = future.result(timeout=360)  # 6 minutes total timeout
            return result

    except Exception as e:
        logger.error(f"[Celery] Executor failed: {e}")
        return {"status": "error", "error": str(e)}


@celery.task(name="fetch_and_cache_news", bind=True)
def fetch_and_cache_news_task(self):
    """Celery task to fetch and cache news articles."""
    import asyncio
    import logging
    import time
    from concurrent.futures import ThreadPoolExecutor

    logger = logging.getLogger("celery")

    def run_news_fetch():
        """Run news fetch in separate thread."""
        try:
            from app.services.news_optimized import optimized_news_service

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                start_time = time.time()

                # Fetch and cache news
                loop.run_until_complete(
                    asyncio.wait_for(
                        optimized_news_service._background_fetch_and_cache(),
                        timeout=120,  # 2 minutes max
                    )
                )

                elapsed = time.time() - start_time
                logger.info(f"[Celery] News fetch completed in {elapsed:.1f}s")

                return {"status": "success", "elapsed_seconds": elapsed}

            finally:
                loop.close()

        except asyncio.TimeoutError:
            logger.error("[Celery] News fetch timed out")
            return {"status": "error", "error": "News fetch timed out"}
        except Exception as e:
            logger.error(f"[Celery] News fetch failed: {e}")
            return {"status": "error", "error": str(e)}

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_news_fetch)
            result = future.result(timeout=150)  # 2.5 minutes total timeout
            return result

    except Exception as e:
        logger.error(f"[Celery] News executor failed: {e}")
        return {"status": "error", "error": str(e)}


# Utility to trigger the task from FastAPI or startup
def trigger_bulk_price_fetch():
    fetch_and_cache_bulk_prices_task.delay()


# Utility to trigger news fetch
def trigger_news_fetch():
    fetch_and_cache_news_task.delay()
