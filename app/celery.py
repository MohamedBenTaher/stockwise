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
    "fetch-and-cache-bulk-prices-every-24h": {
        "task": "fetch_and_cache_bulk_prices",
        "schedule": 60 * 60 * 24,  # every 24 hours
    },
}

# --- Celery Task for Bulk Price Fetching ---


@celery.task(name="fetch_and_cache_bulk_prices")
def fetch_and_cache_bulk_prices_task():
    """Celery task to fetch and cache all prices in Redis."""
    from app.services.bulk_price_service import bulk_price_service
    import asyncio
    import logging

    logger = logging.getLogger("celery")
    try:
        # Create a new event loop for this task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Run the async functions
        prices = loop.run_until_complete(bulk_price_service.fetch_bulk_prices())
        loop.run_until_complete(bulk_price_service.cache_bulk_prices(prices))

        logger.info(f"[Celery] Bulk prices fetched and cached: {len(prices)} assets.")
        return {"status": "success", "count": len(prices)}
    except Exception as e:
        logger.error(f"[Celery] Failed to fetch/cache bulk prices: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        # Clean up the event loop
        if "loop" in locals():
            loop.close()


# Utility to trigger the task from FastAPI or startup
def trigger_bulk_price_fetch():
    fetch_and_cache_bulk_prices_task.delay()
