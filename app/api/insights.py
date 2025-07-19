from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.insight import InsightRequest, InsightResponse
from app.services.ai import AIService
from app.services.auth import get_current_user
from app.schemas.user import User

router = APIRouter()


@router.post("/", response_model=InsightResponse)
async def generate_insights(
    request: InsightRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI-powered portfolio insights."""
    # Ensure user can only generate insights for their own portfolio
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to generate insights for this user"
        )

    ai_service = AIService(db)
    return await ai_service.generate_insights(request)


@router.get("/latest", response_model=InsightResponse)
async def get_latest_insights(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get the latest insights for the current user."""
    ai_service = AIService(db)
    insights = await ai_service.get_latest_insights(current_user.id)
    if not insights:
        raise HTTPException(
            status_code=404, detail="No insights found. Generate insights first."
        )
    return insights
