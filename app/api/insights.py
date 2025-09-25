from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.insight import (
    InsightRequest,
    InsightRequestInternal,
    InsightResponse,
)
from app.services.ai import AIService
from app.services.auth import get_current_user
from app.schemas.user import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=InsightResponse)
async def generate_insights(
    request: InsightRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI-powered portfolio insights."""
    # Create a complete request with the current user's ID
    internal_request = InsightRequestInternal(
        user_id=current_user.id, analysis_type=request.analysis_type
    )

    ai_service = AIService(db)
    try:
        logger.info("Generate insights request for user_id=%s", current_user.id)
        result = await ai_service.generate_insights(internal_request)
        logger.info(
            "Generated insights for user_id=%s processing_time_ms=%s",
            current_user.id,
            result.processing_time_ms,
        )
        return result
    except Exception as exc:
        logger.exception(
            "Error generating insights for user_id=%s: %s",
            current_user.id,
            exc,
        )
        raise HTTPException(status_code=500, detail="Failed to generate insights")


@router.get("/latest", response_model=InsightResponse)
async def get_latest_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the latest insights for the current user."""
    ai_service = AIService(db)
    try:
        logger.info("Get latest insights request for user_id=%s", current_user.id)
        insights = await ai_service.get_latest_insights(current_user.id)
        if not insights:
            logger.info("No insights found for user_id=%s", current_user.id)
            raise HTTPException(
                status_code=404,
                detail="No insights found. Generate insights first.",
            )
        logger.info(
            "Returning latest insights for user_id=%s processing_time_ms=%s",
            current_user.id,
            insights.processing_time_ms,
        )
        return insights
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Error fetching latest insights for user_id=%s: %s",
            current_user.id,
            exc,
        )
        raise HTTPException(status_code=500, detail="Failed to fetch latest insights")
