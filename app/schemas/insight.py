from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime


class InsightRequest(BaseModel):
    analysis_type: str = "full"  # full, risk, diversification


class InsightRequestInternal(BaseModel):
    user_id: int
    analysis_type: str = "full"  # full, risk, diversification


class RiskSummary(BaseModel):
    overall_risk_level: str  # low, medium, high
    risk_score: float  # 0-100
    main_concerns: List[str]
    volatility_estimate: float


class DiversificationSuggestion(BaseModel):
    type: str  # sector, geography, asset_class
    current_exposure: float
    recommended_exposure: float
    suggestion: str
    priority: str  # high, medium, low


class ConcentrationAlert(BaseModel):
    type: str  # single_stock, sector, country
    asset_name: str
    concentration_percentage: float
    risk_level: str
    recommendation: str


class AIInsight(BaseModel):
    id: str
    user_id: int
    generated_at: datetime
    risk_summary: RiskSummary
    diversification_suggestions: List[DiversificationSuggestion]
    concentration_alerts: List[ConcentrationAlert]
    key_recommendations: List[str]
    confidence_score: float  # 0-1


class InsightResponse(BaseModel):
    insight: AIInsight
    portfolio_snapshot: Dict[str, Any]
    processing_time_ms: int
