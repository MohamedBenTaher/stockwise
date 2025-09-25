import os
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from app.api.holdings import router as holdings_router
from app.api.insights import router as insights_router
from app.api.auth import router as auth_router
from app.api.risk import router as risk_router
from app.api.stocks import router as stocks_router
from app.api.charts import router as charts_router
from app.api.news import router as news_router
from app.config import settings
from app.services.bulk_price_service import bulk_price_service
import logging
from app.celery import trigger_bulk_price_fetch

logger_ = logging.getLogger(__name__)

app = FastAPI(
    title="StockWise API",
    description="AI-powered portfolio dashboard API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# Debug middleware: log cookies/headers for risk endpoints to help diagnose
# cases where auth cookies are not sent and requests return 401.
@app.middleware("http")
async def log_risk_requests(request, call_next):
    try:
        path = request.url.path or ""
        if path.startswith(f"{settings.API_V1_STR}/risk"):
            # Log basic request info for debugging
            logger_.info(
                "[DEBUG] Incoming risk request: %s %s" % (request.method, path)
            )
            logger_.info("[DEBUG] Cookies: %s" % (dict(request.cookies),))
            # Optionally log origin header
            origin = request.headers.get("origin")
            logger_.info(f"[DEBUG] Origin: {origin}")
    except Exception as e:
        logger_.warning(f"[DEBUG] Failed to log risk request details: {e}")

    response = await call_next(request)
    return response


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger_.info("🚀 Starting StockWise API...")

    try:
        # Check if cache is already populated (don't block startup)
        cached_prices = await bulk_price_service.get_cached_prices()
        if cached_prices:
            logger_.info("✅ Found %d cached prices, API ready" % (len(cached_prices),))
        else:
            logger_.info("📊 No cached prices found, triggering background fetch...")
            # Non-blocking background trigger
            trigger_bulk_price_fetch()

        # Fast, non-blocking startup tasks only
        logger_.info("⚡ Running fast startup tasks...")
        # Add any other fast startup tasks here

        logger_.info("✅ StockWise API started successfully")

    except Exception as e:
        logger_.error(f"❌ Startup warning: {e}")
        # Don't fail startup completely, just log the error


# Include routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)
app.include_router(
    holdings_router,
    prefix=f"{settings.API_V1_STR}/holdings",
    tags=["holdings"],
)
app.include_router(
    insights_router,
    prefix=f"{settings.API_V1_STR}/insights",
    tags=["insights"],
)
app.include_router(
    risk_router,
    prefix=f"{settings.API_V1_STR}/risk",
    tags=["risk"],
)
app.include_router(
    stocks_router,
    prefix=f"{settings.API_V1_STR}/stocks",
    tags=["stocks"],
)
app.include_router(
    charts_router,
    prefix=f"{settings.API_V1_STR}/charts",
    tags=["charts"],
)
app.include_router(
    news_router,
    prefix=f"{settings.API_V1_STR}/news",
    tags=["news"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to StockWise API", "version": "1.0.0"}


@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_schema():
    """Serve OpenAPI schema for frontend type generation."""
    return app.openapi()


@app.get("/health")
async def health_check():
    """Health check endpoint with cache status."""
    try:
        # Check if cache is working
        redis_client = await bulk_price_service.get_redis()
        cache_status = "connected" if redis_client else "disconnected"

        # Get some basic cache stats
        cached_prices = await bulk_price_service.get_cached_prices()
        cache_count = len(cached_prices) if cached_prices else 0

        return {
            "status": "healthy",
            "cache_status": cache_status,
            "cached_prices_count": cache_count,
            "version": "1.0.0",
        }
    except Exception as e:
        return {
            "status": "healthy",
            "cache_status": "error",
            "cache_error": str(e),
            "version": "1.0.0",
        }


@app.get("/{full_path:path}", include_in_schema=False, response_model=None)
async def catch_all(request: Request):
    """Serve the index.html for frontend routes or static files."""

    # Azure Easy Auth endpoints should be handled by Azure, not our app
    if request.path_params["full_path"].startswith(".auth/"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "detail": "This endpoint should be handled by Azure Easy Auth",
            },
        )

    ui_directory_path = Path(settings.UI_DIRECTORY).resolve()
    relative_file_path = request.path_params["full_path"]
    file_path = ui_directory_path / relative_file_path

    # Security check to prevent directory traversal
    if os.path.commonpath([ui_directory_path, file_path]) != str(ui_directory_path):
        logger_.warning(f"Forbidden access to {file_path}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Access forbidden"},
        )

    # If the file exists, serve it directly
    if Path.is_file(file_path):
        return FileResponse(file_path)

    # For all other routes, serve the index.html (SPA routing)
    index_path = ui_directory_path / "index.html"
    if not Path.is_file(index_path):
        logger_.error(f"UI index file not found at {index_path}")
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Frontend UI files not found"},
        )

    return FileResponse(index_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
