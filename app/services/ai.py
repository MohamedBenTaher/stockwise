import httpx
from typing import Optional
from datetime import datetime
import json
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.schemas.insight import (
    InsightRequestInternal,
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
        # Cache model availability to avoid repeated checks
        self._groq_model_available: Optional[bool] = None
        self._hf_model_available: Optional[bool] = None

    async def generate_insights(
        self, request: InsightRequestInternal
    ) -> InsightResponse:
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

    def _build_analysis_prompt(
        self,
        portfolio_summary,
        allocation_data,
    ) -> str:
        """Build the prompt for AI analysis."""

        holdings_summary = []
        for holding in portfolio_summary.holdings:
            # compute weight separately to avoid long inline expressions
            if portfolio_summary.total_value > 0:
                weight = (holding.total_value / portfolio_summary.total_value) * 100
            else:
                weight = 0
            holdings_summary.append(
                {
                    "ticker": holding.ticker,
                    "asset_type": holding.asset_type,
                    "weight": weight,
                    "profit_loss_pct": holding.profit_loss_percentage,
                    "sector": holding.sector,
                    "country": holding.country,
                }
            )

        parts = [
            "You are an expert investment advisor. Analyze this portfolio",
            "and provide insights:",
            "",
            "PORTFOLIO OVERVIEW:",
            f"- Total Value: ${portfolio_summary.total_value:,.2f}",
            (f"- Total P/L: " f"{portfolio_summary.total_profit_loss_percentage:.2f}%"),
            f"- Number of Holdings: {portfolio_summary.holdings_count}",
            "",
            "HOLDINGS:",
            json.dumps(holdings_summary, indent=2),
            "",
            "ALLOCATION BREAKDOWN:",
            f"- By Asset Type: {allocation_data.by_asset_type}",
            f"- By Sector: {allocation_data.by_sector}",
            f"- By Country: {allocation_data.by_country}",
            "",
            "Provide a JSON response with:",
            "{",
            '  "risk_summary": {',
            '    "overall_risk_level": "low/medium/high",',
            '    "risk_score": 0-100,',
            '    "main_concerns": ["concern1", "concern2"],',
            '    "volatility_estimate": 0.0-1.0',
            "  },",
            '  "diversification_suggestions": [',
            "    {",
            '      "type": "sector/geography/asset_class",',
            '      "current_exposure": 0.0,',
            '      "recommended_exposure": 0.0,',
            '      "suggestion": "specific recommendation",',
            '      "priority": "high/medium/low"',
            "    }",
            "  ],",
            '  "concentration_alerts": [',
            "    {",
            '      "type": "single_stock/sector/country",',
            '      "asset_name": "name",',
            '      "concentration_percentage": 0.0,',
            '      "risk_level": "low/medium/high",',
            '      "recommendation": "specific action"',
            "    }",
            "  ],",
            '  "key_recommendations": ["rec1", "rec2", "rec3"],',
            '  "confidence_score": 0.0-1.0',
            "}",
            "",
            "Focus on actionable insights. Keep language professional",
            "but accessible.",
        ]

        prompt = "\n".join(parts)
        return prompt

    async def _call_groq_api(self, prompt: str) -> str:
        """Call Groq API for free AI inference."""
        # Check model availability (cached)
        if self._groq_model_available is None:
            self._groq_model_available = await self._check_groq_model_available()
        if not self._groq_model_available:
            print("Groq model unavailable or no access; falling back to HF")
            return await self._call_huggingface_api(prompt)

        # Quick sanity check for API key
        if not settings.GROQ_API_KEY:
            print("Groq API error: GROQ_API_KEY is not set in " "environment/settings")
            return await self._call_huggingface_api(prompt)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": (f"Bearer {settings.GROQ_API_KEY}"),
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "frequency_penalty": 0.0,
                        "presence_penalty": 0.0,
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are a professional investment" " advisor."
                                ),
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "max_tokens": 2000,
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    print(f"Groq API result: {result}")
                    return result["choices"][0]["message"]["content"]

                # Print response body for diagnosis
                try:
                    body = response.text
                except Exception:
                    body = "<unreadable response body>"
                print(f"Groq API error: status={response.status_code}, " f"body={body}")

                # If model not found, mark unavailable to avoid retries
                try:
                    data = response.json()
                    if (
                        isinstance(data, dict)
                        and data.get("error", {}).get("code") == "model_not_found"
                    ):
                        self._groq_model_available = False
                except Exception:
                    pass

                # Try Hugging Face as fallback
                return await self._call_huggingface_api(prompt)

        except Exception as e:
            print(f"Groq API call failed: {e}")
            return await self._call_huggingface_api(prompt)

    async def _call_huggingface_api(self, prompt: str) -> str:
        """Call Hugging Face Inference API as fallback."""
        # Sanity check for HF key
        if not settings.HUGGINGFACE_API_KEY:
            print(
                "HuggingFace API error: HUGGINGFACE_API_KEY is not "
                "set in environment/settings"
            )
            return self._get_fallback_response()

        # Check HF model availability (cached)
        if self._hf_model_available is None:
            self._hf_model_available = await self._check_hf_model_available()
        if not self._hf_model_available:
            print("HuggingFace model unavailable; returning fallback")
            return self._get_fallback_response()

        try:
            async with httpx.AsyncClient() as client:
                # Use configured model
                url = (
                    "https://api-inference.huggingface.co/models/"
                    f"{settings.HUGGINGFACE_MODEL}"
                )
                response = await client.post(
                    url,
                    headers={
                        "Authorization": (f"Bearer {settings.HUGGINGFACE_API_KEY}"),
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
                    print(f"HuggingFace API result: {result}")
                    if isinstance(result, list) and result:
                        return result[0].get("generated_text", "")
                    if isinstance(result, dict) and result.get("generated_text"):
                        return result.get("generated_text")
                    return ""

                try:
                    body = response.text
                except Exception:
                    body = "<unreadable response body>"
                print(
                    f"HuggingFace API error: status={response.status_code}, "
                    f"body={body}"
                )

                # If not found, avoid repeated attempts
                if response.status_code == 404:
                    self._hf_model_available = False
                return self._get_fallback_response()

        except Exception as e:
            print(f"HuggingFace API call failed: {e}")
            return self._get_fallback_response()

    async def _check_groq_model_available(self) -> bool:
        """Lightweight preflight to check Groq model availability.

        Returns True if the configured model appears reachable with the given
        API key.
        """
        if not settings.GROQ_API_KEY:
            return False
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": (f"Bearer {settings.GROQ_API_KEY}")},
                    timeout=10.0,
                )
                if resp.status_code != 200:
                    return False
                data = resp.json()
                raw = data.get("data", [])
                model_ids = [m.get("id") for m in raw if m.get("id")]
                return settings.GROQ_MODEL in model_ids
        except Exception:
            return False

    async def _check_hf_model_available(self) -> bool:
        """Lightweight preflight to check HuggingFace model availability."""
        if not settings.HUGGINGFACE_API_KEY:
            return False
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    (
                        "https://api-inference.huggingface.co/models/"
                        f"{settings.HUGGINGFACE_MODEL}"
                    ),
                    headers={
                        "Authorization": (f"Bearer {settings.HUGGINGFACE_API_KEY}")
                    },
                    timeout=10.0,
                )
                return resp.status_code == 200
        except Exception:
            return False

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
        request = InsightRequestInternal(user_id=user_id)
        return await self.generate_insights(request)
