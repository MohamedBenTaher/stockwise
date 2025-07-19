import os
from fastapi import FastAPI, Path, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from app.api.holdings import router as holdings_router
from app.api.insights import router as insights_router
from app.api.auth import router as auth_router
from app.api.risk import router as risk_router
from app.config import settings
import logging


logger_ = logging.getLogger(__name__)

app = FastAPI(
    title="StockWise API",
    description="AI-powered portfolio dashboard API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",  # Make sure this is publicly accessible
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(
    holdings_router, prefix=f"{settings.API_V1_STR}/holdings", tags=["holdings"]
)
app.include_router(
    insights_router, prefix=f"{settings.API_V1_STR}/insights", tags=["insights"]
)
app.include_router(risk_router, prefix=f"{settings.API_V1_STR}/risk", tags=["risk"])


@app.get("/")
async def root():
    return {"message": "Welcome to StockWise API", "version": "1.0.0"}


@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_schema():
    """Serve OpenAPI schema for frontend type generation."""
    return app.openapi()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/{full_path:path}", include_in_schema=False, response_model=None)
async def catch_all(request: Request):
    """Serve the index.html for frontend routes or static files.

    This handler serves:
    1. Static files if they exist in the UI directory
    2. index.html for all other frontend routes (for SPA routing)

    Note: Azure Easy Auth endpoints (/.auth/*) should be handled by Azure App Service
    before requests reach this handler. If they do reach here, we return a 404.
    """

    # Azure Easy Auth endpoints should be handled by Azure, not our app
    if request.path_params["full_path"].startswith(".auth/"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "This endpoint should be handled by Azure Easy Auth"},
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
