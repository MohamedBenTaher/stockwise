import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.schemas.insight import (
    InsightRequest,
    InsightResponse,
    AIInsight,
    RiskSummary,
    DiversificationSuggestion,
    ConcentrationAlert,
)
from app.services.holdings import HoldingService


class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.holding_service = HoldingService(db)

    async def generate_insights(self, request: InsightRequest) -> InsightResponse:
        """Generate AI-powered portfolio insights."""
        start_time = time.time()

        # Get portfolio data
        portfolio_summary = await self.holding_service.get_portfolio_summary(
            request.user_id
        )
        allocation_data = await self.holding_service.get_allocation_data(
            request.user_id
        )

        # Generate AI insights
        prompt = self._build_analysis_prompt(portfolio_summary, allocation_data)
        ai_response = await self._call_groq_api(prompt)

        # Parse and structure the response
        insight = self._parse_ai_response(ai_response, request.user_id)

        processing_time = int((time.time() - start_time) * 1000)

        return InsightResponse(
            insight=insight,
            portfolio_snapshot={
                "portfolio_summary": portfolio_summary.dict(),
                "allocation_data": allocation_data.dict(),
            },
            processing_time_ms=processing_time,
        )

    def _build_analysis_prompt(self, portfolio_summary, allocation_data) -> str:
        """Build the prompt for AI analysis."""

        holdings_summary = []
        for holding in portfolio_summary.holdings:
            holdings_summary.append(
                {
                    "ticker": holding.ticker,
                    "asset_type": holding.asset_type,
                    "weight": (
                        (holding.total_value / portfolio_summary.total_value * 100)
                        if portfolio_summary.total_value > 0
                        else 0
                    ),
                    "profit_loss_pct": holding.profit_loss_percentage,
                    "sector": holding.sector,
                    "country": holding.country,
                }
            )

        prompt = f"""
You are an expert investment advisor. Analyze this portfolio and provide insights:

PORTFOLIO OVERVIEW:
- Total Value: ${portfolio_summary.total_value:,.2f}
- Total P/L: {portfolio_summary.total_profit_loss_percentage:.2f}%
- Number of Holdings: {portfolio_summary.holdings_count}

HOLDINGS:
{json.dumps(holdings_summary, indent=2)}

ALLOCATION BREAKDOWN:
- By Asset Type: {allocation_data.by_asset_type}
- By Sector: {allocation_data.by_sector}  
- By Country: {allocation_data.by_country}

Provide a JSON response with:
{{
  "risk_summary": {{
    "overall_risk_level": "low/medium/high",
    "risk_score": 0-100,
    "main_concerns": ["concern1", "concern2"],
    "volatility_estimate": 0.0-1.0
  }},
  "diversification_suggestions": [
    {{
      "type": "sector/geography/asset_class",
      "current_exposure": 0.0,
      "recommended_exposure": 0.0,
      "suggestion": "specific recommendation",
      "priority": "high/medium/low"
    }}
  ],
  "concentration_alerts": [
    {{
      "type": "single_stock/sector/country",
      "asset_name": "name",
      "concentration_percentage": 0.0,
      "risk_level": "low/medium/high",
      "recommendation": "specific action"
    }}
  ],
  "key_recommendations": ["rec1", "rec2", "rec3"],
  "confidence_score": 0.0-1.0
}}

Focus on actionable insights. Keep language professional but accessible.
"""
        return prompt

    async def _call_groq_api(self, prompt: str) -> str:
        """Call Groq API for free AI inference."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3-70b-instruct",  # Free Groq model
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "frequency_penalty": 0.0,
                        "presence_penalty": 0.0,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a professional investment advisor.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "max_tokens": 2000,
                        "temperature": 0.3,
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    print(f"Groq API error: {response.status_code}")
                    # Try Hugging Face as fallback
                    return await self._call_huggingface_api(prompt)

        except Exception as e:
            print(f"Groq API call failed: {e}")
            # Try Hugging Face as fallback
            return await self._call_huggingface_api(prompt)

    async def _call_huggingface_api(self, prompt: str) -> str:
        """Call Hugging Face Inference API as fallback."""
        try:
            async with httpx.AsyncClient() as client:
                # Use a free model like microsoft/DialoGPT-medium
                response = await client.post(
                    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
                    headers={
                        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
                    },
                    json={
                        "inputs": f"Investment advisor: {prompt[:500]}...",
                        "parameters": {
                            "max_new_tokens": 500,
                            "temperature": 0.3,
                        },
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and result:
                        return result[0].get("generated_text", "")
                    return ""
                else:
                    print(f"HuggingFace API error: {response.status_code}")
                    return self._get_fallback_response()

        except Exception as e:
            print(f"HuggingFace API call failed: {e}")
            return self._get_fallback_response()

    def _parse_ai_response(self, ai_response: str, user_id: int) -> AIInsight:
        """Parse AI response into structured format."""
        try:
            parsed = json.loads(ai_response)

            risk_summary = RiskSummary(**parsed["risk_summary"])

            diversification_suggestions = [
                DiversificationSuggestion(**item)
                for item in parsed.get("diversification_suggestions", [])
            ]

            concentration_alerts = [
                ConcentrationAlert(**item)
                for item in parsed.get("concentration_alerts", [])
            ]

            return AIInsight(
                id=f"insight_{user_id}_{int(time.time())}",
                user_id=user_id,
                generated_at=datetime.utcnow(),
                risk_summary=risk_summary,
                diversification_suggestions=diversification_suggestions,
                concentration_alerts=concentration_alerts,
                key_recommendations=parsed.get("key_recommendations", []),
                confidence_score=parsed.get("confidence_score", 0.8),
            )

        except Exception:
            # Return fallback insight if parsing fails
            return self._get_fallback_insight(user_id)

    def _get_fallback_response(self) -> str:
        """Fallback response when AI call fails."""
        return json.dumps(
            {
                "risk_summary": {
                    "overall_risk_level": "medium",
                    "risk_score": 50,
                    "main_concerns": ["Unable to analyze at this time"],
                    "volatility_estimate": 0.15,
                },
                "diversification_suggestions": [],
                "concentration_alerts": [],
                "key_recommendations": [
                    "Consider diversifying across sectors",
                    "Review position sizes",
                    "Monitor risk exposure",
                ],
                "confidence_score": 0.1,
            }
        )

    def _get_fallback_insight(self, user_id: int) -> AIInsight:
        """Fallback insight when parsing fails."""
        return AIInsight(
            id=f"insight_{user_id}_{int(time.time())}",
            user_id=user_id,
            generated_at=datetime.utcnow(),
            risk_summary=RiskSummary(
                overall_risk_level="medium",
                risk_score=50,
                main_concerns=["Analysis temporarily unavailable"],
                volatility_estimate=0.15,
            ),
            diversification_suggestions=[],
            concentration_alerts=[],
            key_recommendations=[
                "Consider diversifying across sectors",
                "Review position sizes",
                "Monitor risk exposure",
            ],
            confidence_score=0.1,
        )

    async def get_latest_insights(self, user_id: int) -> Optional[InsightResponse]:
        """Get the latest insights for a user."""
        # For now, generate new insights each time
        # In production, you'd store and retrieve from database
        request = InsightRequest(user_id=user_id)
        return await self.generate_insights(request)
